from abc import ABC, abstractmethod
import logging
from typing import List, Dict, Any, Optional
from supabase import Client
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import pandas as pd

# 設定 Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BaseFetcher(ABC):
    """
    數據擷取器基底類別 (ETL Abstract Base Class)
    提供統一的 Upsert 邏輯與重試機制。
    """

    def __init__(self, client: Client, table_name: str, provider: Optional[str] = None):
        self.client = client
        self.table_name = table_name
        self.provider = provider
        # 延遲匯入以避免循環依賴
        from backend.services.quota_service import QuotaService
        self.quota_service = QuotaService()

    @abstractmethod
    async def fetch(self, **kwargs) -> Any:
        """從外部 API 獲取原始數據 (需由子類別實作)"""
        pass


    @abstractmethod
    def transform(self, raw_data: Any) -> List[Dict[str, Any]]:
        """將原始數據轉換為符合資料庫 Schema 的格式 (需由子類別實作)"""
        pass

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    def upsert(self, records: List[Dict[str, Any]], on_conflict: Optional[str] = None) -> int:
        """
        將格式化後的紀錄批次寫入 Supabase。
        使用 upsert 確保資料不重複。
        """
        if not records:
            logger.info(f"[{self.table_name}] No records to upsert.")
            return 0
            
        # 🆕 本地去重：防止資料庫報 21000 錯誤 (ON CONFLICT DO UPDATE command cannot affect row a second time)
        if on_conflict:
            try:
                df = pd.DataFrame(records)
                subset = on_conflict.split(',')
                # 只保留該批次中最後一筆重複紀錄
                df_clean = df.drop_duplicates(subset=subset, keep='last')
                # 🛡️ NaN Sanitization: Pandas 會將 None 轉為 NaN，需轉回 None 以符合 JSON 規範
                df_clean = df_clean.where(pd.notnull(df_clean), None)
                records = df_clean.to_dict('records')
                if len(df) != len(df_clean):
                    logger.warning(f"[{self.table_name}] Local deduplication removed {len(df) - len(df_clean)} duplicates.")
            except Exception as e:
                logger.warning(f"[{self.table_name}] Local deduplication skipped due to error: {e}")

        try:
            # Supabase Python SDK v2 使用 .from_().upsert()
            query = self.client.table(self.table_name).upsert(records, on_conflict=on_conflict)
            response = query.execute()
            count = len(response.data) if response.data else 0
            logger.info(f"[{self.table_name}] Successfully upserted {count} records.")
            return count
        except Exception as e:
            logger.error(f"[{self.table_name}] Upsert failed: {str(e)}")
            raise

    def run(self, on_conflict: Optional[str] = None, **kwargs) -> int:
        """執行完整 ETL 流程"""
        try:
            logger.info(f"Starting ETL for {self.table_name}...")
            
            # 1. 配額檢查與遞增
            if self.provider:
                self.quota_service.increment_usage(self.provider)
                
            # 2. 數據擷取與轉換
            # 注意: 子類別的 fetch 可能是 async，但這裡暫以 sync 呼叫
            # 若子類別 fetch 為 async，則需在此處理 (如使用 asyncio.run)
            import asyncio
            import inspect
            
            if inspect.iscoroutinefunction(self.fetch):
                raw = asyncio.run(self.fetch(**kwargs))
            else:
                raw = self.fetch(**kwargs)
                
            records = self.transform(raw)
            
            # 3. 數據寫入
            count = self.upsert(records, on_conflict=on_conflict)
            logger.info(f"ETL completed for {self.table_name}. Total: {count}")
            return count
        except Exception as e:
            # 錯誤記錄
            if self.provider:
                self.quota_service.record_error(self.provider, str(e))
            logger.error(f"ETL failed for {self.table_name}: {str(e)}")
            return 0

