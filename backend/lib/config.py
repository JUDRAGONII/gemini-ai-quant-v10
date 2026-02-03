import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Config:
    # Environment
    ENV = os.getenv("ENV", "development")
    
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL", "http://kong:8000")
    SERVICE_ROLE_KEY = os.getenv("SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    
    # APIs
    FRED_API_KEY = os.getenv("FRED_API_KEY_1") or os.getenv("FRED_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_1") or os.getenv("GEMINI_API_KEY")
    
    # Tiingo Keys Registry (Dynamic detection)
    TIINGO_KEYS = []
    for i in range(1, 11): # 預設偵測至第 10 組
        key = os.getenv(f"TIINGO_API_KEY_{i}")
        if key:
            TIINGO_KEYS.append(key)
    
    # Fallback to single TIINGO_API_KEY if no numbered keys found
    if not TIINGO_KEYS and os.getenv("TIINGO_API_KEY"):
        TIINGO_KEYS.append(os.getenv("TIINGO_API_KEY"))

    TIINGO_API_KEY = TIINGO_KEYS[0] if TIINGO_KEYS else None
    
    # FMP (Financial Modeling Prep) Keys Registry
    FMP_KEYS = []
    for i in range(1, 11):  # 預設偵測至第 10 組
        key = os.getenv(f"FMP_API_KEY_{i}")
        if key:
            FMP_KEYS.append(key)
    
    # Fallback to single FMP_API_KEY if no numbered keys found
    if not FMP_KEYS and os.getenv("FMP_API_KEY"):
        FMP_KEYS.append(os.getenv("FMP_API_KEY"))
    
    FMP_API_KEY = FMP_KEYS[0] if FMP_KEYS else None
    
    FUGLE_API_KEY = os.getenv("FUGLE_API_KEY_1") or os.getenv("FUGLE_API_KEY")

    # Timeouts & Retries
    API_TIMEOUT = 30
    MAX_RETRIES = 3

    @classmethod
    def get_tiingo_key(cls, index: int = 0) -> str:
        """獲取特定索引的 Tiingo Key (用於輪詢)"""
        if not cls.TIINGO_KEYS:
            return None
        return cls.TIINGO_KEYS[index % len(cls.TIINGO_KEYS)]

    @classmethod
    def get_fmp_key(cls, index: int = 0) -> str:
        """獲取特定索引的 FMP Key (用於輪詢)"""
        if not cls.FMP_KEYS:
            return None
        return cls.FMP_KEYS[index % len(cls.FMP_KEYS)]

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
