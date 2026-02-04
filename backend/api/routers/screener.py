from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from backend.db.repositories.screener_repo import ScreenerRepository

router = APIRouter()
repo = ScreenerRepository()

class ScreenRequest(BaseModel):
    filters: Dict[str, Any] = Field(
        default={}, 
        description="過濾條件，如 {'price_range': [100, 500], 'ai_score_range': [80, 100]}"
    )
    sort_by: str = Field(default="ai_score", description="排序欄位")
    sort_order: str = Field(default="desc", description="排序順序 (asc/desc)")
    page: int = Field(default=1, ge=1, description="頁碼")
    page_size: int = Field(default=50, ge=1, le=100, description="每頁大小")

@router.post("/screen")
async def screen_stocks(request: ScreenRequest):
    """
    高性能多維度選股接口。
    整合 AI 預測、技術指標與即時行情。
    """
    try:
        results = await repo.screen_stocks(
            filters=request.filters,
            sort_by=request.sort_by,
            sort_order=request.sort_order,
            page=request.page,
            page_size=request.page_size
        )
        return {
            "status": "success",
            "count": len(results),
            "data": results,
            "page": request.page,
            "page_size": request.page_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/factors/{stock_code}")
async def get_stock_factors(stock_code: str):
    """
    獲取特定標的的最新因子得分。
    """
    try:
        # 這裡可以直接調用 repo 或 supabase
        from backend.lib.supabase_client import get_supabase
        supabase = get_supabase()
        response = supabase.table("stock_factors") \
            .select("*") \
            .eq("stock_code", stock_code) \
            .order("trade_date", desc=True) \
            .limit(1) \
            .execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="Factors not found")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
