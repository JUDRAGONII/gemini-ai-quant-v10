import pandas as pd
import numpy as np
import redis
import json
import os
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from backend.lib.supabase_client import get_supabase
from dotenv import load_dotenv

load_dotenv()

class InsightsService:
    def __init__(self):
        self.supabase = get_supabase()
        # Redis 連線 (憲級加固：效能優化)
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.redis = redis.from_url(redis_url, decode_responses=True)

    async def get_correlation(
        self, 
        asset_a: str, 
        asset_b: str, 
        window: int = 30, 
        days: int = 365,
        lag: int = 0
    ) -> Dict[str, Any]:
        """
        計算滯後相關性 (Lagged Correlation)。
        lag > 0 代表 asset_a 領先 asset_b；lag < 0 代表 asset_a 滯後於 asset_b。
        """
        cache_key = f"insights:corr:{asset_a}:{asset_b}:{window}:{days}:{lag}"
        cached_res = self.redis.get(cache_key)
        if cached_res:
            res = json.loads(cached_res)
            res["cached"] = True
            return res

        # 1. 獲取數據 (擴展獲取範圍以滿足 lag 需求)
        fetch_days = days + abs(lag) + window
        data_a = await self._fetch_asset_data(asset_a, fetch_days)
        data_b = await self._fetch_asset_data(asset_b, fetch_days)

        if not data_a or not data_b:
            return {"status": "error", "message": "數據量不足，無法計算相關性"}

        # 2. 數據對齊
        df_a = pd.DataFrame(data_a).set_index("date")["value"]
        df_b = pd.DataFrame(data_b).set_index("date")["value"]
        df = pd.concat([df_a, df_b], axis=1).sort_index().ffill().dropna()
        df.columns = ["a", "b"]

        # 3. 執行滯後處理 (Lagged Alignment)
        if lag != 0:
            df["b"] = df["b"].shift(-lag) # 讓 b 往前或往後移
            df = df.dropna()

        if len(df) < window:
             return {"status": "error", "message": "對齊後數據量不足以支援窗口計算"}

        # 4. 計算滾動相關係數
        correlation = df["a"].rolling(window=window).corr(df["b"])
        
        # 5. 格式化結果
        series = []
        clean_corr = correlation.dropna()
        for dt, val in clean_corr.tail(days).items():
            series.append({
                "date": dt.strftime("%Y-%m-%d") if isinstance(dt, (date, datetime)) else str(dt),
                "value": round(float(val), 4)
            })

        if not series:
            return {"status": "error", "message": "計算結果為空"}

        current_val = series[-1]["value"]
        result = {
            "pair": [asset_a, asset_b],
            "window": window,
            "lag": lag,
            "series": series,
            "summary": {
                "current": current_val,
                "mean": round(float(clean_corr.mean()), 4),
                "status": self._get_corr_status(current_val),
                "max": round(float(clean_corr.max()), 4),
                "min": round(float(clean_corr.min()), 4)
            },
            "cached": False
        }

        # 寫入緩存 (TTL: 1小時)
        self.redis.setex(cache_key, 3600, json.dumps(result))
        return result

    def _get_corr_status(self, val: float) -> str:
        if val > 0.7: return "極強正相關"
        if val > 0.4: return "中度正相關"
        if val < -0.7: return "極強負相關"
        if val < -0.4: return "中度負相關"
        return "低度相關/中性"

    async def get_dialectic_consensus(self, ticker: str) -> Dict[str, Any]:
        """
        模擬多代理人辯證引擎 (對標 5.5 節)。
        現階段採用預定義邏輯與提示詞結構，為後續 LLM 接入預留。
        """
        cache_key = f"insights:dialectic:{ticker}"
        cached = self.redis.get(cache_key)
        if cached: return json.loads(cached)

        # 獲取基礎指標 (Mocking logic for now, connecting to real factor db)
        factors = self.supabase.table("stock_factors").select("*").eq("stock_code", ticker).order("trade_date", desc=True).limit(1).execute()
        
        # 這裡未來會調用 Multi-Agent 辯論。目前先產出基於因子的結構化分析。
        consensus = {
            "ticker": ticker,
            "consensus": "謹慎看多" if len(factors.data) > 0 else "中性待觀察",
            "agents": [
                {"name": "價值派 AI", "opinion": "看多", "reason": "估值低於歷史均值"},
                {"name": "動能派 AI", "opinion": "中性", "reason": "近期量能萎縮"},
                {"name": "宏觀派 AI", "opinion": "看多", "reason": "美聯儲降息預期支撐資產價格"}
            ],
            "conviction": 0.72,
            "updated_at": datetime.now().isoformat()
        }

        self.redis.setex(cache_key, 43200, json.dumps(consensus)) # 緩存 12 小時
        return consensus

    async def _fetch_asset_data(self, asset_key: str, days: int) -> List[Dict[str, Any]]:
        parts = asset_key.split(":")
        if len(parts) < 2: return []
        type_ = parts[0].upper()
        code = parts[1]
        start_date = (datetime.now() - timedelta(days=days)).date()

        if type_ == "STOCK":
            res = self.supabase.table("daily_price") \
                .select("trade_date, close_price") \
                .eq("stock_code", code) \
                .gte("trade_date", start_date.isoformat()) \
                .order("trade_date") \
                .execute()
            return [{"date": pd.to_datetime(r["trade_date"]), "value": float(r["close_price"])} for r in res.data]

        elif type_ == "MACRO":
            res = self.supabase.table("macro_indicators") \
                .select("reference_date, value") \
                .eq("indicator_code", code) \
                .gte("reference_date", start_date.isoformat()) \
                .order("reference_date") \
                .execute()
            return [{"date": pd.to_datetime(r["reference_date"]), "value": float(r["value"])} for r in res.data]

        elif type_ == "FX":
            res = self.supabase.table("exchange_rates") \
                .select("trade_date, rate") \
                .eq("currency_pair", code) \
                .gte("trade_date", start_date.isoformat()) \
                .order("trade_date") \
                .execute()
            return [{"date": pd.to_datetime(r["trade_date"]), "value": float(r["rate"])} for r in res.data]

        return []
