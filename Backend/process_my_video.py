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

    # ── GPS options ───────────────────────────────────────────────────────────
    print("\nGPS options:")
    print("  1. Auto-extract from video metadata (recommended — works with most dashcams)")
    print("  2. Enter start/end coordinates manually")
    print("  3. No GPS (coordinates stored as null)")
    gps_choice = input("Choose [1/2/3, default 1]: ").strip() or "1"

    gps_points = None

    if gps_choice == "1":
        # Will be handled automatically inside process_video
        print("[GPS] Will attempt to extract GPS from video metadata automatically.")

    elif gps_choice == "2":
        print("\nEnter the GPS coordinates for the start and end of the video route.")
        print("  Example for Seoul:   lat=37.5665  lon=126.9780")
        print("  Example for Mumbai:  lat=19.0760  lon=72.8777")
        try:
            start_lat = float(input("Start latitude:  ").strip())
            start_lon = float(input("Start longitude: ").strip())
            end_lat   = float(input("End latitude:    ").strip())
            end_lon   = float(input("End longitude:   ").strip())
            gps_points = [
                {"lat": start_lat, "lon": start_lon, "t": 0},
                {"lat": end_lat,   "lon": end_lon,   "t": 9999},
            ]
            print(f"[GPS] Route set: ({start_lat}, {start_lon}) → ({end_lat}, {end_lon})")
        except ValueError:
            print("Invalid coordinates entered — GPS will be stored as null.")
            gps_points = None

    else:
        print("[GPS] No GPS — coordinates will be stored as null.")

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
            gps_points=gps_points,   # None = auto-extract inside process_video
            sample_fps=1.0,
        )
        print("\n========================================")
        print(f"Success! Processed {count} detections.")
        print("========================================")
        print("You can now start the backend API server with:")
        print("    cd c:\\Projects\\ReflectIQ\\Backend")
        print("    uvicorn main:app --reload --port 8000")
        print("\nThen, the frontend dashboard will display these detections!")

    except Exception as e:
        print(f"\nError processing video: {e}")

if __name__ == "__main__":
    asyncio.run(main())