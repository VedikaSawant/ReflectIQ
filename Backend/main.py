"""
RetroScan AI — FastAPI Backend
================================
Run with:  uvicorn main:app --reload --port 8000
Swagger:   http://localhost:8000/docs
"""

import asyncio
import csv
import io
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

import database as db
from video_processor import process_video

# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="RetroScan AI API",
    description="AI-powered retroreflectivity assessment for NHAI road infrastructure",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure crops directory exists
crops_dir = os.path.join(os.path.dirname(__file__), "crops")
os.makedirs(crops_dir, exist_ok=True)
app.mount("/crops", StaticFiles(directory=crops_dir), name="crops")

# In-memory progress tracker { session_id: {processed, total, status} }
_progress: dict = {}


@app.on_event("startup")
async def startup():
    await db.init_db()
    print("[API] Database initialised ✅")


# ─── Health ──────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["System"])
async def health():
    import torch
    return {
        "status": "ok",
        "gpu": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
    }


# ─── Process video from LOCAL FILE PATH (no upload needed) ───────────────────

@app.post("/api/process-local", tags=["Processing"])
async def process_local_video(
    background_tasks: BackgroundTasks,
    video_path: str = Form(..., description="Absolute path to video file on this machine"),
    weather: str = Form("night_dry", description="Weather condition tag"),
    gps_json: Optional[str] = Form(None, description="JSON array of {lat,lon,t} GPS points"),
    sample_fps: float = Form(1.0, description="Frames per second to sample"),
):
    """
    Process a video file already on disk.
    Just provide the full local path — no upload needed.
    """
    if not os.path.isfile(video_path):
        raise HTTPException(status_code=400, detail=f"File not found: {video_path}")

    session_id = str(uuid.uuid4())
    gps_points = json.loads(gps_json) if gps_json else None

    await db.insert_session({
        "id": session_id,
        "video_name": os.path.basename(video_path),
        "weather": weather,
        "total_frames": 0,
        "processed_frames": 0,
        "status": "processing",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    _progress[session_id] = {"processed": 0, "total": -1, "status": "processing"}

    async def run():
        try:
            await process_video(
                video_path=video_path,
                session_id=session_id,
                weather=weather,
                gps_points=gps_points,
                sample_fps=sample_fps,
            )
            _progress[session_id]["status"] = "done"
        except Exception as e:
            print(f"[API] Session {session_id} failed: {e}")
            _progress[session_id]["status"] = "error"
            await db.update_session_progress(session_id, 0, "error")

    background_tasks.add_task(run)

    return {
        "session_id": session_id,
        "status": "processing",
        "message": f"Processing started for: {os.path.basename(video_path)}",
        "poll_url": f"/api/sessions/{session_id}/progress",
    }


# ─── Process video via FILE UPLOAD ───────────────────────────────────────────

@app.post("/api/process-video", tags=["Processing"])
async def process_uploaded_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(..., description="Dashcam video file (MP4/AVI/MOV)"),
    weather: str = Form("night_dry"),
    gps_json: Optional[str] = Form(None),
    sample_fps: float = Form(1.0),
):
    """Upload a video file to process."""
    session_id = str(uuid.uuid4())
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    video_path = os.path.join(upload_dir, f"{session_id}_{video.filename}")

    # Save upload to disk
    content = await video.read()
    with open(video_path, "wb") as f:
        f.write(content)

    gps_points = json.loads(gps_json) if gps_json else None

    await db.insert_session({
        "id": session_id,
        "video_name": video.filename,
        "weather": weather,
        "total_frames": 0,
        "processed_frames": 0,
        "status": "processing",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    _progress[session_id] = {"processed": 0, "total": -1, "status": "processing"}

    async def run():
        try:
            await process_video(video_path, session_id, weather, gps_points, sample_fps)
            _progress[session_id]["status"] = "done"
        except Exception as e:
            print(f"[API] Error: {e}")
            _progress[session_id]["status"] = "error"

    background_tasks.add_task(run)

    return {
        "session_id": session_id,
        "status": "processing",
        "poll_url": f"/api/sessions/{session_id}/progress",
    }


# ─── Session management ───────────────────────────────────────────────────────

@app.get("/api/sessions", tags=["Sessions"])
async def list_sessions():
    return await db.get_all_sessions()


@app.get("/api/sessions/{session_id}/progress", tags=["Sessions"])
async def session_progress(session_id: str):
    sessions = await db.get_all_sessions()
    session = next((s for s in sessions if s["id"] == session_id), None)
    if not session:
        raise HTTPException(404, "Session not found")
    return {
        "session_id": session_id,
        "status": session["status"],
        "processed_frames": session["processed_frames"],
        "total_frames": session["total_frames"],
    }


@app.delete("/api/sessions/{session_id}", tags=["Sessions"])
async def delete_session(session_id: str):
    await db.clear_session(session_id)
    return {"deleted": session_id}


# ─── Detections ──────────────────────────────────────────────────────────────

@app.get("/api/detections", tags=["Detections"])
async def get_detections(
    session_id: Optional[str] = None,
    status: Optional[str] = None,
    label: Optional[str] = None,
):
    detections = await db.get_all_detections(session_id, status, label)
    return {"detections": detections, "count": len(detections)}


@app.get("/api/detections/summary", tags=["Detections"])
async def get_summary(session_id: Optional[str] = None):
    return await db.get_summary(session_id)


# ─── Export ──────────────────────────────────────────────────────────────────

@app.get("/api/detections/export/csv", tags=["Export"])
async def export_csv(session_id: Optional[str] = None):
    detections = await db.get_all_detections(session_id)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "id", "session_id", "label", "ri_score", "status",
        "confidence", "weather", "lat", "lon", "km_marker", "frame_no", "captured_at"
    ])
    writer.writeheader()
    writer.writerows(detections)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=retroscan_report.csv"},
    )


# ─── Single frame ingest (optional, for live streaming use case) ──────────────

@app.post("/api/ingest/frame", tags=["Processing"])
async def ingest_frame(
    file: UploadFile = File(...),
    lat: float = Form(0.0),
    lon: float = Form(0.0),
    weather: str = Form("day_dry"),
    session_id: str = Form("manual"),
):
    import numpy as np
    import cv2
    from detector import detect_road_objects
    from ri_estimator import estimate_ri, classify_status

    content = await file.read()
    nparr = np.frombuffer(content, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(400, "Invalid image")

    raw_dets = detect_road_objects(frame)
    results = []
    for det in raw_dets:
        crop = frame[det["y1"]:det["y2"], det["x1"]:det["x2"]]
        ri = estimate_ri(crop, det["label"], weather)
        status = classify_status(ri, det["label"])
        det_id = f"frame-{uuid.uuid4().hex[:8]}"
        record = {
            "id": det_id, "session_id": session_id, "label": det["label"],
            "ri_score": ri, "status": status, "confidence": det["confidence"],
            "weather": weather, "lat": lat, "lon": lon, "km_marker": 0.0,
            "frame_no": 0, "captured_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.insert_detection(record)
        results.append(record)

    return {"detections": results, "count": len(results)}
