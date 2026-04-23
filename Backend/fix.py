content = open('video_processor.py', 'r').read()
fixed = content.replace(
    'gps = generate_synthetic_gps(frame_no, total_frames)',
    'gps = {"lat": None, "lon": None}'
)
open('video_processor.py', 'w').write(fixed)
print("Done")