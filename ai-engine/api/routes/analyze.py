from fastapi import APIRouter
from api.database import get_job_status
import random

router = APIRouter()

@router.get("/analyze/{job_id}")
async def analyze_results(job_id: str):
    status = get_job_status(job_id)
    if status is None:
        return {"error": "Job not found"}
        
    if status == 'processing':
        return {"status": "processing"}
        
    # Mock complete results
    return {
        "status": "complete",
        "frames": [
            {
                "latitude": 28.6139,
                "longitude": 77.2090,
                "retroreflectivity_score": round(random.uniform(50, 200), 2),
                "condition_label": "High",
                "irc_compliant": True,
                "defects": []
            },
            {
                "latitude": 28.6140,
                "longitude": 77.2091,
                "retroreflectivity_score": round(random.uniform(10, 50), 2),
                "condition_label": "Low",
                "irc_compliant": False,
                "defects": ["Fading", "Scratches"]
            }
        ]
    }
