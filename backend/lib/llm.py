"""
Gemini LLM 客戶端 (Phase 13 升級版)
支援 5-Key 池輪詢機制，自動處理 429 限速錯誤。
"""
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
import logging
import time
import google.generativeai as genai
from backend.lib.config import Config

logger = logging.getLogger(__name__)


class GeminiKeyPool:
    """Gemini API Key 池管理器"""

    def __init__(self):
        # 動態偵測所有 GEMINI_API_KEY_N
        import os
        self.keys = []
        for i in range(1, 11):
            key = os.getenv(f"GEMINI_API_KEY_{i}")
            if key:
                self.keys.append(key)

        # Fallback 至單一 Key
        if not self.keys and Config.GEMINI_API_KEY:
            self.keys.append(Config.GEMINI_API_KEY)

        if not self.keys:
            raise ValueError("沒有可用的 GEMINI_API_KEY")

        self._current_index = 0
        logger.info(f"GeminiKeyPool 初始化完成：共 {len(self.keys)} 把 Key")

    def get_next_key(self) -> str:
        """輪詢取得下一把 Key"""
        key = self.keys[self._current_index % len(self.keys)]
        self._current_index += 1
        return key

    @property
    def size(self) -> int:
        return len(self.keys)


class GeminiClient:
    """
    Gemini LLM 客戶端 (支援 Key 池輪詢)
    - 遇到 429 自動切換下一把 Key 重試
    - 最多重試 key_pool.size 次
    """

    def __init__(self):
        self.key_pool = GeminiKeyPool()
        self.model_name = 'gemini-2.0-flash'
        # 用第一把 Key 初始化
        self._configure(self.key_pool.get_next_key())

    def _configure(self, api_key: str):
        """切換 API Key 並重建 Model"""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(self.model_name)

    def generate_content(self, prompt: str, max_retries: int = 0) -> str:
        """
        呼叫 Gemini 生成內容。
        遇到 429 自動輪詢下一把 Key，最多重試 key_pool.size 次。
        """
        if max_retries <= 0:
            max_retries = self.key_pool.size

        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    logger.warning(
                        f"Key #{self.key_pool._current_index % self.key_pool.size} "
                        f"觸發 429 限速，正在切換至下一把 Key (嘗試 {attempt + 1}/{max_retries})"
                    )
                    self._configure(self.key_pool.get_next_key())
                    time.sleep(1.0)  # 短暫等待避免連續觸發
                    continue
                else:
                    logger.error(f"Gemini API 錯誤: {e}")
                    return ""

        logger.error("所有 Gemini Key 均已耗盡額度")
        return ""


# Singleton 模式
_client = None

def get_llm() -> GeminiClient:
    """取得 LLM 客戶端單例"""
    global _client
    if _client is None:
        _client = GeminiClient()
    return _client
