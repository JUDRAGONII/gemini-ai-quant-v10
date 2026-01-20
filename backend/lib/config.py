import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Config:
    # Environment
    ENV = os.getenv("ENV", "development")
    
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL", "http://kong:8000")
    SERVICE_ROLE_KEY = os.getenv("SERVICE_ROLE_KEY")
    
    # APIs
    FRED_API_KEY = os.getenv("FRED_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_1") or os.getenv("GEMINI_API_KEY") # Support numbered or single
    TIINGO_API_KEY = os.getenv("TIINGO_API_KEY_1") or os.getenv("TIINGO_API_KEY")

    # Timeouts & Retries
    API_TIMEOUT = 30
    MAX_RETRIES = 3

    @classmethod
    def validate(cls):
        """Ensure critical config is present"""
        errors = []
        if not cls.SERVICE_ROLE_KEY:
            errors.append("SERVICE_ROLE_KEY is missing")
        # Add other critical checks as needed
        
        if errors:
            raise ValueError(f"Configuration Errors: {', '.join(errors)}")

# Validate on import
Config.validate()
