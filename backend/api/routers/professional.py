from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from backend.services.risk_service import RiskService

router = APIRouter(prefix="/professional", tags=["professional"])
risk_service = RiskService()

@router.get("/risk-matrix")
async def get_risk_matrix(ticker: str = Query(..., description="股票代碼")):
    """
    獲取法人級風險矩陣 (Greeks, Barra, Stress Test)。
    """
    try:
        result = await risk_service.get_risk_matrix(ticker)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
