from fastapi import FastAPI
from backend.api.routers import ai, backtest, market, screener, admin, alerts

app = FastAPI(
    title="AI Investment Analyst API",
    description="API for AI Quant System V10.0",
    version="1.0.0"
)

app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["Backtest"])
app.include_router(market.router, prefix="/api/v1/market", tags=["Market"])
app.include_router(screener.router, prefix="/api/v1/screener", tags=["Screener"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "ai-api"}

