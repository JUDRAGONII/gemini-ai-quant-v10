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

