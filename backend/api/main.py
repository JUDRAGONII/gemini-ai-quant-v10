from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routers import (
    ai, backtest, market, screener, admin, 
    alerts, insights, tactical, macro, 
    analysis, evolution, professional, monitor
)

app = FastAPI(
    title="AI Quant V10 API",
    description="API for AI Quant System V10.0",
    version="1.0.0"
)

# 設置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊所有路由器
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["Backtest"])
app.include_router(market.router, prefix="/api/v1/market", tags=["Market"])
app.include_router(screener.router, prefix="/api/v1/screener", tags=["Screener"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(insights.router, prefix="/api/v1", tags=["Insights"])
app.include_router(tactical.router, prefix="/api/v1/tactical", tags=["Tactical"])
app.include_router(macro.router, prefix="/api/v1/macro", tags=["Macro"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(evolution.router, prefix="/api/v1/evolution", tags=["Evolution"])
app.include_router(professional.router, prefix="/api/v1", tags=["Professional"])
app.include_router(monitor.router, prefix="/api/v1/monitor", tags=["Monitor"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "ai-api", "version": "1.0.0"}
