import sys
import os
from backend.lib.supabase_client import get_supabase
from backend.etl import MacroFetcher, TiingoFetcher, FugleFetcher

def test_fetchers():
    print("Testing V10.0 Fetchers...")
    client = get_supabase()
    
    # 皜祈岫 MacroFetcher (銝神?伐???fetch & transform)
    print("\n[Test] MacroFetcher...")
    macro = MacroFetcher(client)
    df = macro.fetch("VIXCLS", start_date="2024-01-01")
    records = macro.transform(df, indicator_code="VIX", series_id="VIXCLS")
    print(f"Fetched {len(records)} VIX records. Example: {records[0] if records else 'None'}")
    
    # 皜祈岫 TiingoFetcher
    print("\n[Test] TiingoFetcher...")
    tiingo = TiingoFetcher(client)
    try:
        raw = tiingo.fetch(ticker="AAPL", start_date="2024-01-01")
        records = tiingo.transform(raw)
        print(f"Fetched {len(records)} AAPL records. Example: {records[0] if records else 'None'}")
    except Exception as e:
        print(f"Tiingo Fetch Failed (Likely API Limit): {e}")

    # 皜祈岫 FugleFetcher
    print("\n[Test] FugleFetcher...")
    fugle = FugleFetcher(client)
    try:
        raw = fugle.fetch(ticker="2330", start_date="2024-01-01")
        records = fugle.transform(raw)
        print(f"Fetched {len(records)} 2330 records. Example: {records[0] if records else 'None'}")
    except Exception as e:
        print(f"Fugle Fetch Failed: {e}")

if __name__ == "__main__":
    # 蝣箔?頝臬?甇?Ⅱ
    sys.path.append(os.path.join(os.getcwd(), "backend"))
    test_fetchers()
