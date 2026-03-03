from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.lib.supabase_client import get_supabase
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()
supabase = get_supabase()

class EvolutionHistoryResponse(BaseModel):
    generation: int
    best_genome: List[float]
    avg_fitness: float
    max_fitness: float
    created_at: datetime

@router.get("/history", response_model=List[EvolutionHistoryResponse])
async def get_evolution_history():
    """獲取演化歷史數據紀錄"""
    try:
        response = supabase.table("evolution_history").select("*").order("generation").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/best", response_model=EvolutionHistoryResponse)
async def get_best_individual():
    """獲取當前最強個體"""
    try:
        response = supabase.table("evolution_history").select("*").order("generation", desc=True).limit(1).execute()
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="No evolution history found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
