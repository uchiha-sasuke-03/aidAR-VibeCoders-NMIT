"""
Simulation routes — What-If scenario endpoints.
"""
from fastapi import APIRouter, HTTPException
from models.patient import SimulationRequest
from services.simulation_engine import run_simulation
from services.llm_translator import translate_simulation
from routes.patients import patients_db

router = APIRouter(prefix="/api/simulate", tags=["Simulation"])


@router.post("/")
async def run_what_if(req: SimulationRequest):
    """Run a What-If simulation against a patient's digital twin."""
    if req.patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient = patients_db[req.patient_id]
    vitals = patient.get("vitals")
    if not vitals:
        raise HTTPException(status_code=400, detail="No vitals data. Update vitals first.")

    result = run_simulation(vitals, req.scenario_type, req.parameters)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Get AI explanation
    explanation = await translate_simulation(
        patient_name=patient.get("name", "Patient"),
        scenario_type=req.scenario_type,
        parameters=req.parameters,
        result=result,
    )
    result["ai_explanation"] = explanation

    return result


@router.get("/medications")
async def list_medications():
    """Return available medications for simulation."""
    from services.simulation_engine import MEDICATION_EFFECTS
    return {
        "medications": [
            {"name": med, "effects": {k: v for k, v in data.items() if k != "side_effects"}, "side_effects": data.get("side_effects", {})}
            for med, data in MEDICATION_EFFECTS.items()
        ]
    }


@router.get("/lifestyle-options")
async def list_lifestyle_options():
    """Return available lifestyle changes for simulation."""
    from services.simulation_engine import LIFESTYLE_EFFECTS
    return {
        "options": [
            {"name": key, "monthly_effects": effects}
            for key, effects in LIFESTYLE_EFFECTS.items()
        ]
    }
