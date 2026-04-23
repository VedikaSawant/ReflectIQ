import sqlite3
conn = sqlite3.connect('retroscan.db')
cur = conn.cursor()
cur.executescript("""
    DROP TABLE IF EXISTS detections;
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
""")
conn.commit()
conn.close()
print("Schema fixed - lat/lon now nullable")