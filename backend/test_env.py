import os
from supabase import create_client
from dotenv import load_dotenv

def verify_env():
    print("=== Environment Verification ===")
    
    # 1. Check .env presence
    if os.path.exists(".env"):
        print("[x] .env file exists")
    else:
        print("[ ] .env file MISSING")
        return

    load_dotenv()
    
    # 2. Check essential keys
    required_keys = [
        "POSTGRES_PASSWORD", "JWT_SECRET", "ANON_KEY", "SERVICE_ROLE_KEY",
        "GEMINI_API_KEY_1", "TIINGO_API_KEY_1"
    ]
    
    for key in required_keys:
        val = os.getenv(key)
        if val and "your_" not in val and "your-" not in val:
            print(f"[x] {key} is configured")
        else:
            print(f"[ ] {key} is NOT CONFIGURED or has dummy value")

    # 3. Check Supabase Connection (Local Kong)
    url = os.getenv("SUPABASE_URL", "http://localhost:8000")
    key = os.getenv("SERVICE_ROLE_KEY")
    
    try:
        # Note: We use the kong url which is mapped in docker-compose. 
        # For this script running on host, localhost:8000 is kong.
        supabase = create_client(url, key)
        # Try a simple query
        res = supabase.table("daily_price").select("*", count="exact").limit(1).execute()
        print("[x] Database Connection successful")
    except Exception as e:
        print(f"[ ] Database Connection FAILED: {e}")

if __name__ == "__main__":
    verify_env()
