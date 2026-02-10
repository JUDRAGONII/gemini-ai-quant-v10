import sys
import os
import logging

# 設定路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.lib.supabase_client import get_supabase

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def test_tc_inf_01(supabase):
    """TC-INF-01: 檢查 exchange_rates 表筆數 > 5,000"""
    logger.info("執行 TC-INF-01: 驗證匯率數據筆數...")
    resp = supabase.table("exchange_rates").select("id", count="exact").limit(1).execute()
    count = resp.count
    logger.info(f"結果: exchange_rates 總筆數 = {count}")
    assert count > 5000, f"匯率數據不足: {count}"
    logger.info("TC-INF-01 通過! ✅")

def test_tc_inf_02(supabase):
    """TC-INF-02: 驗證 stocks 表覆蓋率 (應包含 2330, ^TWII, QQQ 等)"""
    logger.info("執行 TC-INF-02: 驗證標的主檔覆蓋率...")
    codes = ["2330", "^TWII", "QQQ", "TX"]
    resp = supabase.table("stocks").select("stock_code").in_("stock_code", codes).execute()
    found = [r["stock_code"] for r in resp.data]
    logger.info(f"找到的核心標的: {found}")
    for c in codes:
        assert c in found, f"缺失核心標的: {c}"
    logger.info("TC-INF-02 通過! ✅")

def test_tc_inf_03(supabase):
    """TC-INF-03: 驗證 1990 年代的數據取樣準確性"""
    logger.info("執行 TC-INF-03: 驗證 1990 年代歷史數據...")
    # 檢查 2330 或 ^TWII 是否有 1990s 數據
    resp = supabase.table("daily_price").select("trade_date").eq("stock_code", "2330").lt("trade_date", "2000-01-01").limit(5).execute()
    logger.info(f"2330 在 2000 年前的紀錄樣本: {resp.data}")
    # 注意: 2330 上市於 1994 年
    assert len(resp.data) > 0, "缺失 1990 年代數據"
    logger.info("TC-INF-03 通過! ✅")

def main():
    supabase = get_supabase()
    try:
        test_tc_inf_01(supabase)
        test_tc_inf_02(supabase)
        test_tc_inf_03(supabase)
        logger.info("所有 Phase 11.3 核心測試案例已通過! 🚀")
    except Exception as e:
        logger.error(f"測試失敗: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
