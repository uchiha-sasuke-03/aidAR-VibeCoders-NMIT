"""
Data Processing Service
Normalizes and processes structured patient vitals data.
"""
import numpy as np
from typing import Dict, List


# Normal ranges for vitals (min, max)
VITAL_RANGES = {
    "heart_rate": (60, 100),
    "blood_pressure_systolic": (90, 120),
    "blood_pressure_diastolic": (60, 80),
    "glucose_level": (70, 100),
    "oxygen_saturation": (95, 100),
    "temperature": (97.0, 99.0),
    "respiratory_rate": (12, 20),
}

# Risk thresholds — deviation beyond which a vital is critical
RISK_THRESHOLDS = {
    "heart_rate": {"low": 50, "high": 120, "critical_high": 150},
    "blood_pressure_systolic": {"low": 80, "high": 140, "critical_high": 180},
    "blood_pressure_diastolic": {"low": 50, "high": 90, "critical_high": 120},
    "glucose_level": {"low": 54, "high": 140, "critical_high": 250},
    "oxygen_saturation": {"low": 90, "critical_low": 85, "high": 100},
    "temperature": {"low": 95.0, "high": 100.4, "critical_high": 103.0},
    "respiratory_rate": {"low": 8, "high": 25, "critical_high": 30},
}


def normalize_vitals(vitals: Dict[str, float]) -> Dict[str, float]:
    """
    Normalize vitals to a 0-1 scale based on known healthy ranges.
    Values outside the range will be clipped to [0, 1].
    """
    normalized = {}
    for key, value in vitals.items():
        if key in VITAL_RANGES:
            low, high = VITAL_RANGES[key]
            norm = (value - low) / (high - low) if high != low else 0.5
            normalized[key] = float(np.clip(norm, 0.0, 1.0))
    return normalized


def compute_risk_scores(vitals: Dict[str, float]) -> Dict[str, Dict]:
    """
    Compute individual risk scores for each vital.
    Returns a risk level (normal, elevated, high, critical) and a severity score.
    """
    risks = {}
    for key, value in vitals.items():
        if key not in RISK_THRESHOLDS:
            continue
        thresholds = RISK_THRESHOLDS[key]
        level = "normal"
        severity = 0.0

        low = thresholds.get("low", -np.inf)
        high = thresholds.get("high", np.inf)
        critical_low = thresholds.get("critical_low", -np.inf)
        critical_high = thresholds.get("critical_high", np.inf)

        if value <= critical_low or value >= critical_high:
            level = "critical"
            severity = 1.0
        elif value < low or value > high:
            level = "high"
            severity = 0.75
        elif key in VITAL_RANGES:
            norm_low, norm_high = VITAL_RANGES[key]
            if value < norm_low or value > norm_high:
                level = "elevated"
                severity = 0.4
        
        risks[key] = {"level": level, "severity": severity, "value": value}
    return risks


def compute_overall_health_score(risk_scores: Dict[str, Dict]) -> float:
    """
    Compute an overall health score (0-100) from individual risk scores.
    100 = perfect health, 0 = critical condition.
    """
    if not risk_scores:
        return 100.0
    
    total_severity = sum(r["severity"] for r in risk_scores.values())
    avg_severity = total_severity / len(risk_scores)
    health_score = max(0.0, 100.0 * (1.0 - avg_severity))
    return round(health_score, 1)


def create_embedding_vector(vitals: Dict[str, float]) -> List[float]:
    """
    Create a numerical embedding vector from vitals for FAISS indexing.
    """
    ordered_keys = sorted(VITAL_RANGES.keys())
    normalized = normalize_vitals(vitals)
    vector = [normalized.get(k, 0.5) for k in ordered_keys]
    return vector
