import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load API key
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env file!")

# Initialize client
client = genai.Client(api_key=API_KEY)

# ✅ Updated working models
PRIMARY_MODEL = "gemini-2.0-flash-001"
FALLBACK_MODEL = "gemini-2.0-flash-lite-001"


def query_medical_ai(user_prompt):
    """
    Queries Gemini with retry + fallback + India-focused medical rules.
    """
    
    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL]

    for model_id in models_to_try:
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model_id,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction="""You are a strict, factual clinical AI for the 'medhelp' platform. 

CRITICAL RULES:
1. INDIA-FIRST CONTEXT:
   - Use Indian terms (Paracetamol, Dolo-650, Crocin)
   - Consider Dengue, Malaria, Typhoid, Vitamin deficiencies
   - Suggest Indian foods

2. DOMAIN RESTRICTION:
   - Only medical topics
   - Otherwise say: "I am a specialized medical assistant for India and can only answer health-related questions."

3. RAG-LIKE OUTPUT:
   - Bullet points only
   - No filler text

4. EMERGENCY:
   - Suggest calling 108 / 112 if serious
   - Always include doctor disclaimer

5. LANGUAGE:
   - Reply in Hindi if user uses Hindi (even Hinglish)
""",
                        temperature=0.0,
                    )
                )

                return response.text

            except Exception as e:
                error_msg = str(e)

                # 🔁 Retry for server/load issues
                if ("429" in error_msg or "503" in error_msg) and attempt < 2:
                    print(f"⚠️ Rate/server issue. Retrying in {2 ** attempt}s...")
                    time.sleep(2 ** attempt)
                    continue

                # 🔄 If model not found → switch model
                if "404" in error_msg:
                    print(f"❌ Model {model_id} not found. Switching model...")
                    break

                # ❌ Other errors
                print(f"\n🔥 ERROR: {error_msg}\n")
                return f"SYSTEM ERROR: {error_msg}"

    return "⚠️ All models failed. Please try again later."


if __name__ == "__main__":
    print(f"Connecting to Gemini ({PRIMARY_MODEL})...")

    test_prompt = "i have a fracture on my right leg, dard bohot ho raha hai"

    print("\nAsking:", test_prompt)
    print("-" * 40)

    answer = query_medical_ai(test_prompt)
    print(answer)
if __name__ == "__main__":
    print("Listing available models...\n")

    for m in client.models.list():
        print(m.name)