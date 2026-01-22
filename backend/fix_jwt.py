import os
import jwt
import time
from dotenv import load_dotenv

# 載入 .env
load_dotenv()

ENV_PATH = ".env"
BACKUP_PATH = ".env.bak"

def generate_token(secret, role, expiration=None):
    payload = {
        "role": role,
        "iss": "supabase",
        "iat": int(time.time()),
        "exp": int(time.time()) + (3600 * 24 * 365 * 10)  # 10 years
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def fix_keys():
    print("=== JWT Key Diagnosis & Fix ===")
    
    secret = os.getenv("JWT_SECRET")
    if not secret:
        print("[!] JWT_SECRET missing in .env")
        return

    # Check length (PostgREST recommends 32 chars minimum)
    if len(secret) < 32:
        print(f"[!] JWT_SECRET is too short ({len(secret)} chars). Recommended 32+.")
        # We don't verify length strictly here, just warn.

    service_key = os.getenv("SERVICE_ROLE_KEY")
    anon_key = os.getenv("ANON_KEY")
    
    needs_update = False
    new_service_key = service_key
    new_anon_key = anon_key

    # Validate Service Key
    try:
        jwt.decode(service_key, secret, algorithms=["HS256"], options={"verify_aud": False})
        print("[ok] SERVICE_ROLE_KEY signature is valid.")
    except Exception as e:
        print(f"[x] SERVICE_ROLE_KEY invalid: {e}")
        print("    -> Generating new SERVICE_ROLE_KEY...")
        new_service_key = generate_token(secret, "service_role")
        needs_update = True

    # Validate Anon Key
    try:
        jwt.decode(anon_key, secret, algorithms=["HS256"], options={"verify_aud": False})
        print("[ok] ANON_KEY signature is valid.")
    except Exception as e:
        print(f"[x] ANON_KEY invalid: {e}")
        print("    -> Generating new ANON_KEY...")
        new_anon_key = generate_token(secret, "anon")
        needs_update = True

    if needs_update:
        print("Updating .env file...")
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        with open(BACKUP_PATH, "w", encoding="utf-8") as f:
            f.writelines(lines)
        print(f"[i] Backup created at {BACKUP_PATH}")

        with open(ENV_PATH, "w", encoding="utf-8") as f:
            for line in lines:
                if line.startswith("SERVICE_ROLE_KEY="):
                    f.write(f"SERVICE_ROLE_KEY={new_service_key}\n")
                elif line.startswith("ANON_KEY="):
                    f.write(f"ANON_KEY={new_anon_key}\n")
                else:
                    f.write(line)
        print("[ok] .env updated successfully.")
    else:
        print("[ok] All keys match the secret. No changes needed.")

if __name__ == "__main__":
    fix_keys()
