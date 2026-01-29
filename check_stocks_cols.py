import os
import sys
sys.path.append('backend')
from lib.supabase_client import get_supabase

supabase = get_supabase()
try:
    res = supabase.table('stocks').select('*').limit(1).execute()
    if res.data:
        print("Columns in 'stocks':", res.data[0].keys())
    else:
        print("'stocks' table is empty or could not be queried.")
except Exception as e:
    print("Error querying 'stocks':", e)
