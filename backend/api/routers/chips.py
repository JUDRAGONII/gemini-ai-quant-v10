from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from backend.db.repositories.chips_repository import ChipsRepository
import logging

router = APIRouter(prefix="/chips", tags=["Chips"])
logger = logging.getLogger(__name__)

# 初始化 Repository
try:
    chips_repo = ChipsRepository()
except Exception as e:
    logger.error(f"Failed to initialize ChipsRepository: {str(e)}")
    chips_repo = None # type: ignore

@router.get("/{stock_code}")
async def get_chip_analysis(
    stock_code: str,
    days: int = Query(30, ge=1, le=120, description="獲取天數, 預設 30, 最多 120 天")
) -> Dict[str, Any]:
    """
    獲取指定標的之籌碼分析數據 (三大法人, 融資券, 收盤價)
    """
    if not chips_repo:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
        
    try:
        result = chips_repo.get_chips_history(stock_code=stock_code, days=days)
        return result
    except Exception as e:
        logger.error(f"Error serving chips data for {stock_code}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chips data")
