from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from backend.services.insights_service import InsightsService
from pydantic import BaseModel

router = APIRouter()
insights_service = InsightsService()

class CorrelationResponse(BaseModel):
    pair: List[str]
    window: int
    lag: int
    series: List[Dict[str, Any]]
    summary: Dict[str, Any]
    cached: bool

@router.get("/correlation", response_model=CorrelationResponse)
async def get_correlation(
    base: str = Query(..., description="主資產 (如 STOCK:2330)"),
    target: str = Query(..., description="目標資產 (如 FX:USD/TWD)"),
    window: int = Query(30, ge=5, le=100),
    days: int = Query(365, ge=30, le=1000),
    lag: int = Query(0, ge=-20, le=20)
):
    """
    獲取跨資產領先/滯後相關性分析 (憲級加固版)。
    """
    try:
        result = await insights_service.get_correlation(base, target, window, days, lag)
        if "status" in result and result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dialectic/{ticker}")
async def get_dialectic(ticker: str):
    """
    獲取多代理人 AI 辯證共識。
    """
    return await insights_service.get_dialectic_consensus(ticker)
