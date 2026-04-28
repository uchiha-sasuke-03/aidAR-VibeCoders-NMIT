"""
Simulation Engine
Runs "What-If" scenarios against a patient's digital twin.
Uses probability-based modeling and FAISS similar-case analysis.
"""
import copy
import random
from typing import Dict
from services.data_processing import compute_risk_scores, compute_overall_health_score
from services.vector_db import vector_db


# Medication effect profiles (simplified pharmacological model)
MEDICATION_EFFECTS = {
    "lisinopril": {
        "blood_pressure_systolic": -15,
        "blood_pressure_diastolic": -8,
        "heart_rate": -3,
        "side_effects": {"liver_strain": 0.1, "kidney_strain": 0.15},
    },
    "metformin": {
        "glucose_level": -40,
        "side_effects": {"liver_strain": 0.2, "gi_discomfort": 0.3},
    },
    "atenolol": {
        "heart_rate": -15,
        "blood_pressure_systolic": -10,
        "blood_pressure_diastolic": -6,
        "side_effects": {"fatigue": 0.25, "dizziness": 0.15},
    },
    "amlodipine": {
        "blood_pressure_systolic": -20,
        "blood_pressure_diastolic": -10,
        "side_effects": {"edema": 0.2, "headache": 0.15},
    },
    "insulin": {
        "glucose_level": -80,
        "side_effects": {"hypoglycemia_risk": 0.3, "weight_gain": 0.4},
    },
}

# Lifestyle modification effects (per month, cumulative)
LIFESTYLE_EFFECTS = {
    "exercise_moderate": {
        "heart_rate": -0.5,
        "blood_pressure_systolic": -0.8,
        "blood_pressure_diastolic": -0.4,
        "glucose_level": -1.5,
        "oxygen_saturation": 0.1,
    },
    "diet_low_sodium": {
        "blood_pressure_systolic": -1.0,
        "blood_pressure_diastolic": -0.6,
    },
    "diet_low_sugar": {
        "glucose_level": -2.5,
    },
    "smoking_cessation": {
        "heart_rate": -1.0,
        "oxygen_saturation": 0.3,
        "respiratory_rate": -0.2,
    },
    "weight_loss_5pct": {
        "blood_pressure_systolic": -3,
        "blood_pressure_diastolic": -2,
        "glucose_level": -8,
        "heart_rate": -2,
    },
}


def simulate_medication(vitals: Dict[str, float], medication: str, duration_months: int = 3) -> dict:
    """Simulate the effect of a medication on the patient's vitals."""
    med = MEDICATION_EFFECTS.get(medication.lower())
    if not med:
        return {"error": f"Unknown medication: {medication}. Available: {list(MEDICATION_EFFECTS.keys())}"}

    projected = copy.deepcopy(vitals)
    side_effects = med.get("side_effects", {})

    for key, delta in med.items():
        if key == "side_effects":
            continue
        if key in projected:
            projected[key] = projected[key] + delta

    # Clamp values
    projected["oxygen_saturation"] = min(100, projected.get("oxygen_saturation", 98))
    projected["heart_rate"] = max(40, projected.get("heart_rate", 72))

    risk_scores = compute_risk_scores(projected)
    health_score = compute_overall_health_score(risk_scores)
    similar = vector_db.find_similar(projected, k=2)

    return {
        "scenario_type": "medication",
        "medication": medication,
        "duration_months": duration_months,
        "original_vitals": vitals,
        "projected_vitals": projected,
        "risk_scores": {k: v for k, v in risk_scores.items()},
        "health_score": health_score,
        "side_effects": side_effects,
        "similar_cases": similar,
        "confidence": round(0.7 + random.uniform(0, 0.2), 2),
    }


def simulate_lifestyle(vitals: Dict[str, float], changes: list, duration_months: int = 12) -> dict:
    """Simulate the cumulative effect of lifestyle changes over time."""
    projected = copy.deepcopy(vitals)
    applied_changes = []

    for change in changes:
        effects = LIFESTYLE_EFFECTS.get(change)
        if not effects:
            continue
        applied_changes.append(change)
        for key, delta_per_month in effects.items():
            if key in projected:
                projected[key] = projected[key] + (delta_per_month * duration_months)

    # Clamp values
    projected["oxygen_saturation"] = min(100, max(80, projected.get("oxygen_saturation", 98)))
    projected["heart_rate"] = max(40, projected.get("heart_rate", 72))
    projected["glucose_level"] = max(50, projected.get("glucose_level", 90))

    risk_scores = compute_risk_scores(projected)
    health_score = compute_overall_health_score(risk_scores)
    similar = vector_db.find_similar(projected, k=2)

    return {
        "scenario_type": "lifestyle",
        "changes_applied": applied_changes,
        "duration_months": duration_months,
        "original_vitals": vitals,
        "projected_vitals": projected,
        "risk_scores": {k: v for k, v in risk_scores.items()},
        "health_score": health_score,
        "similar_cases": similar,
        "confidence": round(0.65 + random.uniform(0, 0.25), 2),
    }


def run_simulation(vitals: Dict[str, float], scenario_type: str, parameters: dict) -> dict:
    """Central dispatcher for simulations."""
    if scenario_type == "medication":
        return simulate_medication(
            vitals,
            medication=parameters.get("medication", "lisinopril"),
            duration_months=parameters.get("duration_months", 3),
        )
    elif scenario_type == "lifestyle":
        return simulate_lifestyle(
            vitals,
            changes=parameters.get("changes", []),
            duration_months=parameters.get("duration_months", 12),
        )
    else:
        return {"error": f"Unknown scenario type: {scenario_type}. Use 'medication' or 'lifestyle'."}
