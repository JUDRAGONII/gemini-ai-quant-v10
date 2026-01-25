import psycopg2
import os

def rebuild_stocks_table():
    conn_str = "postgres://postgres:0824-ii-n-8-Su@db:5432/postgres"
    sql = """
    -- Drop existing if needed (be careful, but here we are clean-slate)
    DROP TABLE IF EXISTS public.stocks CASCADE;
    
    CREATE TABLE public.stocks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        symbol TEXT NOT NULL UNIQUE,
        name TEXT,
        market TEXT DEFAULT 'TW',
        priority INTEGER DEFAULT 2,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Permissions
    GRANT ALL ON public.stocks TO postgres, anon, authenticated, service_role;
    
    -- Minimal Policy (Allow all for initial seeding)
    ALTER TABLE public.stocks DISABLE ROW LEVEL SECURITY;
    
    NOTIFY pgrst, 'reload schema';
    """
    try:
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql)
        print("SUCCESS: public.stocks rebuilt successfully.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    rebuild_stocks_table()
