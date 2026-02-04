import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
import google.generativeai as genai
from backend.lib.config import Config

class GeminiClient:
    def __init__(self):
        if not Config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing")
        
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def generate_content(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return ""

# Singleton to reuse
_client = None

def get_llm():
    global _client
    if _client is None:
        _client = GeminiClient()
    return _client
