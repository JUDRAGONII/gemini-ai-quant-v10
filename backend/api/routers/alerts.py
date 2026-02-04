from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.lib.supabase_client import get_supabase

router = APIRouter()
supabase = get_supabase()

class AlertReadRequest(BaseModel):
    alert_ids: List[str]

@router.get("/")
async def get_alerts(
    limit: int = Query(50, ge=1, le=200),
    is_read: Optional[bool] = None,
    alert_type: Optional[str] = None
):
    """獲取警示列表"""
    try:
        query = supabase.table("market_alerts").select("*")
        
        if is_read is not None:
            query = query.eq("is_read", is_read)
        if alert_type:
            query = query.eq("alert_type", alert_type)
            
        response = query.order("triggered_at", desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/count")
async def get_unread_count():
    """獲取未讀警示數量"""
    try:
        # 使用 count=exact 獲取總數
        response = supabase.table("market_alerts") \
            .select("*", count="exact") \
            .eq("is_read", False) \
            .execute()
        return {"unread_count": response.count or 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{alert_id}/read")
async def mark_as_read(alert_id: str):
    """標記單一警示為已讀"""
    try:
        response = supabase.table("market_alerts") \
            .update({"is_read": True, "read_at": datetime.utcnow().isoformat()}) \
            .eq("id", alert_id) \
            .execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/read-all")
async def mark_all_as_read():
    """標記所有警示為已讀"""
    try:
        # 注意：此操作在大規模數據下可能較慢，後續可優化為特定時間段
        response = supabase.table("market_alerts") \
            .update({"is_read": True, "read_at": datetime.utcnow().isoformat()}) \
            .eq("is_read", False) \
            .execute()
        return {"status": "success", "count": len(response.data) if response.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
