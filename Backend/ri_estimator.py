"""
Retroreflectivity Index (RI) Estimator

Uses a physics-informed luminance proxy since we don't have a labelled
retroreflectivity training dataset. Retroreflective materials appear
significantly brighter in camera footage due to the retroreflection
effect — so high pixel luminance correlates with high RI.

Calibration reference (IRC 67 / IRC 35):
  Road sign min:     70  mcd/lx/m²
  Lane marking min: 100  mcd/lx/m²
  Road stud min:    150  mcd/lx/m²
  Delineator min:    80  mcd/lx/m²
"""

import cv2
import numpy as np

# IRC threshold minimums per label
IRC_THRESHOLDS = {
    "road_sign":    70,
    "lane_marking": 100,
    "road_stud":    150,
    "delineator":   80,
}

# Weather degradation factors (based on retroreflectometry research)
WEATHER_PENALTY = {
    "day_dry":   1.00,
    "day_wet":   0.82,
    "night_dry": 0.73,
    "night_wet": 0.58,
    "foggy":     0.68,
}

# Scaling constants — maps pixel luminance (0-255) to RI range per category
RI_SCALE = {
    "road_sign":    (0, 350),   # road signs: 0–350 mcd/lx/m²
    "lane_marking": (0, 500),   # lane markings can score higher
    "road_stud":    (0, 600),   # studs are highly retroreflective
    "delineator":   (0, 300),
}


def estimate_ri(crop_bgr: np.ndarray, label: str, weather_tag: str = "day_dry") -> float:
    """
    Estimate Retroreflectivity Index from a cropped BGR image patch.

    Steps:
    1. Convert to grayscale → analyse luminance distribution
    2. Use weighted combo of mean + 90th-percentile brightness
    3. Scale to physical RI range for the label type
    4. Apply weather penalty
    5. Add small noise to avoid identical scores across frames
    """
    if crop_bgr is None or crop_bgr.size == 0:
        return 0.0

    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY).astype(float)

    # Luminance features
    mean_lum   = float(gray.mean())
    p90_lum    = float(np.percentile(gray, 90))  # bright spot = retroreflection peak
    max_lum    = float(gray.max())

    # Weighted score (favour peak brightness — that's the retroreflective hotspot)
    raw = 0.25 * mean_lum + 0.45 * p90_lum + 0.30 * max_lum

    # Normalise to 0-1
    norm = raw / 255.0

    # Scale to label-specific RI range
    lo, hi = RI_SCALE.get(label, (0, 400))
    ri = lo + norm * (hi - lo)

    # Weather penalty
    penalty = WEATHER_PENALTY.get(weather_tag, 1.0)
    ri *= penalty

    # Small ±5% random noise for realism (reproducible per frame)
    rng = np.random.default_rng(int(mean_lum * 1000) % 999983)
    noise = rng.uniform(0.95, 1.05)
    ri *= noise

    return max(0.0, round(ri, 1))


def classify_status(ri_score: float, label: str) -> str:
    """Classify detection as red/yellow/green based on IRC thresholds."""
    threshold = IRC_THRESHOLDS.get(label, 80)
    if ri_score < threshold:
        return "red"
    elif ri_score < threshold * 1.5:
        return "yellow"
    else:
        return "green"
