from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.services.quota_service import QuotaService

router = APIRouter()
quota_service = QuotaService()

class ResetRequest(BaseModel):
    key_id: str

@router.get("/quota")
def get_quota_status():
    """
    獲取所有 API 金鑰的配額狀態。
    """
    try:
        keys = quota_service.get_all_keys()
        
        # 按提供者分組
        by_provider: Dict[str, List[Dict[str, Any]]] = {}
        for key in keys:
            provider = key["provider"]
            if provider not in by_provider:
                by_provider[provider] = []
            by_provider[provider].append(key)
        
        # 計算整體健康狀態
        total_keys = len(keys)
        healthy_keys = sum(1 for k in keys if k["health"] == "healthy")
        
        return {
            "keys": keys,
            "by_provider": by_provider,
            "summary": {
                "total": total_keys,
                "healthy": healthy_keys,
                "warning": sum(1 for k in keys if k["health"] == "warning"),
                "critical": sum(1 for k in keys if k["health"] == "critical"),
                "overall_health": "healthy" if healthy_keys == total_keys else "warning" if healthy_keys > 0 else "critical"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quota/reset")
def reset_cooldown(request: ResetRequest):
    """
    手動重置指定金鑰的冷卻狀態。
    """
    try:
        success = quota_service.reset_cooldown(request.key_id)
        if success:
            return {"status": "success", "message": "Cooldown reset successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to reset cooldown")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

