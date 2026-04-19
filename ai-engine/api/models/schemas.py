from pydantic import BaseModel
from typing import List, Optional

class UploadRequest(BaseModel):
    highway_name: str
    chainage: str
    direction: str
    surface_type: str
    material: str
    age_years: int
    weather_condition: str

class ReflectivityReading(BaseModel):
    sign_id: str
    score: float
    label: str  # High/Medium/Low
    irc_compliant: bool
    timestamp: str
    latitude: float
    longitude: float

class PredictionResponse(BaseModel):
    sign_id: str
    location: str
    chainage: str
    current_score: float
    predicted_failure_date: str
    days_remaining: int
    confidence: float
    recommended_action: str

class CostComparisonResponse(BaseModel):
    highway_length_km: float
    manual_days: int
    manual_cost: float
    system_hours: float
    system_cost: float
    savings_percent: float

class RootCauseResponse(BaseModel):
    sign_id: str
    cause_label: str
    contributing_factors: List[str]
    severity: str
    recommended_fix: str
    estimated_cost: str
