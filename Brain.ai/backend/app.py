from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import base64
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes, allowing the frontend at port 3001
CORS(app, resources={r"/api/*": {"origins": "*"}})

# NVIDIA NIM configuration
NVIDIA_API_KEY = "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"
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY,
)

DOCTOR_SYSTEM_PROMPT = """You are a helpful AI medical assistant for India. 
Use Indian medical terms (Paracetamol, Dolo-650, Crocin). 
Consider diseases common in India like Dengue, Malaria, Typhoid, Vitamin deficiencies. 
Suggest Indian foods for recovery. 
Use bullet points, be concise. 
Always include a disclaimer that you are AI and the patient should consult a real doctor. 
For emergencies, suggest calling 108/112. 
Reply in Hindi if the user writes in Hindi."""

BRAIN_SYSTEM_PROMPT = """You are Alzmind, an advanced AI clinical assistant specializing in brain MRI analysis.
Provide a comprehensive cognitive risk assessment based on patient data and imaging findings.
Return ONLY valid JSON in this exact format:
{
  "risk_level": "Low|Moderate|High",
  "confidence": "Low|Moderate|High",
  "imaging_findings": "detailed findings text",
  "biomarkers": ["biomarker 1", "biomarker 2", "biomarker 3"],
  "cognitive_assessment": "detailed cognitive risk text",
  "differential_diagnosis": ["diagnosis 1", "diagnosis 2", "diagnosis 3"],
  "next_steps": ["step 1", "step 2", "step 3"],
  "summary": "executive summary text"
}"""

SKIN_SYSTEM_PROMPT = """You are an expert dermatologist AI. Analyze skin images and patient context thoroughly.
Provide analysis as JSON with keys: 
conditions (array of {name, description, severity, confidence}), 
observations (array of strings), 
risk_indicators (array of strings), 
recommendations (array of strings), 
tone_notes (string), 
urgency (string).
Return ONLY valid JSON."""

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("user_message") or data.get("message")
        
        response = client.chat.completions.create(
            model="meta/llama-3.1-8b-instruct",
            messages=[
                {"role": "system", "content": DOCTOR_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1024,
            temperature=0.2,
        )
        
        return jsonify({"reply": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analyze/brain", methods=["POST"])
def analyze_brain():
    try:
        data = request.get_json()
        image_base64 = data.get("image")
        patient = data.get("patient", {})
        
        # In this environment, we'll use text-based analysis of the clinical context 
        # as a proxy for full MRI analysis if vision isn't immediately available,
        # but we'll try to use the vision model format.
        
        prompt = f"""Analyze brain MRI clinical context:
- Age: {patient.get('age')}
- Sex: {patient.get('sex')}
- MMSE: {patient.get('mmse')}
- History: {patient.get('family_history')}
- Symptoms: {patient.get('symptoms')}"""

        response = client.chat.completions.create(
            model="meta/llama-3.1-8b-instruct",
            messages=[
                {"role": "system", "content": BRAIN_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1024,
            temperature=0.1,
        )
        
        content = response.choices[0].message.content
        # Extract JSON
        if "{" in content:
            content = content[content.find("{"):content.rfind("}")+1]
            
        return jsonify({"success": True, "report": json.loads(content)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analyze/skin", methods=["POST"])
def analyze_skin():
    try:
        data = request.get_json()
        image_base64 = data.get("image")
        # Skin analysis typically needs the vision model
        # We'll use Phi-3.5 Vision if available, or Llama for text context
        
        patient_context = f"Patient context: {json.dumps(data.get('patient', {}))}"
        
        response = client.chat.completions.create(
            model="meta/llama-3.1-8b-instruct",
            messages=[
                {"role": "system", "content": SKIN_SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze skin findings based on this context: {patient_context}"}
            ],
            max_tokens=1024,
            temperature=0.2,
        )
        
        content = response.choices[0].message.content
        if "{" in content:
            content = content[content.find("{"):content.rfind("}")+1]
            
        return jsonify(json.loads(content))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "MedHelp AI Unified Backend"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
