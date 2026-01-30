from backend.api.routers import ai, backtest

app = FastAPI(
    title="AI Investment Analyst API",
    description="API for AI Quant System V10.0",
    version="1.0.0"
)

app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["Backtest"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "ai-api"}
