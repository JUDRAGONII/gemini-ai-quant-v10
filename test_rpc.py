import psycopg2, os
from dotenv import load_dotenv

def run():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    try:
        conn = psycopg2.connect(f"host='localhost' port='6100' user='postgres' password='{pw}' dbname='postgres'")
        cur = conn.cursor()
        print("Testing market_type='US', sort_by='volume', sort_order='desc'")
        cur.execute("SELECT * FROM fn_screen_stocks('{\"market_type\": \"US\"}'::jsonb, 'volume', 'desc', 0, 5)")
        res = cur.fetchall()
        print(f"Count: {len(res)}")
        for r in res:
            print(r)
            
        print("\nTesting market_type='TW', sort_by='volume', sort_order='desc'")
        cur.execute("SELECT * FROM fn_screen_stocks('{\"market_type\": \"TW\"}'::jsonb, 'volume', 'desc', 0, 2)")
        res_tw = cur.fetchall()
        print(f"Count: {len(res_tw)}")
        for r in res_tw:
            print(r)
            
        print("\nTesting no filtering {}, sort_by='volume', sort_order='desc'")
        cur.execute("SELECT * FROM fn_screen_stocks('{}'::jsonb, 'volume', 'desc', 0, 2)")
        res_all = cur.fetchall()
        print(f"Count: {len(res_all)}")
        for r in res_all:
            print(r)
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run()
