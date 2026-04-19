# 🛣️ NHAI Retroreflectivity Intelligence System: Systematic Architecture Guide

This document presents the complete architectural layout, data flow, and pipeline execution for the NHAI Infrastructure Intelligence System. It walks you through every single layer of the codebase, ensuring you have a complete technical understanding for development, debugging, and presentation.

---

## 🏗️ 1. High-Level Ecosystem Layout

The platform runs on a **decoupled, microservice-inspired architecture**. Instead of having one massive application that does everything, the system is sharply separated into two standalone backends communicating over HTTP.

### Why this architecture?
1. **Performance:** Image processing (Python/C++) is incredibly CPU-heavy. Serving a web dashboard (Node.js) is I/O heavy. Separating them prevents a video upload from crashing the users' map interface.
2. **Hackathon Agility:** Python is the undisputed king of ML. Node.js/JavaScript is the undisputed king of web applications and React integration. We use the best tool for each specific job.

---

## 🧠 2. Component A: The AI Engine (Python FastAPI)
**Location:** `/ai-engine/api/`

This is the "Brain" of the platform. It handles all mathematical, analytical, and computer-vision-related tasks. It works completely autonomously via its own local SQLite database interface.

### The Internal Data Flow
1. **`main.py` - The Gateway:** Starts the server (Port 8000), initializes the local SQLite Database, pre-loads ML models into memory to prevent startup-lag on every request, and handles CORS (allowing frontend browser access).
2. **`database.py` - The Storage:** Automatically sets up an offline `database.sqlite` file with three core tables: `scan_jobs`, `signs`, and `readings`. It prevents you from needing a cloud database to test ML functions.
3. **`models/schemas.py` - The Bouncers:** Strict Pydantic validators. Before a python function is allowed to process data, `schemas.py` ensures the incoming formatting is flawless.

### The API Endpoints & ML Pipelines
* **`POST /api/v1/upload` (Video Intake & Processing Pipeline)**
  * Receives the dashcam video and metadata (chainage, highway, age).
  * Generates a unique UUID `job_id` and marks it "processing".
  * *The Background Task Pipeline triggers:*
    1. **Preprocess:** (Simulated) Extracts frames from the video.
    2. **Prediction:** (Simulated) Runs YOLO/CNN to find the bounding box of a sign, evaluate the retroreflectivity score, and classify it as High/Medium/Low.
    3. **Condition:** Flags physical defects (Scratches/Fading).
    4. **Write:** Saves all results to SQLite and marks job "complete".
  * Returns `job_id` to the frontend instantly without making the user wait 10 minutes for processing.

* **`GET /api/v1/analyze/{job_id}` (Polling)**
  * The frontend calls this every 3 seconds after an upload. 
  * If the background task is done, it spits out the array of frames, GPS tags, and retroreflectivity scores.

* **`GET /api/v1/predictions` (Predictive Maintenance)**
  * Calculates decay rates. Because Retroreflectivity (RA) degrades predictably based on material type and weather/sunlight exposure, the AI predicts exactly *when* in the future the sign will drop below IRC threshold, returning `days_remaining` and an exact date.

* **`GET /api/v1/cost-comparison` (ROI Engine)**
  * Mathematically proves to NHAI why the AI system saves money. 
  * Compares automated collection (highway speed = 60km/h) vs Manual Collection (engineers walking = 2km/h). Outputs manpower saved and exact ₹ currency saved.

* **`GET /api/v1/root-cause/{sign_id}` (Diagnostics)**
  * If a sign fails prematurely (e.g., in 2 years instead of 7), this infers why by checking surface type, weather norms, and visual defects. E.g., "Water Logging on Type XI sheeting".

---

## 🌐 3. Component B: The Application Backend (Node.js Express)
**Location:** `/web-app/backend/`

This is the "Router". Its singular job is caching data from the database, aggregating it into easily digestible charts, and serving it securely and incredibly fast to the React frontend. It runs on Port 3001.

### Graceful Degradation (The Fallback Plan)
Hackathons are notorious for failing Wi-Fi or crashing cloud databases. 
* **`src/db/supabase.js`** connects to Supabase.
* However, inside *every single controller*, the script checks: `if (!supabase)`.
* If the database is missing, it skips the SQL query and automatically returns **Mock JSON Data**. Your platform will **never display a white screen or a server crash**.

### The API Endpoints & Controllers
* **`GET /api/signs` & `/api/signs/:id` (GIS Mapping)**
  * Queries Supabase for all physical signs. 
  * Passes data through `utils/formatResponse.js` which converts raw SQL rows into formal **GeoJSON format** (`geometry: {type: 'Point', coordinates: [lng, lat]}`). This is exactly what the React map (Leaflet/Mapbox) requires natively, moving heavy formatting logic off of the user's browser processor and onto your backend.

* **`GET /api/stats` (Dashboard Aggregator)**
  * Combines data. E.g., Counts all "High" signs, "Low" signs, and calculates overall network health. Formats data directly into array structures mapped meant for **Recharts** (`[{name: "High", value: 45}]`), so the frontend maps it perfectly with zero logic. 

* **`GET /api/alerts/new` (Live Feed Controller)**
  * Queries logs for signs falling into *Low* conditions within the last 24 hours. The React frontend calls this every 30 seconds to simulate a live, breathing "News Feed" style alert panel.

* **`GET /api/reports/download` (Report Generation)**
  * Downloads a CSV. It queries all history for a specific highway, writes a raw CSV string buffer to memory (`Headers: ID, Score, Timestamp`), attaches special HTTP headers (`Content-Disposition: attachment`), and sends it. The user's browser automatically sees this payload and forces a file download. No third-party CSV libraries needed.

---

## 🔄 4. The Complete End-to-End User Flow Execution

Let's trace exactly what happens when an NHAI Engineer uploads a video:

1. **User Action:** Engineer goes to the React Dashboard and clicks "Upload Survey Video".
2. **React to Python:** React dispatches a `multipart/form-data` request with the MP4 file and metadata via Axios directly to `http://localhost:8000/api/v1/upload` (Python server).
3. **FastAPI Intake:** Python accepts it, generates Job `UUID-123`.
4. **Asynchronous Hand-off:** Python tells its Background Worker to "process `UUID-123`". The API route responds to React immediately: `HTTP 200 OK: {"status": "processing"}`.
5. **Frontend Wait State:** React puts up a loading bar and begins asking Python every 3 seconds: "Is `UUID-123` done?" (`GET /analyze/UUID-123`).
6. **AI Magic:** The Background Worker rips the video into 30 frames per second, runs the simulated CV pipeline, grabs the GPS coordinates for each frame, and determines the retroreflectivity score. It writes 500 rows to the SQLite database. Status updates to `complete`.
7. **Extraction:** Fast forward 3 seconds: React asks "Is it done?" Python replies "Yes, here is the payload of signs."
8. **Cloud Sync (Future implementation state):** The final accepted pipeline state gets synchronized up to the Supabase Cloud database. 
9. **Dashboard Refresh:** React refreshes all its components. The Map Component hits the Node.js Server (`GET :3001/api/signs`). Node asks Supabase for the fresh signs, formats them to GeoJSON, and fires them back.
10. **Render:** The map populates hundreds of green, yellow, and red markers representing highway infrastructure health. Cost comparisons populate showing exact manpower saved.
