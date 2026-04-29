<p align="center">
  <h1 align="center">🩺 aidAR — AI + AR Medical Intelligence Platform</h1>
  <p align="center">
    <em>A next-generation clinical intelligence platform combining 3D anatomical simulation, multi-agent AI diagnostics, and real-time digital twin biometrics.</em>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Three.js-0.183-black?style=flat-square&logo=three.js&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" />
    <img src="https://img.shields.io/badge/Gemini_API-2.0-4285F4?style=flat-square&logo=google&logoColor=white" />
    <img src="https://img.shields.io/badge/TailwindCSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  </p>
</p>

---

## 📌 Overview

**aidAR** is a full-stack medical intelligence platform built for the convergence of **3D anatomical visualization**, **multi-agent AI diagnostics**, and **real-time biometric monitoring**. It features an interactive WebGL-powered 3D human body viewer with emergency procedure simulations (CPR, hemorrhage control), five specialized AI agents, and an AR narrator that provides step-by-step voice guidance during procedures.

> 🏆 Built by **Team VibeCoders — NMIT Bangalore**

---

## ✨ Key Features

### 🫀 3D Anatomy Viewer
- Fully interactive, procedurally rigged 3D human body model rendered via **Three.js WebGL**
- Supports **CPR simulation**, **hemorrhage control**, and **airway management** with GPU-accelerated geometry animations
- Orbit controls, scene lighting, and dynamic camera positioning

### 🤖 Doctor AI Agent
- Conversational multi-agent diagnostic engine powered by **Google Gemini LLM**
- Interprets natural-language symptom descriptions in **English and Hindi/Hinglish**
- India-first medical context (Paracetamol, Dolo-650, Dengue, Malaria considerations)
- Routes to evidence-based first-aid protocols in real time

### 🧠 Brain AI Agent
- Neuro-imaging analysis agent for **MRI/CT scan** anomaly detection
- Measures cortical thickness and flags early neurological markers
- Confidence scoring for clinical decision support

### 🩹 Skin AI Agent
- Dermatological classification of uploaded skin lesion photographs
- Distinguishes between benign and malignant presentations
- Delivers risk scores with structured clinical recommendations

### 🧬 Digital Twin Agent
- Real-time biometric synchronization onto an interactive 3D patient model
- Live physiological telemetry via **WebSocket**
- Continuous health monitoring dashboard

### 📡 AR Narrator
- Browser-native **TTS narration system** using Web Speech API
- Real-time step-by-step voice guidance during 3D procedure simulations
- Context-aware narration triggered by procedure events

---

## 🏗️ Architecture

```
aidAR/
├── medhelp/                    # Frontend (Vite + TypeScript)
│   ├── index.html              # Main SPA entry — landing + app pages
│   ├── vite.config.js          # Vite dev server config
│   ├── tsconfig.json           # TypeScript configuration
│   ├── package.json            # Frontend dependencies
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── models/             # 3D FBX models (Blender exports)
│   └── src/
│       ├── main.ts             # App entry — routing, auth, tabs
│       ├── landing.ts          # Landing page animations (Anime.js v4)
│       ├── title-reveal.ts     # Hero title reveal animation
│       ├── style.css           # Full design system + themes
│       ├── ai-services.ts      # Frontend AI service integrations
│       ├── viewer/
│       │   ├── scene.ts        # Three.js scene setup & lighting
│       │   ├── model.ts        # FBX model loader & rigging
│       │   └── animations.ts   # CPR, hemorrhage procedure animations
│       ├── chatbot/
│       │   ├── chatbot-ui.ts   # Doctor AI chat interface
│       │   ├── diagnostic-engine.ts  # Symptom routing logic
│       │   └── symptom-data.ts # Medical symptom knowledge base
│       └── narrator/
│           ├── narrator.ts     # TTS narration controller
│           └── narration-data.ts  # Procedure narration scripts
│
├── app.py                      # FastAPI backend server
├── medical_ai_service.py       # Gemini API integration + retry logic
├── .env                        # API keys (not committed)
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **3D Rendering** | Three.js + WebGL | Procedural anatomy viewer & digital twin |
| **Frontend** | Vite + TypeScript | Lightning-fast build tooling with strict typing |
| **Animations** | Anime.js v4 | Spring-physics UI kinetics & procedural animations |
| **Styling** | TailwindCSS 4 + CSS Custom Properties | Adaptive dark/light theming engine |
| **Backend** | FastAPI + Python | Async API orchestrating multi-agent AI pipeline |
| **AI Engine** | Google Gemini 2.0 Flash | LLM & Vision models for all five AI agents |
| **Voice** | Web Speech API | Browser-native TTS for AR narrator guidance |
| **Real-time** | WebSocket | Bidirectional biometric telemetry |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.11
- **npm** ≥ 9.x
- A **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/uchiha-sasuke-03/aidAR-VibeCoders-NMIT.git
cd aidAR-VibeCoders-NMIT
```

### 2. Setup Backend

```bash
# Install Python dependencies
pip install fastapi uvicorn pydantic python-dotenv google-genai

# Create .env file with your Gemini API key
echo GEMINI_API_KEY=your_api_key_here > .env

# Start the FastAPI backend server
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### 3. Setup Frontend

```bash
# Navigate to the frontend directory
cd medhelp

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Open in Browser

Navigate to **http://localhost:5173** to access the full aidAR platform.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send symptom description, receive AI diagnosis |

**Request Body:**
```json
{
  "user_message": "I have a headache and fever since 3 days"
}
```

**Response:**
```json
{
  "reply": "• Possible causes: Viral fever, Dengue, Typhoid..."
}
```

---

## 🎨 Design Features

- **Dark/Light Mode** — Full adaptive theming with CSS custom properties
- **Editorial Typography** — Playfair Display, Inter, and DM Mono fonts
- **Particle Engine** — Canvas-based animated particle background
- **Glassmorphism** — Frosted glass UI panels with backdrop blur
- **Micro-animations** — Scroll reveals, counter animations, waveform telemetry
- **Responsive Layout** — Mobile-first design with collapsible side panels

---

## 👥 Team VibeCoders — NMIT Bangalore

Built with ❤️ for advancing healthcare through AI + AR technology.

---

## 📄 License

This project is built for educational and hackathon purposes.

---

<p align="center">
  <strong>aidAR</strong> — Redefining Clinical AI 🧬
</p>
