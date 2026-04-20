"""
Video Processor

Extracts frames from a video file at a configurable FPS,
runs detection + RI estimation on each frame,
and saves results to the database.

GPS handling:
  - If a GPS array is provided: interpolate lat/lon per frame
  - If no GPS: generate a synthetic corridor along a configurable
    start→end point (useful for demos without GPS data)
"""

import cv2
import uuid
import asyncio
import os
from datetime import datetime, timezone
from typing import List, Optional, Dict

from detector import detect_road_objects
from ri_estimator import estimate_ri, classify_status
from database import insert_detection, update_session_progress

# ── GPS helpers ───────────────────────────────────────────────────────────────

def interpolate_gps(gps_points: List[Dict], frame_no: int, fps: float, video_fps: float) -> Dict:
    """
    Linearly interpolate GPS coordinates for a given frame number.
    gps_points: list of {lat, lon, timestamp} sorted by timestamp
    """
    if not gps_points:
        return {"lat": 0.0, "lon": 0.0}

    # Time in seconds from start of video
    t = frame_no / video_fps

    # Find surrounding GPS points
    for i in range(len(gps_points) - 1):
        t0 = gps_points[i].get("t", i)
        t1 = gps_points[i + 1].get("t", i + 1)
        if t0 <= t <= t1:
            ratio = (t - t0) / (t1 - t0) if t1 != t0 else 0
            lat = gps_points[i]["lat"] + ratio * (gps_points[i + 1]["lat"] - gps_points[i]["lat"])
            lon = gps_points[i]["lon"] + ratio * (gps_points[i + 1]["lon"] - gps_points[i]["lon"])
            return {"lat": round(lat, 6), "lon": round(lon, 6)}

    # Extrapolate from last point
    last = gps_points[-1]
    return {"lat": last["lat"], "lon": last["lon"]}


def generate_synthetic_gps(frame_no: int, total_frames: int,
                            start_lat=18.520, start_lon=73.856,
                            end_lat=18.570, end_lon=73.950) -> Dict:
    """Generate synthetic GPS for demo when no GPS data is available."""
    ratio = frame_no / max(total_frames - 1, 1)
    lat = start_lat + ratio * (end_lat - start_lat)
    lon = start_lon + ratio * (end_lon - start_lon)
    return {"lat": round(lat, 6), "lon": round(lon, 6)}


def compute_km_marker(frame_no: int, total_frames: int, total_km: float = 19.4) -> float:
    """Estimate km marker from frame position."""
    return round((frame_no / max(total_frames - 1, 1)) * total_km, 2)


# ── Main processor ────────────────────────────────────────────────────────────

async def process_video(
    video_path: str,
    session_id: str,
    weather: str,
    gps_points: Optional[List[Dict]] = None,
    sample_fps: float = 1.0,          # process 1 frame per second by default
    progress_callback=None,
):
    """
    Process a video file end-to-end:
      1. Open video with OpenCV
      2. Extract frames at sample_fps
      3. Detect + estimate RI per frame
      4. Save to DB
      5. Update session progress

    Returns total number of detections created.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    video_fps   = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_s  = total_frames / video_fps

    # How many frames to skip between samples
    frame_interval = max(1, int(video_fps / sample_fps))
    expected_samples = int(total_frames / frame_interval)

    # Ensure crops directory exists
    crops_dir = os.path.join(os.path.dirname(__file__), "crops")
    os.makedirs(crops_dir, exist_ok=True)

    print(f"[Processor] Video: {video_path}")
    print(f"[Processor] FPS={video_fps:.1f}, Frames={total_frames}, Duration={duration_s:.1f}s")
    print(f"[Processor] Sampling 1 frame every {frame_interval} frames ({sample_fps} FPS)")

    detection_count = 0
    sample_no = 0
    frame_no = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_no % frame_interval == 0:
            # Get GPS for this frame
            if gps_points:
                gps = interpolate_gps(gps_points, frame_no, sample_fps, video_fps)
            else:
                gps = generate_synthetic_gps(frame_no, total_frames)

            km = compute_km_marker(frame_no, total_frames)

            # Timestamp for this frame
            frame_time = datetime.now(timezone.utc).isoformat()

            try:
                # Run detection (blocking — wrap in executor for async)
                loop = asyncio.get_event_loop()
                detections = await loop.run_in_executor(
                    None, detect_road_objects, frame
                )

                for det in detections:
                    # Crop the detected region
                    crop = frame[det["y1"]:det["y2"], det["x1"]:det["x2"]]
                    if crop.size == 0:
                        continue

                    # RI estimation
                    ri_score = await loop.run_in_executor(
                        None, estimate_ri, crop, det["label"], weather
                    )
                    status = classify_status(ri_score, det["label"])

                    det_id = f"{session_id[:8]}-f{frame_no:05d}-{det['label'][:2]}-{uuid.uuid4().hex[:4]}"

                    # Save the cropped image
                    crop_filename = f"{det_id}.jpg"
                    crop_path = os.path.join(crops_dir, crop_filename)
                    cv2.imwrite(crop_path, crop)

                    await insert_detection({
                        "id": det_id,
                        "session_id": session_id,
                        "label": det["label"],
                        "ri_score": ri_score,
                        "status": status,
                        "confidence": round(det["confidence"], 3),
                        "weather": weather,
                        "lat": gps["lat"],
                        "lon": gps["lon"],
                        "km_marker": km,
                        "frame_no": frame_no,
                        "captured_at": frame_time,
                        "image_path": f"/crops/{crop_filename}"
                    })
                    detection_count += 1

            except Exception as e:
                print(f"[Processor] Frame {frame_no} error: {e}")

            sample_no += 1

            # Update progress every 5 samples
            if sample_no % 5 == 0:
                await update_session_progress(session_id, sample_no)
                if progress_callback:
                    await progress_callback(sample_no, expected_samples)
                print(f"[Processor] Progress: {sample_no}/{expected_samples} samples, {detection_count} detections")

        frame_no += 1

    cap.release()
    await update_session_progress(session_id, sample_no, status="done")
    print(f"[Processor] ✅ Done. Total detections: {detection_count}")
    return detection_count
