import asyncio
import os
import uuid
import database as db
from video_processor import process_video

async def main():
    print("========================================")
    print(" RetroScan AI - Video Processing Script ")
    print("========================================")
    
    # Initialize the database
    await db.init_db()
    
    # Get the video path from the user
    video_path = input("Enter the full path to your video file (e.g. C:\\Videos\\dashcam.mp4): ").strip()
    
    # Remove quotes if the user dragged and dropped the file
    video_path = video_path.strip('"\'')
    
    if not os.path.exists(video_path):
        print(f"Error: Could not find file at {video_path}")
        return

    # Get weather condition
    print("\nWeather conditions: day_dry, day_wet, night_dry, night_wet, foggy")
    weather = input("Enter weather condition [default: day_dry]: ").strip()
    if not weather:
        weather = "day_dry"
        
    print(f"\n[+] Starting processing for: {video_path}")
    print(f"[+] Weather set to: {weather}")
    print("[+] This will extract 1 frame per second and run YOLOv8 detection.")
    print("    (Please be patient, it may take a few minutes depending on your GPU/CPU)\n")
    
    session_id = str(uuid.uuid4())
    
    try:
        count = await process_video(
            video_path=video_path,
            session_id=session_id,
            weather=weather,
            sample_fps=1.0 # 1 frame per second
        )
        print("\n========================================")
        print(f"✅ Success! Processed {count} detections.")
        print("========================================")
        print("You can now start the backend API server with:")
        print("    cd c:\\Projects\\ReflectIQ\\Backend")
        print("    uvicorn main:app --reload --port 8000")
        print("\nThen, the frontend dashboard will display these detections!")
        
    except Exception as e:
        print(f"\n❌ Error processing video: {e}")

if __name__ == "__main__":
    asyncio.run(main())
