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
        多代理人辯證引擎 (Phase 13.2 升級版)。
        串接 Gemini LLM + 18 因子數據，產出結構化多空辯論結果。
        快取 TTL: 30 分鐘（5-Key 池充足，不需保守快取）。
        """
        cache_key = f"insights:dialectic:{ticker}"
        cached = self.redis.get(cache_key)
        if cached:
            result = json.loads(cached)
            result["cached"] = True
            return result

        # 1. 取得 18 因子評分作為辯論 Context
        scores_data = self._get_factor_context(ticker)

        # 2. 取得近期市場數據 Context
        market_ctx = self._get_market_summary(ticker)

        # 3. 呼叫 Multi-Agent 辯論
        from backend.lib.llm import get_llm
        llm = get_llm()

        context = f"股票代碼: {ticker}\n{scores_data}\n{market_ctx}"

        # 多頭代理人
        bull_prompt = f"""你是一位「多頭分析師」(Bull Analyst)。
背景資料:
{context}

請用繁體中文，提出 3 個看好此標的的論點。
格式要求 (純 JSON，不要 markdown):
{{"opinion": "看多", "confidence": 0-100, "arguments": ["論點1", "論點2", "論點3"]}}"""

        # 空頭代理人
        bear_prompt = f"""你是一位「空頭分析師」(Bear Analyst)。
背景資料:
{context}

請用繁體中文，提出 3 個看空此標的的風險。
格式要求 (純 JSON，不要 markdown):
{{"opinion": "看空", "confidence": 0-100, "arguments": ["風險1", "風險2", "風險3"]}}"""

        # 合成代理人
        bull_raw = llm.generate_content(bull_prompt)
        bear_raw = llm.generate_content(bear_prompt)

        synthesis_prompt = f"""你是一位「量化基金 CIO」(Chief Investment Officer)。
多頭觀點: {bull_raw}
空頭觀點: {bear_raw}
18因子評分: {scores_data}

請綜合多空雙方觀點，給出最終判決。
格式要求 (純 JSON，不要 markdown):
{{"verdict": "看多/看空/中性", "confidence": 0-100, "rationale": "一句話總結", "key_factor": "最關鍵因素"}}"""

        synthesis_raw = llm.generate_content(synthesis_prompt)

        # 4. 解析 LLM 輸出 (容錯處理)
        bull_data = self._safe_parse_json(bull_raw, {"opinion": "看多", "confidence": 60, "arguments": ["數據解析中..."]})
        bear_data = self._safe_parse_json(bear_raw, {"opinion": "看空", "confidence": 50, "arguments": ["數據解析中..."]})
        synthesis_data = self._safe_parse_json(synthesis_raw, {"verdict": "中性", "confidence": 55, "rationale": "待分析", "key_factor": "N/A"})

        consensus = {
            "ticker": ticker,
            "consensus": synthesis_data.get("verdict", "中性"),
            "conviction": synthesis_data.get("confidence", 50) / 100,
            "rationale": synthesis_data.get("rationale", ""),
            "key_factor": synthesis_data.get("key_factor", ""),
            "agents": [
                {
                    "name": "多頭分析師",
                    "role": "bull",
                    "opinion": bull_data.get("opinion", "看多"),
                    "confidence": bull_data.get("confidence", 50),
                    "arguments": bull_data.get("arguments", [])
                },
                {
                    "name": "空頭分析師",
                    "role": "bear",
                    "opinion": bear_data.get("opinion", "看空"),
                    "confidence": bear_data.get("confidence", 50),
                    "arguments": bear_data.get("arguments", [])
                }
            ],
            "updated_at": datetime.now().isoformat(),
            "cached": False
        }

        # 30 分鐘快取
        self.redis.setex(cache_key, 1800, json.dumps(consensus))
        return consensus

    def _get_factor_context(self, ticker: str) -> str:
        """取得 18 因子評分作為 LLM Context"""
        try:
            res = self.supabase.table("stock_scores_18") \
                .select("composite_score, v_avg, g_avg, q_avg, m_avg") \
                .eq("symbol", ticker) \
                .order("trade_date", desc=True) \
                .limit(1).execute()

            if res.data:
                d = res.data[0]
                return (f"18因子評分: 綜合={d.get('composite_score', 'N/A')}, "
                        f"價值={d.get('v_avg', 'N/A')}, 成長={d.get('g_avg', 'N/A')}, "
                        f"品質={d.get('q_avg', 'N/A')}, 動能={d.get('m_avg', 'N/A')}")
        except Exception:
            pass
        return "18因子評分: 尚無資料"

    def _get_market_summary(self, ticker: str) -> str:
        """取得近期市場摘要"""
        try:
            res = self.supabase.table("daily_price") \
                .select("trade_date, close_price, volume") \
                .eq("stock_code", ticker) \
                .order("trade_date", desc=True) \
                .limit(5).execute()

            if res.data:
                prices = [f"{r['trade_date']}: ${r['close_price']}" for r in res.data]
                return f"近期收盤價: {', '.join(prices)}"
        except Exception:
            pass
        return "近期市場數據: 尚無資料"

    @staticmethod
    def _safe_parse_json(raw: str, fallback: Dict) -> Dict:
        """安全解析 LLM 回傳的 JSON（容錯處理）"""
        if not raw:
            return fallback
        try:
            # 嘗試清理 markdown code block
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[-1].rsplit("```", 1)[0]
            return json.loads(cleaned)
        except (json.JSONDecodeError, ValueError):
            return fallback

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
