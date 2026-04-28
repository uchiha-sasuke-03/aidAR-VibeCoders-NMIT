const API_BASE = "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API Error");
  }
  return res.json();
}

// ─── Patient Endpoints ───────────────────────
export const createPatient = (data) =>
  request("/patients/", { method: "POST", body: JSON.stringify(data) });

export const getPatient = (id) =>
  request(`/patients/${id}`);

export const listPatients = () =>
  request("/patients/");

export const updateVitals = (id, vitals) =>
  request(`/patients/${id}/vitals`, { method: "PUT", body: JSON.stringify(vitals) });

export const getAIReport = (id) =>
  request(`/patients/${id}/report`);

// ─── Simulation Endpoints ────────────────────
export const runSimulation = (data) =>
  request("/simulate/", { method: "POST", body: JSON.stringify(data) });

export const getMedications = () =>
  request("/simulate/medications");

export const getLifestyleOptions = () =>
  request("/simulate/lifestyle-options");

// ─── OCR Endpoints ───────────────────────────
export const ocrExtract = (imageBase64) =>
  request("/ocr/extract", { method: "POST", body: JSON.stringify({ image_base64: imageBase64 }) });

export const ocrDemo = () =>
  request("/ocr/demo", { method: "POST" });

export const ocrExtractReport = (imageBase64) =>
  request("/ocr/extract-report", { method: "POST", body: JSON.stringify({ image_base64: imageBase64 }) });

// ─── Chat Endpoint ───────────────────────────
export const chatWithTwin = (patientId, message) =>
  request("/chat", {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId, message, include_context: true }),
  });
