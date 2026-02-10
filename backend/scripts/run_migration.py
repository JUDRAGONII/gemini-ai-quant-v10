import psycopg2
import os
import sys
from dotenv import load_dotenv

def run_migration(sql_file):
    load_dotenv()
    db_password = os.getenv('POSTGRES_PASSWORD', 'postgres')
    conn_str = f"postgresql://postgres:{db_password}@localhost:5432/postgres"
    
    try:
        if not os.path.exists(sql_file):
            print(f"Error: {sql_file} not found")
            return
            
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql = f.read()
            
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql)
        print(f"Successfully executed {sql_file}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_migration(sys.argv[1])
    else:
        print("Usage: python backend/scripts/run_migration.py <sql_file>")
