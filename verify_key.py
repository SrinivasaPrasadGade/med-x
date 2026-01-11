import os
import google.generativeai as genai
from dotenv import load_dotenv

def verify_key():
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("❌ Error: GOOGLE_API_KEY not found in environment variables.")
        print("Please ensure you have created a .env file with GOOGLE_API_KEY=<your_key>")
        return

    if api_key == "YOUR_NEW_GEMINI_API_KEY_HERE":
        print("⚠️  Warning: GOOGLE_API_KEY is set to the placeholder value.")
        print("Please edit the .env file and paste your actual API key.")
        return

    print(f"✅ GOOGLE_API_KEY found (length: {len(api_key)})")
    
    try:
        genai.configure(api_key=api_key)
        # Try a simple model list to verify validity (requires network)
        # print("Attempting to list models to verify key validity...")
        # for m in genai.list_models():
        #     if 'generateContent' in m.supported_generation_methods:
        #         print(f"  - Found model: {m.name}")
        #         break
        print("Configuration successful (Note: Actual validity depends on the key being correct).")
    except Exception as e:
        print(f"❌ Error configuring GenAI: {e}")

if __name__ == "__main__":
    verify_key()
