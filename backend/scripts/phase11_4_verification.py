import sys
import os
import logging
import requests

# 設定路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

API_BASE = "http://localhost:8001/api/v1"

def test_tc_etl_1001_calendar_count():
    """TC-ETL-1001: 驗證經濟日曆數據筆數"""
    logger.info("執行 TC-ETL-1001: 驗證經濟日曆 API...")
    resp = requests.get(f"{API_BASE}/macro/calendar?days=14")
    assert resp.status_code == 200
    data = resp.json()
    count = data.get("count", 0)
    logger.info(f"結果: 回傳筆數 = {count}")
    assert count > 0, "經濟日曆為空"
    logger.info("TC-ETL-1001 通過! ✅")

def test_tc_api_1002_schema_alignment():
    """TC-API-1002: 驗證 JSON Schema 鍵名對齊"""
    logger.info("執行 TC-API-1002: 驗證欄位名稱...")
    resp = requests.get(f"{API_BASE}/macro/calendar?days=1")
    assert resp.status_code == 200
    events = resp.json().get("data", [])
    if events:
        event = events[0]
        # 應包含 scheduled_at 而非 event_date 或其他名稱
        assert "scheduled_at" in event, "缺失規格欄位: scheduled_at"
        assert "importance" in event, "缺失規格欄位: importance"
    logger.info("TC-API-1002 通過! ✅")

def test_tc_rpc_screener():
    """驗證修復後的 RPC 選股接口"""
    logger.info("執行 RPC 驗證: 選股接口測試...")
    payload = {"filters": {}, "page_size": 1}
    resp = requests.post(f"{API_BASE}/screener/screen", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    logger.info("RPC 選股接口驗證通過! ✅")

def main():
    try:
        test_tc_etl_1001_calendar_count()
        test_tc_api_1002_schema_alignment()
        test_tc_rpc_screener()
        logger.info("Phase 11.4 所有核心驗證點已通過! 🚀")
    except Exception as e:
        logger.error(f"驗證失敗: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
