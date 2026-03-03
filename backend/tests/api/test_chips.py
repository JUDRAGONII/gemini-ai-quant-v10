import pytest
from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)

def test_chips_api_basic():
    """測試籌碼 API 基本邏輯與回傳格式"""
    # 測試台積電
    response = client.get("/api/v1/chips/2330?days=5")
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert data["ticker"] == "2330"
    
    # 資料可能是空的(如果 DB 本機沒資料)，但不應拋出 500
    assert "data" in data
    
    if len(data["data"]) > 0:
        daily_record = data["data"][0]
        # 驗證必備欄位存在
        expected_keys = [
            "date", "price", "foreign", "trust", "dealer", 
            "total_institutional", "margin_balance", "margin_change",
            "short_balance", "short_change", "short_ratio"
        ]
        for key in expected_keys:
            assert key in daily_record

def test_chips_api_invalid_days():
    """測試超出範圍的天數"""
    response = client.get("/api/v1/chips/2330?days=200")
    assert response.status_code == 422 # FastAPI validation error
