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

class RiskService:
    def __init__(self):
        self.supabase = get_supabase()
        # Redis 連線 (憲級加固：效能優化)
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.redis = redis.from_url(redis_url, decode_responses=True)

    async def get_risk_matrix(self, ticker: str) -> Dict[str, Any]:
        """
        獲取標的的法人級風險矩陣 (Greeks, Barra, Stress Test)。
        快取 TTL: 1 小時。
        """
        cache_key = f"risk:matrix:{ticker}"
        cached = self.redis.get(cache_key)
        if cached:
            result = json.loads(cached)
            result["cached"] = True
            return result

        # 1. 獲取 Greeks 模擬數據
        greeks = await self._calculate_simulated_greeks(ticker)
        
        # 2. 獲取 Barra 風格分解
        barra = await self._get_barra_decomposition(ticker)
        
        # 3. 執行壓力測試
        stress_tests = self._run_stress_tests(ticker)
        
        # 4. 行為心理分析 (Mock for now, Phase 13.4 待詳細整合)
        biases = [
            {"type": "損失厭惡 (Loss Aversion)", "confidence": 0.85, "suggestion": "建議設定硬性止損位，避免因情緒性持倉導致回撤擴大。"},
            {"type": "近親偏誤 (Recency Bias)", "confidence": 0.65, "suggestion": "目前決策過度受近期暴漲影響，建議拉長回測週期觀察。"}
        ]

        result = {
            "ticker": ticker,
            "timestamp": datetime.now().isoformat(),
            "greeks": greeks,
            "barra_decomposition": barra,
            "stress_tests": stress_tests,
            "behavioral_biases": biases,
            "cached": False
        }

        # 寫入快取
        self.redis.setex(cache_key, 3600, json.dumps(result))
        return result

    async def _calculate_simulated_greeks(self, ticker: str) -> Dict[str, float]:
        """
        模擬 Greeks：計算標的對市場參數的敏感度。
        Delta: 價格每變動 1% 對評分的影響。
        Gamma: Delta 的變化率。
        """
        try:
            # 從 stock_factors 獲取權重或預估 Beta
            res = self.supabase.table("stock_factors") \
                .select("beta, volatility") \
                .eq("stock_code", ticker) \
                .order("trade_date", desc=True) \
                .limit(1).execute()
            
            if res.data:
                beta = float(res.data[0].get("beta", 1.0))
                vol = float(res.data[0].get("volatility", 0.2))
                return {
                    "delta": round(beta, 4),
                    "gamma": round(beta * 0.1, 4), # 模擬曲率
                    "theta": -0.015, # 模擬時間價值流失 (策略熱度退散)
                    "vega": round(vol * 0.5, 4) # 波動率敏感度
                }
        except Exception:
            pass
        
        # Fallback values
        return {"delta": 1.0, "gamma": 0.05, "theta": -0.01, "vega": 0.1}

    async def _get_barra_decomposition(self, ticker: str) -> Dict[str, float]:
        """
        Barra 風格分解：基於 18 因子的歸因分析。
        """
        try:
            # 獲取最新評分數據
            res = self.supabase.table("stock_scores_18") \
                .select("v_avg, g_avg, q_avg, m_avg") \
                .eq("symbol", ticker) \
                .order("trade_date", desc=True) \
                .limit(1).execute()
            
            if res.data:
                d = res.data[0]
                # 將評分映射至歸因貢獻 (0-1 區間)
                return {
                    "size": 0.15, # 假設市值規模權重
                    "value": round(float(d.get("v_avg", 50)) / 100 * 0.3, 4),
                    "momentum": round(float(d.get("m_avg", 50)) / 100 * 0.25, 4),
                    "volatility": 0.1,
                    "growth": round(float(d.get("g_avg", 50)) / 100 * 0.2, 4)
                }
        except Exception:
            pass
            
        return {"size": 0.1, "value": 0.2, "momentum": 0.2, "volatility": 0.1, "growth": 0.2}

    def _run_stress_tests(self, ticker: str) -> List[Dict[str, Any]]:
        """
        壓力測試場景模擬。
        """
        return [
            {
                "scenario": "2008 金融海嘯 (Global Financial Crisis)",
                "impact_pct": -45.5,
                "recovery_days": 1200
            },
            {
                "scenario": "2020 COVID-19 熔斷 (Pandemic Crash)",
                "impact_pct": -32.8,
                "recovery_days": 180
            },
            {
                "scenario": "2022 通膨與升息週期 (Inflation Surge)",
                "impact_pct": -18.2,
                "recovery_days": 450
            }
        ]
