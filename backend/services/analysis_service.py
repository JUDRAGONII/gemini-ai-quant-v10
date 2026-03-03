"""
Phase 13.1: 18 因子評分分析服務 (Analysis Service)
提供 VQGM 18 因子查詢、快取與批次處理能力。
"""
import json
import logging
import os
import redis
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from backend.lib.supabase_client import get_supabase
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# 18 因子中英文映射 (用於前端展示)
FACTOR_LABELS = {
    "v_pe_score": {"zh": "本益比", "en": "P/E Ratio"},
    "v_pb_score": {"zh": "股價淨值比", "en": "P/B Ratio"},
    "v_dy_score": {"zh": "殖利率", "en": "Dividend Yield"},
    "v_ev_ebitda_score": {"zh": "EV/EBITDA", "en": "EV/EBITDA"},
    "g_rev_growth_score": {"zh": "營收成長", "en": "Revenue Growth"},
    "g_eps_growth_score": {"zh": "EPS成長", "en": "EPS Growth"},
    "g_stability_score": {"zh": "盈餘穩定", "en": "Earnings Stability"},
    "q_roe_score": {"zh": "股東權益報酬", "en": "ROE"},
    "q_gm_score": {"zh": "毛利率", "en": "Gross Margin"},
    "q_nm_score": {"zh": "淨利率", "en": "Net Margin"},
    "q_lev_score": {"zh": "財務槓桿", "en": "Leverage"},
    "q_ocf_score": {"zh": "營運現金流", "en": "Op. Cash Flow"},
    "m_rs_score": {"zh": "相對強弱", "en": "Relative Strength"},
    "m_mom6m_score": {"zh": "半年動能", "en": "6M Momentum"},
    "m_rsi_score": {"zh": "RSI動能", "en": "RSI"},
    "m_vol_mom_score": {"zh": "量能動能", "en": "Volume Momentum"},
}

# 四維度定義
DIMENSIONS = {
    "value": {
        "zh": "價值", "en": "Value",
        "factors": ["v_pe_score", "v_pb_score", "v_dy_score", "v_ev_ebitda_score"],
        "avg_key": "v_avg"
    },
    "growth": {
        "zh": "成長", "en": "Growth",
        "factors": ["g_rev_growth_score", "g_eps_growth_score", "g_stability_score"],
        "avg_key": "g_avg"
    },
    "quality": {
        "zh": "品質", "en": "Quality",
        "factors": ["q_roe_score", "q_gm_score", "q_nm_score", "q_lev_score", "q_ocf_score"],
        "avg_key": "q_avg"
    },
    "momentum": {
        "zh": "動能", "en": "Momentum",
        "factors": ["m_rs_score", "m_mom6m_score", "m_rsi_score", "m_vol_mom_score"],
        "avg_key": "m_avg"
    }
}


class AnalysisService:
    """18 因子 VQGM 評分查詢服務"""

    def __init__(self):
        self.supabase = get_supabase()
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.redis = redis.from_url(redis_url, decode_responses=True)

    async def get_18factor_scores(self, symbol: str) -> Dict[str, Any]:
        """
        查詢單一標的的 18 因子評分。
        優先從 Redis 快取讀取 (TTL: 30 分鐘)。
        """
        cache_key = f"analysis:scores18:{symbol}"
        cached = self.redis.get(cache_key)
        if cached:
            result = json.loads(cached)
            result["cached"] = True
            return result

        # 從 DB 查詢最新評分
        res = self.supabase.table("stock_scores_18") \
            .select("*") \
            .eq("symbol", symbol) \
            .order("trade_date", desc=True) \
            .limit(1) \
            .execute()

        if not res.data:
            return {
                "status": "no_data",
                "symbol": symbol,
                "message": f"尚無 {symbol} 的 18 因子評分資料"
            }

        row = res.data[0]

        # 格式化為前端友善結構
        result = self._format_response(row)
        result["cached"] = False

        # 寫入快取 (30 分鐘)
        self.redis.setex(cache_key, 1800, json.dumps(result))
        return result

    async def get_batch_scores(self, symbols: List[str]) -> List[Dict[str, Any]]:
        """批次查詢多標的 18 因子評分"""
        results = []
        for symbol in symbols[:20]:  # 限制最多 20 筆
            score = await self.get_18factor_scores(symbol)
            results.append(score)
        return results

    async def trigger_calculation(self, target_date: str = None) -> Dict[str, Any]:
        """
        手動觸發 VQGM 計算 (呼叫 fn_calculate_vqgm RPC)。
        僅限 Service Role 呼叫。
        """
        if not target_date:
            target_date = datetime.now().strftime('%Y-%m-%d')

        try:
            res = self.supabase.rpc("fn_calculate_vqgm", {
                "p_target_date": target_date
            }).execute()
            return {"status": "ok", "result": res.data}
        except Exception as e:
            logger.error(f"VQGM 計算失敗: {e}")
            return {"status": "error", "message": str(e)}

    async def get_top_scores(self, limit: int = 20, dimension: str = "composite") -> List[Dict[str, Any]]:
        """
        取得綜合評分 Top N 排行榜。
        dimension: composite, value, growth, quality, momentum
        回傳含 name (股票名稱) 與 change_percent (今日漲跌幅) 的完整排行資料。
        """
        order_col = "composite_score"
        if dimension in DIMENSIONS:
            order_col = DIMENSIONS[dimension]["avg_key"]

        res = self.supabase.table("stock_scores_18") \
            .select("symbol, trade_date, composite_score, v_avg, g_avg, q_avg, m_avg") \
            .order(order_col, desc=True) \
            .limit(limit) \
            .execute()

        if not res.data:
            return []

        # 取出所有 symbol，批次查詢名稱與漲跌幅
        symbols = [row["symbol"] for row in res.data]

        # 查詢 stocks 表取得名稱
        stocks_res = self.supabase.table("stocks") \
            .select("stock_code, stock_name") \
            .in_("stock_code", symbols) \
            .execute()
        name_map = {s["stock_code"]: s["stock_name"] for s in (stocks_res.data or [])}

        # 查詢 market_quotes 表取得今日漲跌幅
        quotes_res = self.supabase.table("market_quotes") \
            .select("stock_code, change_percent") \
            .in_("stock_code", symbols) \
            .execute()
        change_map = {q["stock_code"]: q.get("change_percent", 0) for q in (quotes_res.data or [])}

        # 組裝完整排行資料
        result = []
        for i, row in enumerate(res.data):
            sym = row["symbol"]
            result.append({
                "rank": i + 1,
                "symbol": sym,
                "name": name_map.get(sym, sym),
                "composite_score": float(row.get("composite_score", 0) or 0),
                "value_score": float(row.get("v_avg", 0) or 0),
                "growth_score": float(row.get("g_avg", 0) or 0),
                "quality_score": float(row.get("q_avg", 0) or 0),
                "momentum_score": float(row.get("m_avg", 0) or 0),
                "change_percent": float(change_map.get(sym, 0) or 0),
                "trade_date": row.get("trade_date"),
            })

        return result

    def _format_response(self, row: Dict) -> Dict[str, Any]:
        """將 DB Row 格式化為結構化前端響應"""
        # 18 因子細項
        factors_detail = []
        for key, label in FACTOR_LABELS.items():
            factors_detail.append({
                "key": key,
                "zh": label["zh"],
                "en": label["en"],
                "score": row.get(key, 0) or 0
            })

        # 四維度聚合
        dimensions = []
        for dim_key, dim_info in DIMENSIONS.items():
            dimensions.append({
                "key": dim_key,
                "zh": dim_info["zh"],
                "en": dim_info["en"],
                "score": float(row.get(dim_info["avg_key"], 0) or 0),
                "factors": [
                    {
                        "key": f_key,
                        "zh": FACTOR_LABELS[f_key]["zh"],
                        "en": FACTOR_LABELS[f_key]["en"],
                        "score": row.get(f_key, 0) or 0
                    }
                    for f_key in dim_info["factors"]
                ]
            })

        # 評級映射
        composite = float(row.get("composite_score", 0) or 0)
        grade = self._get_grade(composite)

        return {
            "symbol": row["symbol"],
            "trade_date": row["trade_date"],
            "composite_score": composite,
            "grade": grade,
            "macro_regime": row.get("macro_regime", "NEUTRAL"),
            "dimensions": dimensions,
            "factors": factors_detail,
            "updated_at": row.get("updated_at", row.get("created_at"))
        }

    @staticmethod
    def _get_grade(score: float) -> Dict[str, str]:
        """根據綜合評分給予等級與顏色"""
        if score >= 80:
            return {"label": "S", "color": "#F59E0B", "description": "極度看好"}
        elif score >= 65:
            return {"label": "A", "color": "#10B981", "description": "看好"}
        elif score >= 50:
            return {"label": "B", "color": "#3B82F6", "description": "中性偏多"}
        elif score >= 35:
            return {"label": "C", "color": "#8B5CF6", "description": "中性偏空"}
        else:
            return {"label": "D", "color": "#EF4444", "description": "看空"}
