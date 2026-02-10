import pytest
import pandas as pd
import numpy as np
from unittest.mock import AsyncMock, MagicMock, patch
from backend.services.insights_service import InsightsService

@pytest.fixture
def insights_service():
    with patch('backend.services.insights_service.get_supabase') as mock_supabase:
        service = InsightsService()
        yield service

@pytest.mark.asyncio
async def test_insights_service_correlation_logic(insights_service):
    # TC-1201: 驗證相關係數計算正確性
    
    # Mock data return
    mock_data_a = [
        {"trade_date": "2023-01-01", "close_price": 100},
        {"trade_date": "2023-01-02", "close_price": 105},
        {"trade_date": "2023-01-03", "close_price": 110},
    ]
    mock_data_b = [
        {"reference_date": "2023-01-01", "value": 10},
        {"reference_date": "2023-01-02", "value": 11},
        {"reference_date": "2023-01-03", "value": 12},
    ]

    # Mock _fetch_asset_data
    insights_service._fetch_asset_data = AsyncMock()
    insights_service._fetch_asset_data.side_effect = [
        [{"date": "2023-01-01", "value": 100}, {"date": "2023-01-02", "value": 105}, {"date": "2023-01-03", "value": 110}],
        [{"date": "2023-01-01", "value": 10}, {"date": "2023-01-02", "value": 11}, {"date": "2023-01-03", "value": 12}]
    ]

    # Perform analysis with window=2 (to get some results)
    result = await insights_service.get_correlation("STOCK:A", "MACRO:B", window=2)

    assert result["pair"] == ["STOCK:A", "MACRO:B"]
    assert "series" in result
    assert result["summary"]["current"] == 1.0  # (100,105,110) 與 (10,11,12) 為完美正相關
    assert result["summary"]["status"] == "Strong Positive"

@pytest.mark.asyncio
async def test_insights_service_edge_cases(insights_service):
    # TC-2101: 驗證數據不齊時的 Outer Join 與 FFill
    
    # 資產 A 有 1, 2, 3 日數據
    # 資產 B 只有 1, 3 日數據 (缺失 2 日)
    insights_service._fetch_asset_data = AsyncMock()
    insights_service._fetch_asset_data.side_effect = [
        [{"date": "2023-01-01", "value": 100}, {"date": "2023-01-02", "value": 105}, {"date": "2023-01-03", "value": 110}],
        [{"date": "2023-01-01", "value": 10}, {"date": "2023-01-03", "value": 12}]
    ]

    result = await insights_service.get_correlation("STOCK:A", "MACRO:B", window=2)
    
    # 應成功計算 (因為 B 在 2 日會 FFill 1 日 of 10)
    assert "series" in result
    assert result.get("status") != "error"

def test_get_corr_status(insights_service):
    assert insights_service._get_corr_status(0.8) == "Strong Positive"
    assert insights_service._get_corr_status(0.5) == "Positive"
    assert insights_service._get_corr_status(-0.4) == "Negative"
    assert insights_service._get_corr_status(-0.9) == "Strong Negative"
    assert insights_service._get_corr_status(0.1) == "Neutral"
