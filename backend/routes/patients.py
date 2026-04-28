"""
Patient routes — CRUD and health analysis endpoints.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict
from models.patient import PatientProfile, Vitals
from services.data_processing import compute_risk_scores, compute_overall_health_score, normalize_vitals
from services.vector_db import vector_db
from services.llm_translator import translate_risk_report

router = APIRouter(prefix="/api/patients", tags=["Patients"])

# In-memory patient store (replace with DB in production)
patients_db: Dict[str, dict] = {}
_counter = 0


def _next_id():
    global _counter
    _counter += 1
    return f"PT-{_counter:04d}"


@router.post("/", status_code=201)
async def create_patient(patient: PatientProfile):
    """Register a new patient and create their digital twin."""
    pid = _next_id()
    patient.id = pid
    data = patient.model_dump()
    patients_db[pid] = data
    return {"patient_id": pid, "message": "Digital Twin created successfully", "patient": data}


@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    """Retrieve a patient's profile."""
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patients_db[patient_id]


@router.get("/")
async def list_patients():
    """List all patients."""
    return list(patients_db.values())


@router.put("/{patient_id}/vitals")
async def update_vitals(patient_id: str, vitals: Vitals):
    """Update a patient's vitals and recompute their digital twin."""
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")

    vitals_dict = vitals.model_dump()
    patients_db[patient_id]["vitals"] = vitals_dict

    # Compute risk analysis
    risk_scores = compute_risk_scores(vitals_dict)
    health_score = compute_overall_health_score(risk_scores)
    normalized = normalize_vitals(vitals_dict)
    similar_cases = vector_db.find_similar(vitals_dict, k=3)

    # Store computed data
    patients_db[patient_id]["risk_scores"] = risk_scores
    patients_db[patient_id]["health_score"] = health_score
    patients_db[patient_id]["similar_cases"] = similar_cases

    return {
        "patient_id": patient_id,
        "vitals": vitals_dict,
        "normalized": normalized,
        "risk_scores": risk_scores,
        "health_score": health_score,
        "similar_cases": similar_cases,
    }


@router.get("/{patient_id}/report")
async def get_ai_report(patient_id: str):
    """Generate an AI-powered health report for the patient."""
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient = patients_db[patient_id]
    vitals = patient.get("vitals")
    if not vitals:
        raise HTTPException(status_code=400, detail="No vitals data found. Update vitals first.")

    risk_scores = patient.get("risk_scores", compute_risk_scores(vitals))
    health_score = patient.get("health_score", compute_overall_health_score(risk_scores))
    similar_cases = patient.get("similar_cases", vector_db.find_similar(vitals, k=3))

    report = await translate_risk_report(
        patient_name=patient.get("name", "Patient"),
        vitals=vitals,
        risk_scores=risk_scores,
        health_score=health_score,
        similar_cases=similar_cases,
    )

    return {"patient_id": patient_id, "report": report, "health_score": health_score}
