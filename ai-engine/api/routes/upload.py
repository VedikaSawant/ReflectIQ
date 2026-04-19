from fastapi import APIRouter, File, UploadFile, Depends, BackgroundTasks, Form
from api.database import create_scan_job, update_job_status
import json
import time
import asyncio

router = APIRouter()

async def process_video_background(job_id: str, highway_name: str):
    # Simulated ML processing: 
    # preprocess -> predict_retro & condition -> predict_failure -> root_cause
    await asyncio.sleep(5) # Simulate long processing time
    # In reality, this would insert results into the DB
    update_job_status(job_id, 'complete')

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    metadata: str = Form(...)  # Expected to be JSON string matching UploadRequest
):
    try:
        meta_dict = json.loads(metadata)
        highway_name = meta_dict.get("highway_name", "Unknown Highway")
    except json.JSONDecodeError:
        highway_name = "Unknown Highway"

    # Create Job
    job_id = create_scan_job(highway_name)

    # Start ML task
    background_tasks.add_task(process_video_background, job_id, highway_name)

    return {"job_id": job_id, "status": "processing"}
