from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app: FastAPI):
    origins = [
        "http://localhost:5173", # Vite
        "http://localhost:3000", # React standard
        "http://localhost:3001", # Express
        # Add production URLs here
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
