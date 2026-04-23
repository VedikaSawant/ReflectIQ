import aiosqlite
import asyncio
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "retroscan.db")

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS detections (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL,
    label       TEXT NOT NULL,
    ri_score    REAL NOT NULL,
    status      TEXT NOT NULL,
    confidence  REAL NOT NULL,
    weather     TEXT NOT NULL,
    lat         REAL,
    lon         REAL,
    km_marker   REAL NOT NULL,
    frame_no    INTEGER NOT NULL,
    captured_at TEXT NOT NULL,
    image_path  TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT PRIMARY KEY,
    video_name  TEXT NOT NULL,
    weather     TEXT NOT NULL,
    total_frames INTEGER NOT NULL,
    processed_frames INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'processing',
    created_at  TEXT NOT NULL
);
"""

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        # Recreate table to add new image_path column cleanly
        await db.execute("DROP TABLE IF EXISTS detections")
        await db.executescript(CREATE_TABLE_SQL)
        await db.commit()

async def insert_detection(det: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT OR REPLACE INTO detections
            (id, session_id, label, ri_score, status, confidence, weather, lat, lon, km_marker, frame_no, captured_at, image_path)
            VALUES (:id, :session_id, :label, :ri_score, :status, :confidence, :weather, :lat, :lon, :km_marker, :frame_no, :captured_at, :image_path)
        """, det)
        await db.commit()

async def insert_session(session: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT OR REPLACE INTO sessions (id, video_name, weather, total_frames, processed_frames, status, created_at)
            VALUES (:id, :video_name, :weather, :total_frames, :processed_frames, :status, :created_at)
        """, session)
        await db.commit()

async def update_session_progress(session_id: str, processed: int, status: str = "processing"):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE sessions SET processed_frames=?, status=? WHERE id=?",
            (processed, status, session_id)
        )
        await db.commit()

async def get_all_detections(session_id: str = None, status: str = None, label: str = None) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM detections WHERE 1=1"
        params = []
        if session_id:
            query += " AND session_id=?"; params.append(session_id)
        if status and status != "all":
            query += " AND status=?"; params.append(status)
        if label and label != "all":
            query += " AND label=?"; params.append(label)
        query += " ORDER BY frame_no ASC"
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]

async def get_summary(session_id: str = None) -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        base = "FROM detections" + (f" WHERE session_id='{session_id}'" if session_id else "")
        async with db.execute(f"SELECT COUNT(*), AVG(ri_score), MIN(lat), MAX(lat) {base}") as c:
            row = await c.fetchone()
            total, avg_ri, min_lat, max_lat = row
        counts = {}
        for s in ["red", "yellow", "green"]:
            q = f"SELECT COUNT(*) FROM detections WHERE status='{s}'"
            if session_id: q += f" AND session_id='{session_id}'"
            async with db.execute(q) as c:
                counts[s] = (await c.fetchone())[0]
        return {
            "total": total or 0,
            "avg_ri": round(avg_ri or 0, 1),
            "critical": counts["red"],
            "warning": counts["yellow"],
            "compliant": counts["green"],
        }

async def get_all_sessions() -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM sessions ORDER BY created_at DESC") as c:
            return [dict(r) for r in await c.fetchall()]

async def clear_session(session_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM detections WHERE session_id=?", (session_id,))
        await db.execute("DELETE FROM sessions WHERE id=?", (session_id,))
        await db.commit()
