"""
Patient data models for the Digital Twin platform.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Vitals(BaseModel):
    """Structured vitals data."""
    heart_rate: float = Field(..., description="Heart rate in BPM")
    blood_pressure_systolic: float = Field(..., description="Systolic BP in mmHg")
    blood_pressure_diastolic: float = Field(..., description="Diastolic BP in mmHg")
    glucose_level: float = Field(..., description="Blood glucose in mg/dL")
    oxygen_saturation: float = Field(default=98.0, description="SpO2 percentage")
    temperature: float = Field(default=98.6, description="Body temperature in °F")
    respiratory_rate: float = Field(default=16, description="Breaths per minute")


class PatientProfile(BaseModel):
    """Full patient profile for the Digital Twin."""
    id: Optional[str] = None
    name: str
    age: int
    gender: str
    weight: float  # kg
    height: float  # cm
    blood_type: Optional[str] = None
    medical_history: Optional[str] = None
    current_medications: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    vitals: Optional[Vitals] = None
    created_at: Optional[datetime] = None


class SimulationRequest(BaseModel):
    """Request body for a What-If simulation."""
    patient_id: str
    scenario_type: str = Field(..., description="Type: 'medication', 'lifestyle', 'diet'")
    parameters: dict = Field(..., description="Scenario-specific parameters")


class SimulationResult(BaseModel):
    """Result of a What-If simulation."""
    scenario_type: str
    risk_scores: dict
    projected_vitals: dict
    recommendation: str
    confidence: float
    timeline_months: int = 12


class OCRRequest(BaseModel):
    """Request for OCR processing."""
    image_base64: str


class ChatRequest(BaseModel):
    """Request for conversational AI interaction."""
    patient_id: str
    message: str
    include_context: bool = True
