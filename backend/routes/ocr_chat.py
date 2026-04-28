"""
OCR and Chat routes.
"""
from fastapi import APIRouter, HTTPException
from models.patient import OCRRequest, ChatRequest
from services.ocr_service import extract_text_from_base64
from services.llm_translator import extract_structured_data_from_ocr, extract_report_from_ocr, chat_with_twin
from routes.patients import patients_db
import json

router = APIRouter(prefix="/api", tags=["OCR & Chat"])


@router.post("/ocr/extract")
async def ocr_extract(req: OCRRequest):
    """Extract text from a medical report image using OCR + AI structuring."""
    raw_text = extract_text_from_base64(req.image_base64)
    structured = await extract_structured_data_from_ocr(raw_text)
    return {"raw_text": raw_text, "structured_data": structured}


@router.post("/ocr/demo")
async def ocr_demo():
    """Run OCR demo with mock data (no image required)."""
    from services.ocr_service import _mock_ocr_response
    raw_text = _mock_ocr_response()
    structured = await extract_structured_data_from_ocr(raw_text)
    return {"raw_text": raw_text, "structured_data": structured}


@router.post("/ocr/extract-report")
async def ocr_extract_report(req: OCRRequest):
    """Extract structured report data from a medical report image.
    Returns title, summary, affected_organs, doctor, diagnosis, medications, vitals, notes."""
    raw_text = extract_text_from_base64(req.image_base64)
    report_data = await extract_report_from_ocr(raw_text)
    return {"raw_text": raw_text, "report_data": report_data}


@router.post("/chat")
async def chat(req: ChatRequest):
    """Chat with the AI about a patient's digital twin."""
    patient_context = ""
    if req.include_context and req.patient_id in patients_db:
        patient = patients_db[req.patient_id]
        patient_context = json.dumps({
            "name": patient.get("name"),
            "age": patient.get("age"),
            "vitals": patient.get("vitals"),
            "risk_scores": patient.get("risk_scores"),
            "health_score": patient.get("health_score"),
            "medical_history": patient.get("medical_history"),
            "medications": patient.get("current_medications"),
        }, indent=2)

    response = await chat_with_twin(patient_context, req.message)
    return {"response": response}
