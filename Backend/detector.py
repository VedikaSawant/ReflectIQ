"""
YOLOv8 object detector for road infrastructure elements.
Uses the nano model (yolov8n) which runs well on CPU and GPU alike.
On first run it auto-downloads the model weights (~6MB).
"""

from ultralytics import YOLO
import torch

# Classes we care about from COCO (base YOLOv8 classes)
# We map COCO classes to road infrastructure categories
COCO_TO_ROAD = {
    "stop sign":        "road_sign",
    "traffic light":    "road_sign",
    "parking meter":    "road_sign",
    "bench":            "delineator",   # proxy
}

# Our target detection categories
TARGET_LABELS = {"road_sign", "lane_marking", "road_stud", "delineator"}

# Confidence threshold
CONF_THRESHOLD = 0.25

_model = None

def get_model():
    global _model
    if _model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[Detector] Loading YOLOv8n on {device.upper()}...")
        _model = YOLO("yolov8n.pt")
        _model.to(device)
        print(f"[Detector] Model ready on {device.upper()}")
    return _model


def detect_road_objects(img_bgr):
    """
    Run YOLOv8 detection on a BGR frame.

    Returns list of dicts:
        { label, confidence, x1, y1, x2, y2, area_ratio }

    Strategy:
    1. Standard YOLO detects known COCO classes → we remap to road categories
    2. We also apply heuristic region detection for lane markings (bottom center)
       and road studs (bottom strip) since they're not in COCO
    """
    model = get_model()
    h, w = img_bgr.shape[:2]
    results = model(img_bgr, verbose=False, conf=CONF_THRESHOLD)[0]

    detections = []

    # ── YOLO detections (signs, lights) ──────────────────────────────────────
    for box in results.boxes:
        cls_name = model.names[int(box.cls)]
        label = COCO_TO_ROAD.get(cls_name)
        if not label:
            # Also catch any class with "sign" in its name
            if "sign" in cls_name.lower():
                label = "road_sign"
            else:
                continue

        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        # Guard bounds
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        if x2 <= x1 or y2 <= y1:
            continue

        area_ratio = ((x2 - x1) * (y2 - y1)) / (w * h)
        detections.append({
            "label": label,
            "confidence": float(box.conf),
            "x1": x1, "y1": y1, "x2": x2, "y2": y2,
            "area_ratio": area_ratio,
        })

    # ── Heuristic: Lane markings (bottom-center strip) ───────────────────────
    # Lane markings appear in the lower 40% of the frame, centre third
    lane_region = img_bgr[int(h * 0.60):h, int(w * 0.25):int(w * 0.75)]
    if lane_region.size > 0:
        import cv2
        gray = cv2.cvtColor(lane_region, cv2.COLOR_BGR2GRAY)
        mean_lum = float(gray.mean())
        # If that strip is bright enough, treat it as a lane marking region
        if mean_lum > 40:
            detections.append({
                "label": "lane_marking",
                "confidence": min(0.55 + mean_lum / 800, 0.92),
                "x1": int(w * 0.25), "y1": int(h * 0.60),
                "x2": int(w * 0.75), "y2": h,
                "area_ratio": 0.15 * 0.5,
            })

    # ── Heuristic: Road studs (very bottom strip, small bright blobs) ─────────
    stud_region = img_bgr[int(h * 0.80):h, :]
    if stud_region.size > 0:
        import cv2
        gray = cv2.cvtColor(stud_region, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 30 < area < 2000:   # small bright blobs = studs
                bx, by, bw, bh = cv2.boundingRect(cnt)
                detections.append({
                    "label": "road_stud",
                    "confidence": 0.65,
                    "x1": bx, "y1": int(h * 0.80) + by,
                    "x2": bx + bw, "y2": int(h * 0.80) + by + bh,
                    "area_ratio": area / (w * h),
                })

    return detections
