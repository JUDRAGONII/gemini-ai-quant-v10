from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
import redis.asyncio as redis
import json
import os
import random # specific for mock
from datetime import datetime
from backend.lib.supabase_client import get_supabase
from backend.services.risk_service import RiskService

router = APIRouter(tags=["monitor"])
risk_service = RiskService()

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

async def get_redis():
    return await redis.from_url(REDIS_URL, decode_responses=True)

async def check_api_quota(redis_client) -> Dict[str, Any]:
    """Check API Quota status from Redis"""
    try:
        # Mocking quota check for now
        return {
            "fugle": 850,
            "tiingo": 4200,
            "gemini": 15000,
            "status": "Healthy"
        }
    except Exception:
        return {"status": "Unknown", "error": "Redis connection failed"}

def get_system_health() -> Dict[str, Any]:
    """Get System Resource Usage (Mocked for Container)"""
    try:
        # psutil is not available in the container, and we want to avoid rebuilds.
        # Mocking values for demonstration.
        boot_time = datetime.now().timestamp() - 36000 # Mock uptime
        
        return {
            "cpu_usage": round(random.uniform(10, 40), 1),
            "ram_usage": round(random.uniform(30, 60), 1),
            "ram_total_gb": 16.0, # Assumed
            "uptime_seconds": int(36000 + random.randint(0, 100))
        }
    except Exception:
        return {"cpu_usage": 0, "ram_usage": 0}

import time

@router.get("/dashboard", summary="AI Command Center Dashboard Aggregation")
async def get_dashboard_summary():
    """
    聚合 AI 監控中心所需的所有數據：
    1. System Health (CPU/RAM/DB)
    2. API Quota (Redis)
    3. Active Alerts (Supabase)
    4. Top Risk Tickers (RiskService)
    """
    redis_client = await get_redis()
    supabase = get_supabase()
    
    try:
        # 1. System Health
        sys_health = get_system_health()
        
        # 2. API Quota
        quota_status = await check_api_quota(redis_client)
        
        # 3. Active Alerts (Latest 10)
        alerts_res = supabase.table("market_alerts") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(10) \
            .execute()
        active_alerts = alerts_res.data if alerts_res.data else []
        
        # 4. Top Risk Tickers (Simulation)
        risk_summary = {
            "high_risk_count": 5, # Mock
            "tickers": ["2330", "2317", "2454"] # Mock
        }

        # 5. Evolution Trend (Latest 20)
        evo_res = supabase.table("evolution_history") \
            .select("generation, avg_fitness, max_fitness") \
            .order("generation", desc=True) \
            .limit(20) \
            .execute()
        # Reverse to show chronological order in chart
        evolution_trend = evo_res.data[::-1] if evo_res.data else []

        return {
            "timestamp": datetime.now().isoformat(),
            "system": sys_health,
            "quota": quota_status,
            "alerts": active_alerts,
            "risk": risk_summary,
            "evolution": evolution_trend
        }

    except Exception as e:
        print(f"Monitor Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await redis_client.close()
