import logging
from typing import Dict, Any, List, Optional
from backend.lib.supabase_client import get_supabase

logger = logging.getLogger(__name__)

class ScreenerRepository:
    """
    選股引擎存儲庫 (Screener Repository)
    提供基於 JSONB 的高性能多維度過濾功能。
    """
    
    def __init__(self, client=None):
        self.supabase = client or get_supabase()

    async def screen_stocks(self, 
                           filters: Dict[str, Any], 
                           sort_by: str = "ai_score", 
                           sort_order: str = "desc",
                           page: int = 1,
                           page_size: int = 50) -> List[Dict[str, Any]]:
        """
        執行選股過濾邏輯，調用 PostgreSQL RPC。
        """
        try:
            # 1. 準備 RPC 參數
            # filters 格式範例: {"price_range": [100, 500], "ai_score_range": [80, 100]}
            params = {
                "p_filters": filters,
                "p_sort_by": sort_by,
                "p_sort_order": sort_order,
                "p_offset": (page - 1) * page_size,
                "p_limit": page_size
            }
            
            logger.info(f"ScreenerRepository: Calling fn_screen_stocks with filters {filters}")
            
            # 2. 執行 RPC
            response = self.supabase.rpc("fn_screen_stocks", params).execute()
            
            return response.data
            
        except Exception as e:
            logger.error(f"ScreenerRepository Error during RPC: {e}")
            return []

    async def get_latest_factors(self, symbols: List[str]) -> List[Dict[str, Any]]:
        """
        獲取指定標的之最新因子數據。
        """
        # 實作略
        pass
