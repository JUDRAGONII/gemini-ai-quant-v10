from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from backend.lib.supabase_client import get_supabase
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

router = APIRouter()
supabase = get_supabase()

class TacticalPlanCreate(BaseModel):
    stock_code: str
    stock_name: Optional[str]
    entry_price: float
    stop_loss: float
    take_profit: float
    reason: Optional[str]

@router.post("/plans")
async def create_plan(plan: TacticalPlanCreate):
    """
    建立新的戰術計畫。
    """
    res = supabase.table("tactical_plans").insert(plan.dict()).execute()
    return res.data

@router.get("/plans")
async def get_plans(status: str = "open"):
    """
    獲取戰術計畫列表。
    """
    res = supabase.table("tactical_plans").select("*").eq("status", status).order("created_at", desc=True).execute()
    return res.data

@router.post("/logs")
async def create_log(log_data: Dict[str, Any]):
    """
    建立覆盤日誌。
    """
    res = supabase.table("tactical_logs").insert(log_data).execute()
    # 同步更新計畫狀態為 closed
    if "plan_id" in log_data:
        supabase.table("tactical_plans").update({"status": "closed"}).eq("id", log_data["plan_id"]).execute()
    return res.data
