from fastapi import APIRouter
from typing import Optional
from api.models.schemas import PredictionResponse

router = APIRouter()

@router.get("/predictions", response_model=list[PredictionResponse])
async def get_predictions(highway: Optional[str] = None, days: Optional[int] = None):
    # Mock predictive maintenance forecast
    return [
        PredictionResponse(
            sign_id="sign_001",
            location="28.6139, 77.2090",
            chainage="KM 142.5",
            current_score=85.0,
            predicted_failure_date="2026-08-15",
            days_remaining=118,
            confidence=0.88,
            recommended_action="Schedule cleaning and inspection"
        ),
        PredictionResponse(
            sign_id="sign_002",
            location="28.6150, 77.2100",
            chainage="KM 143.0",
            current_score=45.0,
            predicted_failure_date="2026-05-10",
            days_remaining=21,
            confidence=0.95,
            recommended_action="Replace immediately"
        )
    ]
