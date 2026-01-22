from supabase import create_client, Client
import os
from dotenv import load_dotenv
from threading import Lock

# 載入環境變數
load_dotenv()

class SupabaseSingleton:
    _instance = None
    _lock = Lock()

    @classmethod
    def get_client(cls) -> Client:
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    url = os.getenv("SUPABASE_URL", "http://kong:8000")
                    key = os.getenv("SERVICE_ROLE_KEY")
                    
                    if not url or not key:
                        raise ValueError("Missing SUPABASE_URL or SERVICE_ROLE_KEY environment variables")
                        
                    cls._instance = create_client(url, key)
        return cls._instance

# Helper function for easy import
def get_supabase() -> Client:
    return SupabaseSingleton.get_client()
