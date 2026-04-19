from fastapi import APIRouter
from api.models.schemas import CostComparisonResponse

router = APIRouter()

# Assumptions
MANUAL_SPEED_KMH = 2.0
MANUAL_COST_PER_DAY = 5000 # Cost of 2 engineers + equipment + vehicle per day (adjust appropriately)
HOURS_PER_DAY = 8
SYSTEM_SPEED_KMH = 60.0
SYSTEM_COST_PER_HOUR = 1500

@router.get("/cost-comparison", response_model=CostComparisonResponse)
async def get_cost_comparison(length_km: float):
    manual_hours = length_km / MANUAL_SPEED_KMH
    manual_days = int((manual_hours / HOURS_PER_DAY) + 0.5)
    manual_cost = manual_days * MANUAL_COST_PER_DAY
    
    system_hours = length_km / SYSTEM_SPEED_KMH
    system_cost = system_hours * SYSTEM_COST_PER_HOUR
    
    savings = 0.0
    if manual_cost > 0:
        savings = ((manual_cost - system_cost) / manual_cost) * 100
        
    return CostComparisonResponse(
        highway_length_km=length_km,
        manual_days=manual_days,
        manual_cost=manual_cost,
        system_hours=round(system_hours, 2),
        system_cost=round(system_cost, 2),
        savings_percent=round(savings, 2)
    )
