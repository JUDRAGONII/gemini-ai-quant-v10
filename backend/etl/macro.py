import pandas_datareader.data as web
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
from lib.supabase_client import get_supabase
from lib.config import Config

# Mapping: Functional Name -> FRED Series ID
MACRO_INDICATORS = {
    "GDP": "GDP",                # Gross Domestic Product
    "CPI": "CPIAUCSL",           # Consumer Price Index
    "UNRATE": "UNRATE",          # Unemployment Rate
    "FEDFUNDS": "FEDFUNDS",      # Federal Funds Effective Rate
    "VIX": "VIXCLS",             # CBOE Volatility Index
    "M2": "M2SL",                # M2 Money Stock
}

class MacroETL:
    def __init__(self):
        self.supabase = get_supabase()
        if not Config.FRED_API_KEY:
            print("[Warning] FRED_API_KEY is missing. Macro ETL might fail.")

    def fetch_series(self, series_id: str, start_date: str) -> pd.DataFrame:
        """Fetch data from FRED using pandas-datareader"""
        try:
            df = web.DataReader(series_id, "fred", start_date, api_key=Config.FRED_API_KEY)
            return df
        except Exception as e:
            print(f"Error fetching {series_id}: {e}")
            return pd.DataFrame()

    def transform_and_load(self, series_name: str, series_id: str, df: pd.DataFrame):
        """Transform dataframe and upsert to Supabase"""
        if df.empty:
            return

        records = []
        for index, row in df.iterrows():
            # index is datetime
            val = row[series_id]
            if pd.isna(val):
                continue
                
            records.append({
                "indicator_code": series_name, # Storing unified code (e.g. "GDP") not FRED ID
                "reference_date": index.strftime('%Y-%m-%d'),
                "value": float(val),
                "category": "macro"
            })

        if not records:
            return

        # Upsert in batches to avoid payload limits
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            try:
                self.supabase.table("macro_indicators").upsert(
                    batch, 
                    on_conflict="indicator_code,reference_date"
                ).execute()
                print(f"Upserted {len(batch)} records for {series_name}")
            except Exception as e:
                print(f"Error upserting batch for {series_name}: {e}")

    def run(self, lookback_days=365*5):
        """Main execution method"""
        start_date = (datetime.now() - timedelta(days=lookback_days)).strftime('%Y-%m-%d')
        print(f"Starting Macro ETL from {start_date}...")

        for name, series_id in MACRO_INDICATORS.items():
            print(f"Processing {name} ({series_id})...")
            df = self.fetch_series(series_id, start_date)
            self.transform_and_load(name, series_id, df)
        
        print("Macro ETL Completed.")

if __name__ == "__main__":
    etl = MacroETL()
    etl.run()
