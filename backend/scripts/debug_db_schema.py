import psycopg2
import os
from dotenv import load_dotenv

def check_auth():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn_str = f"postgresql://postgres:{pw}@localhost:5432/postgres"
    
    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
        
        # Check schemas
        cur.execute("SELECT nspname FROM pg_namespace")
        schemas = [r[0] for r in cur.fetchall()]
        print(f"Schemas: {schemas}")
        
        # Check if auth schema exists
        if 'auth' not in schemas:
            print("ALERT: auth schema is MISSING from pg_namespace")
        
        # Check public tables
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [r[0] for r in cur.fetchall()]
        print(f"Public Tables: {tables}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Check failed: {e}")

if __name__ == "__main__":
    check_auth()
