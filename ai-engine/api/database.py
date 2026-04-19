import sqlite3
import uuid
import os
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "database.sqlite")

def get_connection():
    return sqlite3.connect(DATABASE_URL)

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS scan_jobs (
            job_id TEXT PRIMARY KEY,
            highway_name TEXT,
            status TEXT,
            created_at TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS signs (
            sign_id TEXT PRIMARY KEY,
            highway_name TEXT,
            chainage TEXT,
            latitude REAL,
            longitude REAL
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sign_id TEXT,
            job_id TEXT,
            score REAL,
            label TEXT,
            condition_label TEXT,
            timestamp TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def create_scan_job(highway_name: str) -> str:
    job_id = str(uuid.uuid4())
    conn = get_connection()
    c = conn.cursor()
    c.execute('INSERT INTO scan_jobs (job_id, highway_name, status, created_at) VALUES (?, ?, ?, ?)',
              (job_id, highway_name, 'processing', datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    return job_id

def update_job_status(job_id: str, status: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute('UPDATE scan_jobs SET status = ? WHERE job_id = ?', (status, job_id))
    conn.commit()
    conn.close()

def get_job_status(job_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT status FROM scan_jobs WHERE job_id = ?', (job_id,))
    res = c.fetchone()
    conn.close()
    return res[0] if res else None
