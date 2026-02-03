import pytest
import asyncio
from unittest.mock import MagicMock, AsyncMock
from backend.services.alert_service import AlertService
from backend.services.quota_service import QuotaService
from backend.db.repositories.screener_repo import ScreenerRepository
from backend.workers.market_relay_worker import MarketRelayWorker

# Mock Supabase
@pytest.fixture
def mock_supabase():
    client = MagicMock()
    # 預設回傳空的 data
    response = MagicMock()
    response.data = []
    # 支援鏈式調動 .table().select().execute() 或 .table().insert().execute()
    client.table.return_value.select.return_value.execute.return_value = response
    client.table.return_value.insert.return_value.execute.return_value = response
    client.table.return_value.update.return_value.eq.return_value.execute.return_value = response
    
    # RPC 模擬
    rpc_response = MagicMock()
    rpc_response.data = []
    client.rpc.return_value.execute.return_value = rpc_response
    
    return client

# Mock Redis
@pytest.fixture
def mock_redis():
    redis = MagicMock()
    redis.sismember.return_value = False
    redis.get.return_value = None
    redis.hget.return_value = None
    redis.hincrby.return_value = 1
    return redis

@pytest.mark.asyncio
async def test_tc_1101_screener_basic_filter(mock_supabase):
    """TC-1101: 驗證多維條件選股基礎過濾邏輯 (Async)"""
    repo = ScreenerRepository()
    repo.supabase = mock_supabase
    
    # 模擬資料庫回傳選股結果
    mock_data = [{"stock_code": "2330", "ai_score": 95, "price": 600}]
    mock_supabase.rpc.return_value.execute.return_value.data = mock_data
    
    filters = {"price_range": [100, 700], "ai_score_range": [80, 100]}
    results = await repo.screen_stocks(filters=filters)
    
    assert len(results) == 1
    assert results[0]["stock_code"] == "2330"
    mock_supabase.rpc.assert_called_once()

@pytest.mark.asyncio
async def test_tc_2101_screener_empty_results(mock_supabase):
    """TC-2101: 驗證極端過濾條件 (空結果)"""
    repo = ScreenerRepository()
    repo.supabase = mock_supabase
    
    mock_supabase.rpc.return_value.execute.return_value.data = []
    
    filters = {"price_range": [0, 0]}
    results = await repo.screen_stocks(filters=filters)
    assert len(results) == 0

def test_tc_1201_relay_transform():
    """TC-1201: 驗證行情數據轉換對齊邏輯 (Sync)"""
    worker = MarketRelayWorker(None)
    raw_data = [{
        "symbol": "2330",
        "lastPrice": 612.0,
        "changePercent": 1.2,
        "totalVolume": 50000,
        "name": "台績電"
    }]
    
    records = worker.transform(raw_data)
    assert len(records) == 1
    assert records[0]["stock_code"] == "2330"
    assert records[0]["price"] == 612.0

def test_tc_1401_quota_usage_increment(mock_redis, mock_supabase):
    """TC-1401: 驗證 Redis 配額計量遞增 (Sync)"""
    # 修正：QuotaService 使用 increment_usage
    service = QuotaService(supabase_client=mock_supabase, redis_client=mock_redis)
    
    # 模擬 Postgres 有金鑰資料
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = [
        {"id": "key_123", "daily_limit": 1000}
    ]
    
    success = service.increment_usage("FUGLE")
    
    assert success is True
    mock_redis.hincrby.assert_called()

def test_tc_1501_alert_generation(mock_redis, mock_supabase):
    """TC-1501: 驗證警示生成邏輯 (Sync)"""
    service = AlertService(supabase=mock_supabase, redis=mock_redis)
    
    quotes = [{
        "stock_code": "2330",
        "price": 600,
        "change_percent": 6.5,
    }]
    
    count = service.scan_and_alert(quotes)
    
    assert count >= 1
    mock_supabase.table.return_value.insert.assert_called()

def test_tc_2501_alert_deduplication(mock_redis):
    """TC-2501: 驗證 5 分鐘去重機制 (Sync)"""
    service = AlertService(redis=mock_redis)
    
    # 模擬 Redis 記錄該標的已在防抖窗口內
    mock_redis.sismember.return_value = True
    
    quotes = [{"stock_code": "2330", "change_percent": 8.0}]
    count = service.scan_and_alert(quotes)
    
    # 因為已被去重，不應產生新警示
    assert count == 0
