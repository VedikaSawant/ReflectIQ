from fastapi import APIRouter
from api.models.schemas import RootCauseResponse

router = APIRouter()

@router.get("/root-cause/{sign_id}", response_model=RootCauseResponse)
async def get_root_cause(sign_id: str):
    # Call mock root_cause analysis
    return RootCauseResponse(
        sign_id=sign_id,
        cause_label="Material fatigue + water logging",
        contributing_factors=["Heavy rainfall area", "Poor quality sheeting"],
        severity="High",
        recommended_fix="Replace with Type III sheeting and ensure proper sealing",
        estimated_cost="₹12,000 per sign"
    )
