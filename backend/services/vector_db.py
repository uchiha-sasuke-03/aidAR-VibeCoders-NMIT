"""
Vector Database Service (FAISS)
Stores patient embeddings and finds similar cases at high speed.
"""
import numpy as np
import faiss
from typing import List, Dict, Optional, Tuple
from services.data_processing import create_embedding_vector, VITAL_RANGES


# Dimension = number of vitals we track
EMBEDDING_DIM = len(VITAL_RANGES)


class VectorDBService:
    """Manages a FAISS index for patient vital embeddings."""

    def __init__(self):
        self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
        self.patient_store: Dict[int, dict] = {}  # Maps FAISS index -> patient data
        self._next_id = 0
        self._seed_synthetic_data()

    def _seed_synthetic_data(self):
        """Pre-load the index with synthetic patient case data for demo purposes."""
        synthetic_cases = [
            {"label": "Healthy Adult",          "vitals": {"heart_rate": 72, "blood_pressure_systolic": 115, "blood_pressure_diastolic": 75, "glucose_level": 90, "oxygen_saturation": 98, "temperature": 98.6, "respiratory_rate": 16}},
            {"label": "Pre-Diabetic",           "vitals": {"heart_rate": 80, "blood_pressure_systolic": 130, "blood_pressure_diastolic": 85, "glucose_level": 125, "oxygen_saturation": 97, "temperature": 98.4, "respiratory_rate": 17}},
            {"label": "Hypertensive Stage 1",   "vitals": {"heart_rate": 88, "blood_pressure_systolic": 145, "blood_pressure_diastolic": 95, "glucose_level": 95, "oxygen_saturation": 96, "temperature": 98.9, "respiratory_rate": 18}},
            {"label": "Hypertensive Stage 2",   "vitals": {"heart_rate": 95, "blood_pressure_systolic": 165, "blood_pressure_diastolic": 105, "glucose_level": 110, "oxygen_saturation": 95, "temperature": 99.2, "respiratory_rate": 20}},
            {"label": "Diabetic (Type 2)",       "vitals": {"heart_rate": 78, "blood_pressure_systolic": 135, "blood_pressure_diastolic": 88, "glucose_level": 210, "oxygen_saturation": 96, "temperature": 98.8, "respiratory_rate": 17}},
            {"label": "Cardiac Risk",            "vitals": {"heart_rate": 110, "blood_pressure_systolic": 155, "blood_pressure_diastolic": 100, "glucose_level": 130, "oxygen_saturation": 93, "temperature": 99.5, "respiratory_rate": 22}},
            {"label": "Respiratory Distress",    "vitals": {"heart_rate": 105, "blood_pressure_systolic": 125, "blood_pressure_diastolic": 82, "glucose_level": 100, "oxygen_saturation": 88, "temperature": 100.5, "respiratory_rate": 28}},
            {"label": "Healthy Athlete",         "vitals": {"heart_rate": 55, "blood_pressure_systolic": 105, "blood_pressure_diastolic": 65, "glucose_level": 82, "oxygen_saturation": 99, "temperature": 97.8, "respiratory_rate": 13}},
            {"label": "Elderly Stable",          "vitals": {"heart_rate": 70, "blood_pressure_systolic": 138, "blood_pressure_diastolic": 82, "glucose_level": 105, "oxygen_saturation": 95, "temperature": 97.5, "respiratory_rate": 18}},
            {"label": "Sepsis Risk",             "vitals": {"heart_rate": 125, "blood_pressure_systolic": 88, "blood_pressure_diastolic": 55, "glucose_level": 180, "oxygen_saturation": 90, "temperature": 102.8, "respiratory_rate": 26}},
        ]
        for case in synthetic_cases:
            self.add_patient(case["vitals"], case["label"])

    def add_patient(self, vitals: Dict[str, float], label: str = "Unknown") -> int:
        """Add a patient's vitals embedding to the index."""
        vector = create_embedding_vector(vitals)
        np_vector = np.array([vector], dtype=np.float32)
        self.index.add(np_vector)
        patient_id = self._next_id
        self.patient_store[patient_id] = {"label": label, "vitals": vitals}
        self._next_id += 1
        return patient_id

    def find_similar(self, vitals: Dict[str, float], k: int = 3) -> List[dict]:
        """Find the k most similar patient cases."""
        vector = create_embedding_vector(vitals)
        np_vector = np.array([vector], dtype=np.float32)
        distances, indices = self.index.search(np_vector, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx == -1:
                continue
            patient = self.patient_store.get(int(idx), {})
            results.append({
                "rank": i + 1,
                "label": patient.get("label", "Unknown"),
                "distance": float(distances[0][i]),
                "vitals": patient.get("vitals", {}),
            })
        return results


# Singleton instance
vector_db = VectorDBService()
