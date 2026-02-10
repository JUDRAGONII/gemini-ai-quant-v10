from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from backend.lib.supabase_client import get_supabase
from datetime import datetime, timedelta

router = APIRouter()
supabase = get_supabase()

@router.get("/calendar")
async def get_economic_calendar(
    days: int = Query(7, description="Number of days to look ahead"),
    min_importance: int = Query(1, ge=1, le=5, description="Minimum importance level")
):
    """
    獲取經濟事件日曆。
    """
    try:
        today = datetime.now()
        end_date = today + timedelta(days=days)
        
        response = supabase.table("economic_calendar") \
            .select("*") \
            .gte("scheduled_at", today.isoformat()) \
            .lte("scheduled_at", end_date.isoformat()) \
            .gte("importance", min_importance) \
            .order("scheduled_at") \
            .execute()
            
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/indicators")
async def get_macro_indicators(
    codes: Optional[str] = Query(None, description="Comma separated indicator codes, e.g. GDP,CPI"),
    country: Optional[str] = Query(None, description="Filter by country, e.g. US, TW")
):
    """
    獲取宏觀經濟指標數據清單。
    """
    try:
        query = supabase.table("macro_indicators").select("indicator_code, indicator_name, country, category, reference_date, value")
        
        if codes:
            code_list = [c.strip() for c in codes.split(",")]
            query = query.in_("indicator_code", code_list)
            
        if country:
            query = query.eq("country", country)
            
        # 僅獲取最新一筆 (此處略微簡化，實際應用可能需要分組取最新)
        response = query.order("reference_date", desc=True).limit(50).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
