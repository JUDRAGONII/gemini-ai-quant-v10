"""
Phase 13.1: 18 因子評分 API 路由 (Analysis Router)
遵循 SDD 規格驅動開發：
- GET /api/v1/analysis/18factor-scores?symbol=XXX
- GET /api/v1/analysis/18factor-scores/batch?symbols=A,B,C
- GET /api/v1/analysis/top-scores?limit=20&dimension=composite
- POST /api/v1/analysis/trigger-calculation
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from backend.services.analysis_service import AnalysisService

router = APIRouter()
analysis_service = AnalysisService()


# === Pydantic Models (SDD 規格) ===

class FactorDetail(BaseModel):
    """單一因子評分"""
    key: str
    zh: str
    en: str
    score: int


class DimensionScore(BaseModel):
    """四大維度聚合評分"""
    key: str
    zh: str
    en: str
    score: float
    factors: List[FactorDetail]


class GradeInfo(BaseModel):
    """評級資訊"""
    label: str        # S/A/B/C/D
    color: str        # HEX 色碼
    description: str  # 中文描述


class VQGMScoreResponse(BaseModel):
    """VQGM 18 因子評分完整響應"""
    symbol: str
    trade_date: str
    composite_score: float
    grade: GradeInfo
    macro_regime: str
    dimensions: List[DimensionScore]
    factors: List[FactorDetail]
    cached: bool = False


# === API 端點 ===

@router.get("/18factor-scores", summary="查詢 18 因子評分")
async def get_18factor_scores(
    symbol: str = Query(..., description="股票代碼 (如 2330, AAPL)")
):
    """
    查詢單一標的的 VQGM 18 因子 Percentile 評分。
    返回四大維度 (Value/Quality/Growth/Momentum) 聚合分數與 18 項細分因子。
    """
    try:
        result = await analysis_service.get_18factor_scores(symbol)
        if result.get("status") == "no_data":
            raise HTTPException(status_code=404, detail=result["message"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查詢失敗: {str(e)}")


@router.get("/18factor-scores/batch", summary="批次查詢 18 因子評分")
async def get_batch_scores(
    symbols: str = Query(..., description="逗號分隔的股票代碼 (如 2330,AAPL,0050)")
):
    """
    批次查詢多標的 18 因子評分 (上限 20 筆)。
    """
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
    if not symbol_list:
        raise HTTPException(status_code=400, detail="請提供至少一個股票代碼")

    results = await analysis_service.get_batch_scores(symbol_list)
    return {"count": len(results), "data": results}


@router.get("/top-scores", summary="VQGM 評分排行榜")
async def get_top_scores(
    limit: int = Query(20, ge=1, le=100, description="排行筆數"),
    dimension: str = Query("composite", description="排序維度: composite/value/growth/quality/momentum")
):
    """
    取得 VQGM 綜合評分或特定維度的 Top N 排行榜。
    """
    results = await analysis_service.get_top_scores(limit, dimension)
    return {"count": len(results), "dimension": dimension, "data": results}


@router.post("/trigger-calculation", summary="觸發 VQGM 計算")
async def trigger_calculation(
    target_date: Optional[str] = Query(None, description="目標日期 (YYYY-MM-DD)，預設今天")
):
    """
    手動觸發 VQGM 18 因子計算 (呼叫 DB 端 fn_calculate_vqgm)。
    會更新 stock_scores_18 表中的所有標的評分。
    """
    result = await analysis_service.trigger_calculation(target_date)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return result
