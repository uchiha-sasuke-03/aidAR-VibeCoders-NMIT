"""
Smart Healthcare Digital Twin — FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routes.patients import router as patients_router
from routes.simulation import router as simulation_router
from routes.ocr_chat import router as ocr_chat_router

app = FastAPI(
    title="Smart Healthcare Digital Twin API",
    description="AI-powered proactive health simulation and diagnosis platform.",
    version="1.0.0",
)

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(patients_router)
app.include_router(simulation_router)
app.include_router(ocr_chat_router)


@app.get("/")
def read_root():
    return {
        "name": "Smart Healthcare Digital Twin API",
        "version": "1.0.0",
        "endpoints": {
            "patients": "/api/patients",
            "simulate": "/api/simulate",
            "ocr": "/api/ocr/extract",
            "chat": "/api/chat",
            "docs": "/docs",
        }
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
