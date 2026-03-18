from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from backend.lib.supabase_client import get_supabase
from collections import defaultdict

router = APIRouter()
supabase = get_supabase()

class HeatmapRequest(BaseModel):
    market_type: Optional[str] = "ALL"  # TWSE, TIINGO, ALL
    group_by: Optional[str] = "sector"  # sector, industry

class ExchangeRateResponse(BaseModel):
    base_currency: str
    target_currency: str
    rates: List[Dict[str, Any]]

class ExchangeRateLatestResponse(BaseModel):
    rates: Dict[str, float]
    last_updated: str

@router.get("/quotes")
async def get_market_quotes(
    symbols: Optional[str] = Query(None, description="Comma separated symbols, e.g. 2330,2317")
):
    """
    獲取最新行情快照。
    """
    try:
        query = supabase.table("market_quotes").select("*")
        
        if symbols:
            symbol_list = [s.strip() for s in symbols.split(",")]
            query = query.in_("stock_code", symbol_list)
            
        response = query.order("stock_code").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/snapshot/{stock_code}")
async def get_symbol_snapshot(stock_code: str):
    """
    獲取單一標的的詳細快照。
    """
    try:
        response = supabase.table("market_quotes") \
            .select("*") \
            .eq("stock_code", stock_code) \
            .single() \
            .execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="Quote not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import datetime

@router.get("/sparklines")
async def get_sparklines(
    symbols: str = Query(..., description="Comma separated symbols, e.g. 2330,NVDA")
):
    """
    獲取指定標的列表最近 7 個交易日的收盤價，供前端渲染 Sparkline 走勢圖使用。
    """
    try:
        symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
        if not symbol_list:
            return {}
            
        # 為避免休市，拉取過去 30 天的日 K，並擷取每檔最新的 7 筆
        thirty_days_ago = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        
        response = supabase.table("daily_price") \
            .select("stock_code, close_price, trade_date") \
            .in_("stock_code", symbol_list) \
            .gte("trade_date", thirty_days_ago) \
            .order("trade_date", desc=True) \
            .execute()
            
        sparklines = defaultdict(list)
        for row in response.data:
            code = row["stock_code"]
            if len(sparklines[code]) < 7:
                sparklines[code].append({"value": row["close_price"], "date": row["trade_date"]})
                
        # 反轉陣列使時間從舊到新 (左到右)
        for code in sparklines:
            sparklines[code].reverse()
            
        return sparklines
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/exchange_rates")
async def get_exchange_rates(
    base: Optional[str] = "USD",
    target: Optional[str] = "TWD",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    獲取歷史匯率數據。
    """
    try:
        query = supabase.table("exchange_rates") \
            .select("trade_date, rate, change, change_percent") \
            .eq("base_currency", base) \
            .eq("target_currency", target)
            
        if start_date:
            query = query.gte("trade_date", start_date)
        if end_date:
            query = query.lte("trade_date", end_date)
            
        response = query.order("trade_date", desc=True).limit(100).execute()
        
        return {
            "base_currency": base,
            "target_currency": target,
            "rates": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/exchange_rates/latest")
async def get_latest_exchange_rates(
    pairs: Optional[str] = Query(None, description="Comma separated pairs, e.g. USDTWD,USDCNY")
):
    """
    獲取最新匯率。
    """
    try:
        # 獲取每個交易對最新的一筆資料
        # 注意：這裡使用簡易邏輯，實際生產環境可用 RPC 優化
        query = supabase.table("exchange_rates").select("*")
        
        if pairs:
            # 輔助：如果傳入的是 USDTWD 格式，需在 Repo 層處理或這裡簡單處理
            # 目前 DB 已將其拆分為 base/target
            pair_list = pairs.split(",")
            # 這裡採簡單策略：獲取最近 20 筆並在 Python 過濾，或精準查詢
            # 為求效能，我們先查出所有 base_currency 為 USD 的最新
            response = supabase.rpc("get_latest_exchange_rates").execute()
            if response.data:
                return {
                    "rates": {f"{r['base_currency']}{r['target_currency']}": r['rate'] for r in response.data},
                    "last_updated": response.data[0]['trade_date'] if response.data else None
                }
        
        # Fallback: 傳回常見對
        response = supabase.table("exchange_rates") \
            .select("base_currency, target_currency, rate, trade_date") \
            .order("trade_date", desc=True) \
            .limit(10) \
            .execute()
            
        rates = {}
        last_date = None
        for r in response.data:
            key = f"{r['base_currency']}{r['target_currency']}"
            if key not in rates:
                rates[key] = r['rate']
                last_date = r['trade_date']
                
        return {
            "rates": rates,
            "last_updated": last_date
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/heatmap")
async def get_market_heatmap(request: HeatmapRequest):
    """
    獲取市場熱力圖資料 (階層結構)。
    聚合 stocks + market_quotes，按 sector/industry 分組。
    """
    try:
        # 1. 獲取所有活躍股票與其報價
        stocks_resp = supabase.table("stocks") \
            .select("stock_code, stock_name, sector, industry, market_type") \
            .eq("is_active", True) \
            .execute()
        
        quotes_resp = supabase.table("market_quotes") \
            .select("stock_code, name, price, change_percent, volume") \
            .execute()
        
        # 2. 建立報價查詢表
        quotes_map = {q["stock_code"]: q for q in quotes_resp.data}
        
        # 3. 過濾市場類型
        stocks = stocks_resp.data
        if request.market_type and request.market_type != "ALL":
            stocks = [s for s in stocks if s.get("market_type") == request.market_type]
        
        # 4. 依 sector/industry 分組
        group_key = request.group_by or "sector"
        grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        
        for stock in stocks:
            stock_code = stock["stock_code"]
            quote = quotes_map.get(stock_code)
            if not quote:
                continue  # 無報價則跳過
            
            group_name = stock.get(group_key) or "其他"
            grouped[group_name].append({
                "name": stock.get("stock_name") or quote.get("name") or stock_code,
                "stock_code": stock_code,
                "value": quote.get("volume") or 1,  # 成交量作為面積權重
                "change_percent": quote.get("change_percent") or 0,
                "price": quote.get("price") or 0
            })
        
        # 5. 構建階層結構
        children = []
        for group_name, items in grouped.items():
            children.append({
                "name": group_name,
                "children": sorted(items, key=lambda x: x["value"], reverse=True)
            })
        
        # 按子項總成交量排序
        children.sort(key=lambda x: sum(c["value"] for c in x["children"]), reverse=True)
        
        return {
            "name": "市場",
            "children": children,
            "total_stocks": sum(len(c["children"]) for c in children)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

