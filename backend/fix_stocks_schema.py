import psycopg2
import os

def check_and_fix_schema():
    conn_str = "postgres://postgres:0824-ii-n-8-Su@db:5432/postgres"
    sql = """
    -- Ensure columns exist in stocks table
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stocks' AND column_name='priority') THEN
            ALTER TABLE public.stocks ADD COLUMN priority INTEGER DEFAULT 2;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stocks' AND column_name='is_active') THEN
            ALTER TABLE public.stocks ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stocks' AND column_name='market') THEN
            ALTER TABLE public.stocks ADD COLUMN market TEXT DEFAULT 'TW';
        END IF;
    END $$;
    
    NOTIFY pgrst, 'reload schema';
    """
    try:
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql)
        print("SUCCESS: stocks table schema verified/updated and PostgREST reloaded.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_and_fix_schema()
