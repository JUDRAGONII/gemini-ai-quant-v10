from fastapi import APIRouter, HTTPException
from backend.models.predictor import Predictor
from typing import Dict, Any

router = APIRouter()

# Global predictor instance
# In production, might want better lifecycle management
_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        _predictor = Predictor()
    return _predictor

@router.get("/predict/{stock_code}", response_model=Dict[str, Any])
async def predict_stock(stock_code: str):
    """
    獲取個股 AI 預測分析 (5-Day Alpha)
    """
    predictor = get_predictor()
    if not predictor.model_ready:
        # Try reloading (maybe model was just trained)
        predictor.__init__()
        if not predictor.model_ready:
             raise HTTPException(status_code=503, detail="AI Model not ready (training required)")
             
    result = predictor.predict(stock_code)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return result

@router.get("/predict/top-ranking")
async def get_top_ranking():
    """
    (Placeholder) 獲取全市場預測排名
    """
    return {"message": "Not implemented yet"}
