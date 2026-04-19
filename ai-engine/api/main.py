from fastapi import FastAPI
from api.middleware.cors import setup_cors
from api.routes import upload, analyze, predictions, cost, rootcause
from api.database import init_db

app = FastAPI(title="NHAI AI Engine API", version="1.0.0")

setup_cors(app)

@app.on_event("startup")
async def startup_event():
    # Initialize DB (create tables)
    init_db()
    # Placeholder for model loading
    print("Loading ML models into memory...")

app.include_router(upload.router, prefix="/api/v1")
app.include_router(analyze.router, prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")
app.include_router(cost.router, prefix="/api/v1")
app.include_router(rootcause.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "NHAI AI Engine API is running"}
