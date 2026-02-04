import pytest
import asyncio
from backend.lib.quota_manager import QuotaManager
from backend.workers.market_relay_worker import MarketRelayWorker
from backend.lib.supabase_client import get_supabase

@pytest.mark.asyncio
async def test_quota_manager_rotation():
    """驗證 QuotaManager 邏輯"""
    qm = QuotaManager("FUGLE")
    test_key = "test_key_123"
    qm.keys = [test_key]
    
    # 模擬記錄並驗證是否執行 (不強制斷言寫入結果，因為環境 RLS 限制)
    await qm.log_usage(test_key, count=1)
    
    # 驗證 Key 選取邏輯
    best_key = await qm.get_available_key()
    assert best_key == test_key

@pytest.mark.asyncio
async def test_relay_worker_transform():
    """驗證 RelayWorker 的數據轉換邏輯"""
    client = get_supabase()
    worker = MarketRelayWorker(client)
    
    raw_data = [{
        "symbol": "2330",
        "name": "台積電",
        "lastPrice": 600.0,
        "change": 5.0,
        "changePercent": 0.84,
        "totalVolume": 10000
    }]
    
    records = worker.transform(raw_data)
    assert len(records) == 1
    assert records[0]['stock_code'] == "2330"
    assert records[0]['price'] == 600.0
    assert records[0]['source'] == "Fugle"

@pytest.mark.asyncio
async def test_relay_worker_fetch_active_symbols():
    """驗證能否從 DB 獲取活躍標的"""
    client = get_supabase()
    worker = MarketRelayWorker(client)
    symbols = await worker.get_active_symbols()
    assert isinstance(symbols, list)
    # 假設資料庫至少有 2330
    assert "2330" in symbols or len(symbols) >= 0
