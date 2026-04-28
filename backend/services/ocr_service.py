"""
OCR Service (Tesseract)
Reads images of paper medical reports and extracts text.
Falls back to mock data if Tesseract is not installed.
"""
import base64
import io
import json
from typing import Optional
from PIL import Image

TESSERACT_AVAILABLE = False
try:
    import pytesseract
    # Quick test
    pytesseract.get_tesseract_version()
    TESSERACT_AVAILABLE = True
except Exception:
    pass


def extract_text_from_base64(image_b64: str) -> str:
    """
    Decode a base64-encoded image and extract text using Tesseract OCR.
    Falls back to a demo response if Tesseract is unavailable.
    """
    if not TESSERACT_AVAILABLE:
        return _mock_ocr_response()

    try:
        image_bytes = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        return f"OCR Error: {str(e)}"


def _mock_ocr_response() -> str:
    """Return a realistic mock OCR extraction for demo purposes."""
    return """
PATIENT MEDICAL REPORT
=======================
Patient Name: Jane Doe
Date: 2025-11-15
Facility: City General Hospital

VITALS:
  Blood Pressure: 142/92 mmHg
  Heart Rate: 88 bpm
  Blood Glucose (Fasting): 128 mg/dL
  SpO2: 96%
  Temperature: 98.9°F

DIAGNOSIS:
  - Stage 1 Hypertension
  - Pre-Diabetes (IFG)

MEDICATIONS:
  - Lisinopril 10mg daily
  - Metformin 500mg twice daily

NOTES:
  Patient reports occasional dizziness and fatigue.
  Recommend lifestyle modifications including low-sodium diet
  and 30 minutes of daily exercise. Follow-up in 3 months.
""".strip()
