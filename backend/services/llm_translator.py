"""
LLM Translator Service (OpenAI)
Uses GPT to translate raw clinical data into empathetic,
understandable summaries for doctors and patients.
"""
import os
import json
from typing import Dict, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

SYSTEM_PROMPT = """You are a world-class medical AI assistant embedded in a Digital Twin healthcare platform. 
Your role is to translate complex clinical data, risk assessments, and simulation results into clear, 
empathetic, and actionable language that both doctors and patients can understand.

Guidelines:
- Be empathetic but clinically accurate.
- Use simple language for patients; include clinical terminology in parentheses for doctors.
- Always end with a clear, actionable recommendation.
- If data suggests urgency, clearly state the urgency level.
- Never diagnose — frame insights as "indicators" or "trends" that should be discussed with a healthcare provider.
"""


async def translate_risk_report(
    patient_name: str,
    vitals: Dict,
    risk_scores: Dict,
    health_score: float,
    similar_cases: list,
) -> str:
    """Generate a patient-friendly health summary from raw data."""
    prompt = f"""
Analyze the following patient data and provide a comprehensive, empathetic health summary:

**Patient:** {patient_name}
**Overall Health Score:** {health_score}/100

**Current Vitals:**
{json.dumps(vitals, indent=2)}

**Risk Assessment:**
{json.dumps(risk_scores, indent=2)}

**Similar Historical Cases (from our database):**
{json.dumps(similar_cases, indent=2)}

Please provide:
1. A brief, friendly summary of overall health status.
2. Key areas of concern (if any) explained in simple terms.
3. What the similar cases might tell us about future trends.
4. 3 specific, actionable recommendations.
"""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception as e:
        return _fallback_report(patient_name, health_score, risk_scores)


async def translate_simulation(
    patient_name: str,
    scenario_type: str,
    parameters: dict,
    result: dict,
) -> str:
    """Translate a simulation result into understandable language."""
    prompt = f"""
A "What-If" simulation was run for patient {patient_name}.

**Scenario Type:** {scenario_type}
**Scenario Parameters:** {json.dumps(parameters, indent=2)}
**Simulated Outcome:** {json.dumps(result, indent=2)}

Please explain the simulation outcome in patient-friendly language:
1. What was tested and why it matters.
2. The projected impact on their health (use the risk scores).
3. A clear recommendation: should they proceed, or consider alternatives?
"""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=800,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Simulation analysis unavailable: {str(e)}. Please review the raw data with your provider."


async def chat_with_twin(
    patient_context: str,
    user_message: str,
) -> str:
    """General conversational interaction about the patient's digital twin."""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "system", "content": f"Current patient context:\n{patient_context}"},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
            max_tokens=600,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"AI assistant temporarily unavailable: {str(e)}"


async def extract_structured_data_from_ocr(ocr_text: str) -> dict:
    """Use OpenAI to extract structured data from raw OCR text."""
    prompt = f"""
Extract structured medical data from this OCR-scanned report text. 
Return a valid JSON object with the following fields (use null if not found):

{{
  "patient_name": "",
  "vitals": {{
    "heart_rate": null,
    "blood_pressure_systolic": null,
    "blood_pressure_diastolic": null,
    "glucose_level": null,
    "oxygen_saturation": null,
    "temperature": null,
    "respiratory_rate": null
  }},
  "diagnosis": [],
  "medications": [],
  "notes": ""
}}

OCR Text:
{ocr_text}
"""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical data extraction specialist. Return ONLY valid JSON, no markdown."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=500,
        )
        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
            raw = raw.rsplit("```", 1)[0]
        return json.loads(raw)
    except Exception as e:
        return {"error": str(e), "raw_text": ocr_text}


async def extract_report_from_ocr(ocr_text: str) -> dict:
    """Use OpenAI to extract structured report data including affected organs from OCR text."""
    prompt = f"""
Extract structured medical report data from this OCR-scanned report text.
Return a valid JSON object with the following fields (use null or empty arrays if not found):

{{
  "title": "Report title (e.g., 'ECG Report', 'MRI Brain', 'Blood Test Report')",
  "summary": "A concise clinical summary of the report findings",
  "affected_organs": ["list of affected organs from: brain, heart, lungs, liver, stomach, kidneys, spine"],
  "doctor": "Doctor name if mentioned",
  "diagnosis": ["list of diagnoses found"],
  "medications": ["list of medications mentioned"],
  "vitals": {{
    "heart_rate": null,
    "blood_pressure_systolic": null,
    "blood_pressure_diastolic": null,
    "glucose_level": null,
    "oxygen_saturation": null,
    "temperature": null,
    "respiratory_rate": null
  }},
  "notes": "Any additional notes or recommendations"
}}

IMPORTANT: For affected_organs, analyze the diagnoses, findings, and conditions mentioned
and map them to the relevant organs. For example:
- Hypertension, ECG abnormalities → heart
- Pneumonia, COPD, asthma → lungs
- Hepatitis, fatty liver → liver
- Kidney disease, creatinine issues → kidneys
- Migraine, neurological issues → brain
- Back pain, disc issues → spine
- Gastritis, ulcers → stomach

OCR Text:
{ocr_text}
"""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical data extraction specialist. Return ONLY valid JSON, no markdown."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=800,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
            raw = raw.rsplit("```", 1)[0]
        return json.loads(raw)
    except Exception as e:
        return {"error": str(e), "raw_text": ocr_text}


def _fallback_report(name: str, score: float, risks: dict) -> str:
    """Fallback report when OpenAI API is unreachable."""
    high_risks = [k for k, v in risks.items() if v.get("level") in ("high", "critical")]
    risk_text = ", ".join(high_risks) if high_risks else "none detected"
    return f"""
## Health Summary for {name}

**Overall Health Score: {score}/100**

Your vitals have been analyzed. Key areas requiring attention: **{risk_text}**.

Please discuss these findings with your healthcare provider for personalized guidance.
This report was generated offline — a more detailed AI analysis will be available when the connection is restored.
""".strip()
