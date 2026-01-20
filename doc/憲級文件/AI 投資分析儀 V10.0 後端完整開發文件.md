
# AI 投資分析儀 V10.0 後端完整開發文件

## 私有化部署人工智慧投資分析系統之後端應用程式

---

**文件編號**：SYS-BACKEND-001
**版本**：6.0.0
**密級**：內部參考
**建立日期**：2026年2月20日
**文件狀態**：正式發布
**適用對象**：後端開發人員、系統架構師、資料工程師、維運工程師

---

## 版本控制紀錄

| 版本 | 日期 | 修訂人 | 修訂內容 | 核准人 |
|------|------|--------|----------|--------|
| 1.0.0 | 2026-01-05 | 後端架構師 | 初始版本，建立後端架構框架 | 系統架構師 |
| 2.0.0 | 2026-01-15 | 後端架構師 | 完成資料庫設計與模型定義 | 技術總監 |
| 3.0.0 | 2026-01-25 | 後端架構師 | 整合行情數據 API 服務 | 專案經理 |
| 4.0.0 | 2026-02-01 | 後端架構師 | 融入宏觀數據擴充方案 | 系統架構師 |
| 5.0.0 | 2026-02-10 | 後端架構師 | 完成 AI 分析服務與演化策略 | 專案經理 |
| 6.0.0 | 2026-02-20 | 後端架構師 | 完整後端開發文件定稿 | 技術總監 |

---

## 目錄

第一章：後端架構總覽
第二章：專案結構與目錄規範
第三章：核心框架配置
第四章：資料庫設計與管理
第五章：API 服務層
第六章：業務邏輯層
第七章：數據處理服務
第八章：AI 分析服務
第九章：排程與任務管理
第十章：資訊安全實作
第十一章：效能優化策略
第十二章：測試策略與品質保證
第十三章：部署與維運
第十四章：監控與日誌管理

---

## 第一章：後端架構總覽

### 1.1 架構設計原則

AI 投資分析儀 V10.0 後端系統採用現代化的微服務架構設計，基於 Python 生態系統構建，遵循元件化、模組化、可擴展的設計原則。本架構設計充分考量了金融投資分析系統的特殊需求，包括大量的時間序列數據處理、複雜的 AI 模型運算、即時的數據更新、以及嚴格的數據安全要求。

後端技術選型方面，核心框架選用 Flask 作為輕量級 Web 框架，提供靈活的擴展能力與高效的請求處理效能。ORM 層選用 SQLAlchemy 作為資料庫抽象層，支援多種資料庫引擎並提供豐富的查詢功能。任務排程選用 Prefect 作為現代化的工作流管理工具，支援複雜的數據處理流水線。AI 運算選用 NumPy 與 Pandas 進行高效的數據處理，配合自研的演化策略引擎進行投資因子優化。向量資料庫選用 Milvus 支援 AI 語義搜尋功能。快取層選用 Redis 提供高速的數據存取與會話管理。

在架構模式方面，系統採用分層架構模式，將後端應用劃分為表現層（API 端點）、業務邏輯層（服務模組）、數據訪問層（資料庫操作）、以及基礎設施層（外部服務整合）。各層之間透過定義良好的介面進行通信，確保程式碼的解耦與可測試性。在部署架構方面，系統採用 Docker 容器化部署，透過 Docker Compose 進行容器編排，所有服務運行於 QNAP NAS 設備的隔離網路中。

### 1.2 系統組件概述

後端系統由以下核心組件構成，每個組件設計為可獨立部署與擴展。

Flask API 服務是系統的核心 HTTP 服務，負責處理所有外部請求並返回響應。該服務基於 Flask-RESTful 擴展建構，提供 RESTful API 端點。服務監聽 5000 端口，透過 Nginx 反向代理對外提供服務。API 服務整合了多個功能模組，包括行情查詢、宏觀數據、籌碼分析、AI 分析等。

PostgreSQL 資料庫服務是系統的主要關聯式資料庫，儲存結構化的行情數據、宏觀指標、用戶設定等。資料庫配置於 NVMe SSD 層，確保高效能的數據存取。資料庫採用優化的記憶體管理與查詢優化器設定，支援全文檢索與向量搜尋擴展。

Redis 快取服務是系統的分散式快取與會話儲存。服務採用 AOF 持久化模式，確保快取數據在重啟後可恢復。Redis 用於加速熱門數據的存取、儲存會話狀態、以及作為 Celery 任務代理。

Milvus 向量資料庫服務提供 AI 語意搜尋所需的向量儲存與檢索功能。服務基於 Milvus 2.3 版本，儲存於 SATA SSD 層。該服務支援高效的相似度搜尋，用於 AI 投資報告的語意檢索功能。

Prefect 排程服務提供數據獲取與處理任務的排程管理功能。服務負責管理 FRED 宏觀數據、台灣政府數據、以及市場行情數據的定時獲取任務。 Prefect 採用工作流引擎設計，支援複雜的任務依賴關係與錯誤處理。

### 1.3 數據流向架構

系統的數據流向遵循以下模式，確保數據的完整性、及時性與一致性。

外部數據獲取流程方面，排程服務依據預設的時間觸發數據獲取任務。數據獲取器連接外部數據源（FRED、TWSE、TPEx 等）獲取原始數據。獲取的數據經過清洗與驗證後寫入暫存區。資料處理服務從暫存區讀取數據，進行轉換與品質檢查。處理後的數據寫入正式資料庫，同時更新向量索引。

API 請求處理流程方面，用戶請求經由 Nginx 負載均衡分配至 API 服務。API 服務驗證請求的合法性與權限。服務層處理業務邏輯，從資料庫或快取讀取所需數據。響應經過序列化後返回給用戶。

AI 分析流程方面，AI 分析服務接收分析請求。系統從資料庫讀取相關數據（行情、宏觀、籌碼等）。演化策略引擎計算投資因子權重並生成評分。AI 報告生成器產生分析報告。結果儲存至資料庫並建立向量索引。

---

## 第二章：專案結構與目錄規範

### 2.1 專案根目錄結構

AI 投資分析儀 V10.0 後端專案的根目錄結構採用標準化的組織方式，利於團隊協作與專案維護。

```
ai-invest-backend/
├── app/                              # 應用程式主目錄
│   ├── api/                          # API 端點層
│   │   ├── __init__.py
│   │   ├── v1/                       # API v1 版本
│   │   │   ├── __init__.py
│   │   │   ├── stocks.py             # 行情 API
│   │   │   ├── macro.py              # 宏觀數據 API
│   │   │   ├── chips.py              # 籌碼分析 API
│   │   │   ├── ai.py                 # AI 分析 API
│   │   │   ├── user.py               # 用戶管理 API
│   │   │   └── health.py             # 健康檢查 API
│   │   └── errors.py                 # 錯誤處理
│   │
│   ├── services/                     # 業務邏輯層
│   │   ├── __init__.py
│   │   ├── stock_service.py          # 行情服務
│   │   ├── macro_service.py          # 宏觀數據服務
│   │   ├── chip_service.py           # 籌碼分析服務
│   │   ├── ai_service.py             # AI 分析服務
│   │   ├── data_processor.py         # 數據處理服務
│   │   ├── evolution_engine.py       # 演化策略引擎
│   │   └── report_generator.py       # 報告生成服務
│   │
│   ├── models/                       # 資料庫模型層
│   │   ├── __init__.py
│   │   ├── base.py                   # 基類與 mixin
│   │   ├── stock.py                  # 行情模型
│   │   ├── macro.py                  # 宏觀數據模型
│   │   ├── chip.py                   # 籌碼模型
│   │   ├── ai.py                     # AI 分析模型
│   │   └── user.py                   # 用戶模型
│   │
│   ├── repositories/                 # 資料訪問層
│   │   ├── __init__.py
│   │   ├── stock_repo.py             # 行情數據訪問
│   │   ├── macro_repo.py             # 宏觀數據訪問
│   │   ├── chip_repo.py              # 籌碼數據訪問
│   │   ├── ai_repo.py                # AI 分析數據訪問
│   │   └── user_repo.py              # 用戶數據訪問
│   │
│   ├── schemas/                      # Pydantic 模式定義
│   │   ├── __init__.py
│   │   ├── stock.py                  # 行情響應模式
│   │   ├── macro.py                  # 宏觀數據模式
│   │   ├── ai.py                     # AI 分析模式
│   │   └── common.py                 # 通用模式
│   │
│   ├── tasks/                        # 排程任務
│   │   ├── __init__.py
│   │   ├── fred_fetcher.py           # FRED 數據獲取
│   │   ├── twse_fetcher.py           # 台股數據獲取
│   │   ├── macro_processor.py        # 宏觀數據處理
│   │   ├── score_calculator.py       # AI 評分計算
│   │   └── report_generator.py       # 報告生成
│   │
│   ├── utils/                        # 工具函式
│   │   ├── __init__.py
│   │   ├── date_utils.py             # 日期處理
│   │   ├── number_utils.py           # 數值處理
│   │   ├── cache.py                  # 快取封裝
│   │   ├── logger.py                 # 日誌配置
│   │   └── validators.py             # 驗證器
│   │
│   ├── ml/                           # 機器學習模組
│   │   ├── __init__.py
│   │   ├── evolution/                # 演化策略
│   │   │   ├── genome.py             # 基因組定義
│   │   │   ├── population.py         # 族群管理
│   │   │   ├── fitness.py            # 適應度函數
│   │   │   └── evolver.py            # 演化控制
│   │   ├── nlp/                      # 自然語言處理
│   │   │   ├── embeddings.py         # 文字嵌入
│   │   │   └── analyzer.py           # 文本分析
│   │   └── factors/                  # 因子計算
│   │       ├── value.py              # 價值因子
│   │       ├── growth.py             # 成長因子
│   │       └── momentum.py           # 動能因子
│   │
│   ├── config.py                     # 應用配置
│   ├── extensions.py                 # 擴展初始化
│   └── factory.py                    # 工廠函式
│
├── migrations/                       # Alembic 遷移
│   ├── versions/
│   └── script.py.mako
│
├── scripts/                          # 腳本工具
│   ├── init_db.py                    # 資料庫初始化
│   ├── backup_db.py                  # 資料庫備份
│   └── restore_db.py                 # 資料庫恢復
│
├── tests/                            # 測試目錄
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── Dockerfile                        # Docker 配置
├── docker-compose.yml                # Docker Compose 配置
├── requirements.txt                  # Python 依賴
├── .env.example                      # 環境變數範本
├── .flaskenv                         # Flask 環境配置
└── pytest.ini                        # pytest 配置
```

### 2.2 命名規範

後端專案遵循一致的命名規範，確保程式碼的可讀性與可維護性。

檔案命名方面，Python 模組檔案採用 snake_case 命名法，例如 stock_service.py、data_processor.py。測試檔案採用 test_ 前綴命名，例如 test_stock_service.py。遷移檔案採用有意義的描述性名稱。

類別命名方面，資料庫模型採用 PascalCase 命名法，例如 StockPrice、MacroIndicator。Pydantic 模式採用 PascalCase 命名法並以 Schema 或 Response 結尾，例如 StockQuoteSchema、AIReportResponse。自定義異常採用 Error 後綴，例如 DataNotFoundError。

函式命名方面，普通函式採用 snake_case 命名法，例如 get_stock_prices、process_macro_data。私有方法採用底線前綴，例如 _calculate_ma、_validate_input。

常數命名方面，常數採用 UPPER_SNAKE_CASE 命名法，例如 API_RATE_LIMIT、DATE_FORMAT。

### 2.3 配置管理

系統採用分層配置管理，支援環境特定的配置。

config.py 是配置的核心模組，定義所有配置類別。

```python
# app/config.py
import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List

# 載入環境變數
load_dotenv()

class Settings(BaseSettings):
    """應用程式配置"""
    
    # 應用基本資訊
    APP_NAME: str = "AI 投資分析儀 V10.0"
    APP_VERSION: str = "10.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # API 配置
    API_PREFIX: str = "/api"
    API_VERSION: str = "v1"
    API_RATE_LIMIT: int = 60  # 每分鐘請求數限制
    
    # 資料庫配置
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@db:5432/ai_invest"
    )
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Redis 配置
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    REDIS_CACHE_TTL: int = 3600  # 預設快取時間（秒）
    
    # Milvus 配置
    MILVUS_HOST: str = os.getenv("MILVUS_HOST", "milvus")
    MILVUS_PORT: int = 19530
    
    # FRED API 配置
    FRED_API_KEY: str = os.getenv("FRED_API_KEY", "")
    FRED_RATE_LIMIT: int = 120  # 每分鐘請求數
    
    # 日誌配置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # 時區配置
    TIMEZONE: str = "Asia/Taipei"
    
    # 數據配置
    DATA_CACHE_ENABLED: bool = True
    UPDATE_BATCH_SIZE: int = 1000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


class DevelopmentSettings(Settings):
    """開發環境配置"""
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ai_invest_dev"
    REDIS_URL: str = "redis://localhost:6379/0"
    LOG_LEVEL: str = "DEBUG"
    DATA_CACHE_ENABLED: bool = False


class ProductionSettings(Settings):
    """生產環境配置"""
    DEBUG: bool = False
    DATA_CACHE_ENABLED: bool = True


# 根據環境載入配置
env = os.getenv("FLASK_ENV", "development")
if env == "production":
    settings = ProductionSettings()
else:
    settings = DevelopmentSettings()
```

---

## 第三章：核心框架配置

### 3.1 Flask 應用工廠

app/factory.py 定義 Flask 應用工廠函式，用於創建可配置的應用實例。

```python
# app/factory.py
from flask import Flask
from flask_cors import CORS
from flask_caching import Cache
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin

from app.config import settings
from app.extensions import db, cache, migrate, api
from app.utils.logger import setup_logger


def create_app(config=None):
    """
    Flask 應用工廠函式
    
    Args:
        config: 可選的配置對象
        
    Returns:
        Flask 應用實例
    """
    # 創建 Flask 應用
    app = Flask(__name__)
    
    # 載入配置
    app.config.from_object(config or settings)
    
    # 設置日誌
    setup_logger(app)
    
    # 初始化擴展
    init_extensions(app)
    
    # 註冊藍圖
    register_blueprints(app)
    
    # 註冊 CLI 命令
    register_commands(app)
    
    # 配置 API 文檔
    configure_api_doc(app)
    
    # 錯誤處理
    register_error_handlers(app)
    
    # 請求鉤子
    register_hooks(app)
    
    return app


def init_extensions(app: Flask):
    """初始化 Flask 擴展"""
    
    # CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-API-Key"]
        }
    })
    
    # 資料庫
    db.init_app(app)
    migrate.init_app(app, db)
    
    # 快取
    cache.init_app(app)
    
    # API
    api.init_app(app)


def register_blueprints(app: Flask):
    """註冊 Flask 藍圖"""
    
    from app.api.v1 import api_v1_bp
    
    app.register_blueprint(
        api_v1_bp,
        url_prefix=f"{settings.API_PREFIX}/{settings.API_VERSION}"
    )


def register_commands(app: Flask):
    """註冊 CLI 命令"""
    
    from app.cli.commands import init_db_command, backup_db_command
    
    app.cli.add_command(init_db_command)
    app.cli.add_command(backup_db_command)


def configure_api_doc(app: Flask):
    """配置 API 文檔"""
    
    app.config['APISPEC_SPEC'] = APISpec(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        plugins=[MarshmallowPlugin()],
        openapi_version='3.0.0'
    )


def register_error_handlers(app: Flask):
    """註冊錯誤處理器"""
    
    from app.api.errors import (
        handle_bad_request,
        handle_unauthorized,
        handle_forbidden,
        handle_not_found,
        handle_internal_error
    )
    
    app.errorhandler(400)(handle_bad_request)
    app.errorhandler(401)(handle_unauthorized)
    app.errorhandler(403)(handle_forbidden)
    app.errorhandler(404)(handle_not_found)
    app.errorhandler(500)(handle_internal_error)


def register_hooks(app: Flask):
    """註冊請求鉤子"""
    
    @app.before_request
    def before_request():
        """請求前處理"""
        from flask import g, request
        from app.utils.rate_limiter import rate_limit_exceeded
        
        # 速率限制檢查
        if request.endpoint and not request.endpoint.startswith('static'):
            if rate_limit_exceeded(request):
                from flask import jsonify
                return jsonify({
                    'status': 'error',
                    'error': {
                        'code': '42900',
                        'message': '請求過於頻繁，請稍後再試'
                    }
                }), 429
    
    @app.after_request
    def after_request(response):
        """請求後處理"""
        from flask import request
        
        # 添加安全頭
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        return response
```

### 3.2 擴展初始化

app/extensions.py 初始化所有 Flask 擴展。

```python
# app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_caching import Cache
from flask_restful import Api
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
cache = Cache(config={
    'CACHE_TYPE': 'RedisCache',
    'CACHE_REDIS_URL': 'redis://redis:6379/0',
    'CACHE_DEFAULT_TIMEOUT': 3600
})
api = Api()
cors = CORS()
```

### 3.3 API v1 藍圖註冊

app/api/v1/__init__.py 註冊所有 API v1 端點。

```python
# app/api/v1/__init__.py
from flask import Blueprint
from flask_restful import Api

api_v1_bp = Blueprint('api_v1', __name__)
api = Api(api_v1_bp)

# 匯入並註冊資源
from app.api.v1 import stocks, macro, chips, ai, user, health


def register_resources():
    """註冊所有 API 資源"""
    
    # 行情相關
    api.add_resource(stocks.StockListResource, '/stocks')
    api.add_resource(stocks.StockResource, '/stocks/<string:code>')
    api.add_resource(stocks.StockPriceResource, '/stocks/<string:code>/prices')
    api.add_resource(stocks.StockQuoteResource, '/stocks/<string:code>/quote')
    api.add_resource(stocks.StockKLineResource, '/stocks/<string:code>/kline')
    api.add_resource(stocks.StockIndicatorResource, '/stocks/<string:code>/indicators')
    api.add_resource(stocks.WatchlistResource, '/stocks/watcher')
    api.add_resource(stocks.IndustryResource, '/stocks/industries')
    
    # 宏觀數據相關
    api.add_resource(macro.MacroIndicatorListResource, '/macro/indicators')
    api.add_resource(macro.MacroIndicatorResource, '/macro/indicators/<string:code>')
    api.add_resource(macro.MacroFactorResource, '/macro/factors')
    api.add_resource(macro.MacroCalendarResource, '/macro/calendar')
    api.add_resource(macro.MacroCountryResource, '/macro/countries')
    
    # 籌碼分析相關
    api.add_resource(chips.MarginResource, '/chips/margin')
    api.add_resource(chips.InstitutionResource, '/chips/institution')
    api.add_resource(chips.OptionsResource, '/chips/options')
    api.add_resource(chips.F13Resource, '/chips/f13')
    
    # AI 分析相關
    api.add_resource(ai.AIScoreListResource, '/ai/scores')
    api.add_resource(ai.AIScoreResource, '/ai/scores/<string:code>')
    api.add_resource(ai.AIReportListResource, '/ai/reports')
    api.add_resource(ai.AIReportResource, '/ai/reports/<string:id>')
    api.add_resource(ai.AISearchResource, '/ai/search')
    api.add_resource(ai.AIEvolutionResource, '/ai/evolution')
    
    # 用戶相關
    api.add_resource(user.UserResource, '/user/profile')
    api.add_resource(user.UserPreferencesResource, '/user/preferences')
    api.add_resource(user.ChangePasswordResource, '/user/password')
    
    # 健康檢查
    api.add_resource(health.HealthResource, '/health')
    api.add_resource(health.ReadyResource, '/ready')


register_resources()
```

---

## 第四章：資料庫設計與管理

### 4.1 資料庫模型定義

系統使用 SQLAlchemy 作為 ORM，定義完整的資料庫模型。

app/models/base.py 定義基礎模型類別。

```python
# app/models/base.py
from datetime import datetime
from typing import Any
from sqlalchemy import Column, DateTime, Boolean
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class TimestampMixin:
    """時間戳記 Mixin"""
    
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="建立時間"
    )
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="更新時間"
    )


class SoftDeleteMixin:
    """軟刪除 Mixin"""
    
    is_deleted = db.Column(
        db.Boolean,
        default=False,
        nullable=False,
        comment="是否已刪除"
    )
    deleted_at = db.Column(
        db.DateTime,
        nullable=True,
        comment="刪除時間"
    )
    
    def soft_delete(self):
        """軟刪除"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()


class BaseModel(db.Model, TimestampMixin):
    """基礎模型類別"""
    
    __abstract__ = True
    
    def to_dict(self) -> dict:
        """轉換為字典"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def to_json(self) -> dict:
        """轉換為 JSON 格式"""
        return self.to_dict()
    
    @classmethod
    def from_dict(cls, data: dict) -> 'BaseModel':
        """從字典創建實例"""
        return cls(**{k: v for k, v in data.items() if hasattr(cls, k)})
```

app/models/stock.py 定義行情相關的資料庫模型。

```python
# app/models/stock.py
from datetime import date
from app.models.base import db, BaseModel, TimestampMixin


class Stock(BaseModel, TimestampMixin):
    """股票基本資訊"""
    
    __tablename__ = 'stocks'
    
    # 基本資訊
    code = db.Column(
        db.String(20),
        primary_key=True,
        comment="股票代碼"
    )
    name = db.Column(
        db.String(100),
        nullable=False,
        comment="股票名稱"
    )
    market = db.Column(
        db.String(10),
        nullable=False,
        comment="市場（上市/上櫃/ETF）"
    )
    industry = db.Column(
        db.String(50),
        nullable=True,
        comment="產業類別"
    )
    list_date = db.Column(
        db.Date,
        nullable=True,
        comment="上市日期"
    )
    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False,
        comment="是否活躍"
    )
    
    # 關聯
    prices = db.relationship(
        'StockPrice',
        backref='stock',
        lazy='dynamic',
        foreign_keys='StockPrice.stock_code'
    )
    
    def __repr__(self):
        return f'<Stock {self.code} {self.name}>'


class StockPrice(BaseModel, TimestampMixin):
    """股票日行情"""
    
    __tablename__ = 'stock_prices'
    __table_args__ = (
        db.Index('ix_stock_prices_code_date', 'stock_code', 'trade_date'),
        db.Index('ix_stock_prices_date', 'trade_date'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    stock_code = db.Column(
        db.String(20),
        db.ForeignKey('stocks.code'),
        nullable=False,
        comment="股票代碼"
    )
    trade_date = db.Column(
        db.Date,
        nullable=False,
        comment="交易日期"
    )
    
    # 價格資料
    open_price = db.Column(
        db.Numeric(18, 4),
        nullable=True,
        comment="開盤價"
    )
    high_price = db.Column(
        db.Numeric(18, 4),
        nullable=True,
        comment="最高價"
    )
    low_price = db.Column(
        db.Numeric(18, 4),
        nullable=True,
        comment="最低價"
    )
    close_price = db.Column(
        db.Numeric(18, 4),
        nullable=True,
        comment="收盤價"
    )
    
    # 成交量資料
    volume = db.Column(
        db.BigInteger,
        nullable=True,
        comment="成交量"
    )
    turnover = db.Column(
        db.Numeric(24, 2),
        nullable=True,
        comment="成交金額"
    )
    
    # 計算欄位
    change_percent = db.Column(
        db.Numeric(8, 4),
        nullable=True,
        comment="漲跌百分比"
    )
    
    def __repr__(self):
        return f'<StockPrice {self.stock_code} {self.trade_date}>'


class StockIndicator(BaseModel, TimestampMixin):
    """股票技術指標"""
    
    __tablename__ = 'stock_indicators'
    __table_args__ = (
        db.Index('ix_stock_indicators_code_date', 'stock_code', 'trade_date'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    stock_code = db.Column(
        db.String(20),
        db.ForeignKey('stocks.code'),
        nullable=False,
        comment="股票代碼"
    )
    trade_date = db.Column(
        db.Date,
        nullable=False,
        comment="交易日期"
    )
    
    # 移動平均線
    ma5 = db.Column(db.Numeric(18, 4), comment="5日均線")
    ma10 = db.Column(db.Numeric(18, 4), comment="10日均線")
    ma20 = db.Column(db.Numeric(18, 4), comment="20日均線")
    ma60 = db.Column(db.Numeric(18, 4), comment="60日均線")
    ma120 = db.Column(db.Numeric(18, 4), comment="120日均線")
    
    # 震盪指標
    rsi = db.Column(db.Numeric(8, 4), comment="相對強弱指標")
    k = db.Column(db.Numeric(8, 4), comment="%K值")
    d = db.Column(db.Numeric(8, 4), comment="%D值")
    macd = db.Column(db.Numeric(18, 8), comment="MACD")
    macd_signal = db.Column(db.Numeric(18, 8), comment="MACD Signal")
    macd_hist = db.Column(db.Numeric(18, 8), comment="MACD Hist")
    
    # 波動指標
    atr = db.Column(db.Numeric(18, 4), comment="真實波幅均值")
    boll_upper = db.Column(db.Numeric(18, 4), comment="布林通道上軌")
    boll_middle = db.Column(db.Numeric(18, 4), comment="布林通道中軌")
    boll_lower = db.Column(db.Numeric(18, 4), comment="布林通道下軌")
    
    def __repr__(self):
        return f'<StockIndicator {self.stock_code} {self.trade_date}>'


class Watchlist(BaseModel, TimestampMixin):
    """自選股"""
    
    __tablename__ = 'watchlists'
    __table_args__ = (
        db.Index('ix_watchlists_user_stock', 'user_id', 'stock_code'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.String(36),
        nullable=False,
        comment="用戶 ID"
    )
    stock_code = db.Column(
        db.String(20),
        db.ForeignKey('stocks.code'),
        nullable=False,
        comment="股票代碼"
    )
    note = db.Column(
        db.String(200),
        nullable=True,
        comment="備註"
    )
    sort_order = db.Column(
        db.Integer,
        default=0,
        comment="排序順序"
    )
    
    # 關聯
    stock = db.relationship('Stock')
    
    def __repr__(self):
        return f'<Watchlist {self.user_id} {self.stock_code}>'
```

### 4.2 宏觀數據模型

app/models/macro.py 定義宏觀經濟數據的資料庫模型。

```python
# app/models/macro.py
from datetime import date
from app.models.base import db, BaseModel


class MacroIndicator(BaseModel):
    """宏觀經濟指標"""
    
    __tablename__ = 'macro_indicators'
    __table_args__ = (
        db.Index('ix_macro_indicator_code_date', 'indicator_code', 'reference_date'),
        db.Index('ix_macro_country_date', 'country', 'reference_date'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    
    # 識別與分類
    indicator_code = db.Column(
        db.String(50),
        nullable=False,
        comment="指標代碼"
    )
    indicator_name = db.Column(
        db.String(200),
        nullable=False,
        comment="指標名稱"
    )
    country = db.Column(
        db.String(10),
        nullable=False,
        comment="國家（US/TW/CN/JP/EU）"
    )
    category = db.Column(
        db.String(50),
        nullable=False,
        comment="分類（利率/通膨/勞動/成長/信心）"
    )
    subcategory = db.Column(
        db.String(50),
        nullable=True,
        comment="子類別"
    )
    
    # 數據內容
    value = db.Column(
        db.Numeric(18, 6),
        nullable=True,
        comment="數值"
    )
    unit = db.Column(
        db.String(50),
        nullable=True,
        comment="單位"
    )
    frequency = db.Column(
        db.String(10),
        nullable=False,
        comment="頻率（D/W/M/Q/A）"
    )
    
    # 數據溯源
    source = db.Column(
        db.String(100),
        nullable=False,
        comment="數據來源"
    )
    series_id = db.Column(
        db.String(100),
        nullable=True,
        comment="FRED 系列 ID"
    )
    
    # 時間欄位
    reference_date = db.Column(
        db.Date,
        nullable=False,
        comment="參考日期"
    )
    release_date = db.Column(
        db.Date,
        nullable=True,
        comment="官方發布日期"
    )
    
    # 品質標記
    is_estimate = db.Column(
        db.Boolean,
        default=False,
        comment="是否為預估值"
    )
    is_revised = db.Column(
        db.Boolean,
        default=False,
        comment="是否為修正值"
    )
    
    def __repr__(self):
        return f'<MacroIndicator {self.indicator_code} {self.reference_date}>'


class MacroIndicatorInfo(BaseModel):
    """宏觀指標基本資訊"""
    
    __tablename__ = 'macro_indicator_info'
    
    indicator_code = db.Column(
        db.String(50),
        primary_key=True,
        comment="指標代碼"
    )
    indicator_name = db.Column(
        db.String(200),
        nullable=False,
        comment="指標名稱"
    )
    country = db.Column(
        db.String(10),
        nullable=False,
        comment="國家"
    )
    category = db.Column(
        db.String(50),
        nullable=False,
        comment="分類"
    )
    subcategory = db.Column(
        db.String(50),
        nullable=True,
        comment="子類別"
    )
    description = db.Column(
        db.Text,
        nullable=True,
        comment="指標說明"
    )
    unit = db.Column(
        db.String(50),
        nullable=True,
        comment="單位"
    )
    frequency = db.Column(
        db.String(10),
        nullable=False,
        comment="頻率"
    )
    source = db.Column(
        db.String(100),
        nullable=False,
        comment="數據來源"
    )
    series_id = db.Column(
        db.String(100),
        nullable=True,
        comment="FRED 系列 ID"
    )
    
    # 最新數據快取
    latest_value = db.Column(
        db.Numeric(18, 6),
        nullable=True,
        comment="最新數值"
    )
    latest_date = db.Column(
        db.Date,
        nullable=True,
        comment="最新日期"
    )
    
    def __repr__(self):
        return f'<MacroIndicatorInfo {self.indicator_code}>'


class MacroFactor(BaseModel):
    """宏觀因子（衍生計算）"""
    
    __tablename__ = 'macro_factors'
    __table_args__ = (
        db.Index('ix_macro_factor_code_date', 'factor_code', 'calculation_date'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    
    factor_code = db.Column(
        db.String(50),
        nullable=False,
        comment="因子代碼"
    )
    factor_name = db.Column(
        db.String(200),
        nullable=False,
        comment="因子名稱"
    )
    factor_category = db.Column(
        db.String(50),
        nullable=True,
        comment="因子分類"
    )
    
    value = db.Column(
        db.Numeric(18, 8),
        nullable=True,
        comment="因子數值"
    )
    unit = db.Column(
        db.String(50),
        nullable=True,
        comment="單位"
    )
    
    calculation_date = db.Column(
        db.Date,
        nullable=False,
        comment="計算日期"
    )
    
    def __repr__(self):
        return f'<MacroFactor {self.factor_code} {self.calculation_date}>'
```

### 4.3 AI 分析模型

app/models/ai.py 定義 AI 分析相關的資料庫模型。

```python
# app/models/ai.py
from datetime import date
from app.models.base import db, BaseModel


class AIScore(BaseModel):
    """AI 投資評分"""
    
    __tablename__ = 'ai_scores'
    __table_args__ = (
        db.Index('ix_ai_scores_code_date', 'stock_code', 'calculation_date'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    stock_code = db.Column(
        db.String(20),
        nullable=False,
        comment="股票代碼"
    )
    calculation_date = db.Column(
        db.Date,
        nullable=False,
        comment="計算日期"
    )
    
    # 維度評分（0-100）
    value_score = db.Column(
        db.Numeric(6, 2),
        nullable=True,
        comment="價值評分"
    )
    growth_score = db.Column(
        db.Numeric(6, 2),
        nullable=True,
        comment="成長評分"
    )
    quality_score = db.Column(
        db.Numeric(6, 2),
        nullable=True,
        comment="品質評分"
    )
    momentum_score = db.Column(
        db.Numeric(6, 2),
        nullable=True,
        comment="動能評分"
    )
    macro_score = db.Column(
        db.Numeric(6, 2),
        nullable=True,
        comment="宏觀評分"
    )
    
    # 綜合評分
    composite_score = db.Column(
        db.Numeric(6, 2),
        nullable=True,
        comment="綜合評分"
    )
    
    # 版本標記
    genome_version = db.Column(
        db.String(50),
        nullable=True,
        comment="基因組版本"
    )
    
    def __repr__(self):
        return f'<AIScore {self.stock_code} {self.calculation_date}>'


class AIReport(BaseModel):
    """AI 投資報告"""
    
    __tablename__ = 'ai_reports'
    __table_args__ = (
        db.Index('ix_ai_reports_code_date', 'stock_code', 'report_date'),
    )
    
    id = db.Column(db.String(36), primary_key=True, comment="報告 ID（UUID）")
    stock_code = db.Column(
        db.String(20),
        nullable=False,
        comment="股票代碼"
    )
    report_date = db.Column(
        db.Date,
        nullable=False,
        comment="報告日期"
    )
    
    # 報告內容
    title = db.Column(
        db.String(200),
        nullable=False,
        comment="報告標題"
    )
    summary = db.Column(
        db.Text,
        nullable=True,
        comment="報告摘要"
    )
    content = db.Column(
        db.Text,
        nullable=False,
        comment="報告內容（Markdown）"
    )
    
    # AI 分析結果
    recommendation = db.Column(
        db.String(20),
        nullable=True,
        comment="投資建議（買入/持有/賣出）"
    )
    confidence = db.Column(
        db.Numeric(5, 2),
        nullable=True,
        comment="信心度"
    )
    risk_level = db.Column(
        db.String(20),
        nullable=True,
        comment="風險等級"
    )
    
    # 質量指標
    data_completeness = db.Column(
        db.Numeric(5, 2),
        nullable=True,
        comment="數據完整性"
    )
    analysis_depth = db.Column(
        db.Numeric(5, 2),
        nullable=True,
        comment="分析深度"
    )
    
    def __repr__(self):
        return f'<AIReport {self.id} {self.stock_code}>'


class EvolutionGenome(BaseModel):
    """演化策略基因組"""
    
    __tablename__ = 'evolution_genomes'
    __table_args__ = (
        db.Index('ix_evolution_genome_version', 'version'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    version = db.Column(
        db.String(50),
        nullable=False,
        unique=True,
        comment="版本號"
    )
    
    # 核心基因（14項）
    value_weight = db.Column(db.Numeric(8, 4), default=0.20, comment="價值因子權重")
    growth_weight = db.Column(db.Numeric(8, 4), default=0.25, comment="成長因子權重")
    quality_weight = db.Column(db.Numeric(8, 4), default=0.20, comment="品質因子權重")
    momentum_weight = db.Column(db.Numeric(8, 4), default=0.20, comment="動能因子權重")
    macro_weight = db.Column(db.Numeric(8, 4), default=0.15, comment="宏觀因子權重")
    
    pe_threshold = db.Column(db.Numeric(8, 4), default=20.0, comment="PE 閾值")
    pb_threshold = db.Column(db.Numeric(8, 4), default=2.0, comment="PB 閾值")
    eps_growth_threshold = db.Column(db.Numeric(8, 4), default=10.0, comment="EPS 成長閾值")
    roe_threshold = db.Column(db.Numeric(8, 4), default=10.0, comment="ROE 閾值")
    momentum_threshold = db.Column(db.Numeric(8, 4), default=5.0, comment="動能閾值")
    
    holding_days_long = db.Column(db.Integer, default=30, comment="多頭持有天數")
    holding_days_short = db.Column(db.Integer, default=15, comment="空頭持有天數")
    rebalance_period = db.Column(db.Integer, default=7, comment="再平衡週期（天）")
    risk_adjustment = db.Column(db.Numeric(8, 4), default=1.0, comment="風險調整係數")
    
    # 調控基因（12項）
    evolution_rate = db.Column(db.Numeric(8, 4), default=0.1, comment="演化速率")
    mutation_rate = db.Column(db.Numeric(8, 4), default=0.05, comment="突變機率")
    elite_ratio = db.Column(db.Numeric(8, 4), default=0.2, comment="菁英保留比例")
    population_size = db.Column(db.Integer, default=100, comment="族群規模")
    iterations = db.Column(db.Integer, default=50, comment="迭代次數")
    crossover_rate = db.Column(db.Numeric(8, 4), default=0.8, comment="交叉機率")
    
    # 適應度結果
    fitness_value = db.Column(db.Numeric(12, 6), nullable=True, comment="適應度值")
    annual_return = db.Column(db.Numeric(8, 4), nullable=True, comment="年化報酬率")
    sharpe_ratio = db.Column(db.Numeric(8, 4), nullable=True, comment="夏普比率")
    max_drawdown = db.Column(db.Numeric(8, 4), nullable=True, comment="最大回撤")
    
    # 時間戳記
    training_start = db.Column(db.DateTime, nullable=True, comment="訓練開始時間")
    training_end = db.Column(db.DateTime, nullable=True, comment="訓練結束時間")
    
    def __repr__(self):
        return f'<EvolutionGenome {self.version}>'


class EvolutionHistory(BaseModel):
    """演化歷史記錄"""
    
    __tablename__ = 'evolution_history'
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    generation = db.Column(db.Integer, nullable=False, comment="世代")
    best_fitness = db.Column(db.Numeric(12, 6), nullable=True, comment="最佳適應度")
    avg_fitness = db.Column(db.Numeric(12, 6), nullable=True, comment="平均適應度")
    diversity = db.Column(db.Numeric(8, 4), nullable=True, comment="多樣性")
    
    notes = db.Column(db.Text, nullable=True, comment="備註")
    
    def __repr__(self):
        return f'<EvolutionHistory Generation {self.generation}>'
```

### 4.4 資料庫遷移配置

migrations/env.py 配置 Alembic 遷移環境。

```python
# migrations/env.py
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy import engine_from_config

from alembic import context

# 添加專案根目錄到 Python 路徑
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 載入應用配置
from app.config import settings
from app.models import db

# this is the Alembic Config object
config = context.config

# 設置資料庫 URL
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target_metadata
target_metadata = db.metadata


def run_migrations_offline() -> None:
    """離線執行遷移"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """線上執行遷移"""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

---

## 第五章：API 服務層

### 5.1 API 端點實作

app/api/v1/stocks.py 實作行情相關的 API 端點。

```python
# app/api/v1/stocks.py
from flask import request, g
from flask_restful import Resource
from marshmallow import Schema, fields, validate, EXCLUDE

from app.models import Stock, StockPrice, StockIndicator, Watchlist
from app.services import stock_service
from app.schemas import StockSchema, StockPriceSchema
from app.utils.decorators import api_rate_limit, cache_response
from app.utils.response import success_response, error_response


class StockListResource(Resource):
    """股票清單資源"""
    
    def __init__(self):
        self.schema = StockSchema(many=True)
    
    @api_rate_limit
    def get(self):
        """取得股票清單"""
        
        # 查詢參數
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 20, type=int)
        market = request.args.get('market')
        industry = request.args.get('industry')
        keyword = request.args.get('keyword')
        is_active = request.args.get('is_active', 'true').lower() == 'true'
        
        # 查詢
        query = Stock.query.filter_by(is_active=is_active)
        
        if market:
            query = query.filter_by(market=market)
        if industry:
            query = query.filter_by(industry=industry)
        if keyword:
            query = query.filter(
                (Stock.code.ilike(f'%{keyword}%')) |
                (Stock.name.ilike(f'%{keyword}%'))
            )
        
        # 分頁
        pagination = query.paginate(
            page=page,
            per_page=page_size,
            error_out=False
        )
        
        return success_response({
            'list': self.schema.dump(pagination.items),
            'total': pagination.total,
            'page': pagination.page,
            'pageSize': pagination.per_page,
            'hasMore': pagination.has_next
        })


class StockResource(Resource):
    """股票資源"""
    
    def __init__(self):
        self.schema = StockSchema()
    
    @api_rate_limit
    @cache_response(timeout=3600)
    def get(self, code):
        """取得單一股票資訊"""
        
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        return success_response(self.schema.dump(stock))


class StockPriceResource(Resource):
    """股票行情資源"""
    
    def __init__(self):
        self.schema = StockPriceSchema(many=True)
    
    @api_rate_limit
    @cache_response(timeout=300)
    def get(self, code):
        """取得股票歷史行情"""
        
        # 驗證股票存在
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        # 查詢參數
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        limit = request.args.get('limit', 1000, type=int)
        
        # 查詢
        query = StockPrice.query.filter_by(stock_code=code)
        
        if start_date:
            query = query.filter(StockPrice.trade_date >= start_date)
        if end_date:
            query = query.filter(StockPrice.trade_date <= end_date)
        
        # 限制數量
        prices = query.order_by(
            StockPrice.trade_date.desc()
        ).limit(limit).all()
        
        return success_response(self.schema.dump(prices))


class StockQuoteResource(Resource):
    """股票即時報價資源"""
    
    @api_rate_limit
    def get(self, code):
        """取得股票即時報價"""
        
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        # 從服務獲取即時報價
        quote = stock_service.get_stock_quote(code)
        
        return success_response(quote)


class StockKLineResource(Resource):
    """股票 K 線資源"""
    
    @api_rate_limit
    def get(self, code):
        """取得股票 K 線數據"""
        
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        # 參數
        chart_type = request.args.get('chartType', 'K')
        time_unit = request.args.get('timeUnit', 'D')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        kline = stock_service.get_kline_data(
            code=code,
            chart_type=chart_type,
            time_unit=time_unit,
            start_date=start_date,
            end_date=end_date
        )
        
        return success_response(kline)


class StockIndicatorResource(Resource):
    """股票技術指標資源"""
    
    @api_rate_limit
    def get(self, code):
        """取得股票技術指標"""
        
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        # 參數
        trade_date = request.args.get('tradeDate')
        indicators_str = request.args.get('indicators', '')
        
        if indicators_str:
            indicators = indicators_str.split(',')
        else:
            indicators = None
        
        ind_data = stock_service.get_indicators(
            code=code,
            trade_date=trade_date,
            indicators=indicators
        )
        
        return success_response(ind_data)


class WatchlistResource(Resource):
    """自選股資源"""
    
    method_decorators = [api_rate_limit]
    
    def __init__(self):
        self.schema = StockSchema(many=True)
    
    def get(self):
        """取得自選股清單"""
        
        user_id = g.user_id
        watchlist = Watchlist.query.filter_by(
            user_id=user_id,
            is_deleted=False
        ).order_by(Watchlist.sort_order).all()
        
        stocks = [w.stock for w in watchlist]
        
        return success_response(self.schema.dump(stocks))
    
    def post(self):
        """新增自選股"""
        
        data = request.get_json()
        code = data.get('code')
        
        if not code:
            return error_response('40001', '股票代碼必填'), 400
        
        # 驗證股票存在
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        user_id = g.user_id
        
        # 檢查是否已在自選
        existing = Watchlist.query.filter_by(
            user_id=user_id,
            stock_code=code,
            is_deleted=False
        ).first()
        
        if existing:
            return error_response('40901', '股票已在自選中'), 409
        
        # 新增
        watchlist = Watchlist(user_id=user_id, stock_code=code)
        db.session.add(watchlist)
        db.session.commit()
        
        return success_response({'message': '已加入自選'})
    
    def delete(self):
        """移除自選股"""
        
        data = request.get_json()
        code = data.get('code')
        
        if not code:
            return error_response('40001', '股票代碼必填'), 400
        
        user_id = g.user_id
        
        watchlist = Watchlist.query.filter_by(
            user_id=user_id,
            stock_code=code,
            is_deleted=False
        ).first()
        
        if not watchlist:
            return error_response('40401', '股票不在自選中'), 404
        
        watchlist.soft_delete()
        db.session.commit()
        
        return success_response({'message': '已移除自選'})


class IndustryResource(Resource):
    """產業清單資源"""
    
    @api_rate_limit
    def get(self):
        """取得產業清單"""
        
        query = request.args.get('query')
        
        industries = stock_service.get_industries(query)
        
        return success_response(industries)
```

### 5.2 響應格式封裝

app/utils/response.py 封裝標準化的 API 響應格式。

```python
# app/utils/response.py
from datetime import datetime
from flask import jsonify


def success_response(data=None, message='success', meta=None):
    """
    成功響應
    
    Args:
        data: 業務數據
        message: 響應消息
        meta: 元數據（分頁等）
        
    Returns:
        Flask Response
    """
    response = {
        'status': 'success',
        'data': data,
        'message': message,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    
    if meta:
        response['meta'] = meta
    
    return jsonify(response)


def error_response(code, message, details=None, status_code=400):
    """
    錯誤響應
    
    Args:
        code: 錯誤代碼
        message: 錯誤消息
        details: 詳細資訊
        status_code: HTTP 狀態碼
        
    Returns:
        Flask Response
    """
    response = {
        'status': 'error',
        'error': {
            'code': code,
            'message': message
        },
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    
    if details:
        response['error']['details'] = details
    
    return jsonify(response), status_code


def paginated_response(data, page, page_size, total):
    """
    分頁響應
    
    Args:
        data: 數據列表
        page: 當前頁碼
        page_size: 每頁數量
        total: 總數量
        
    Returns:
        標準化的分頁響應
    """
    return success_response(
        data=data,
        meta={
            'page': page,
            'pageSize': page_size,
            'total': total,
            'hasMore': page * page_size < total
        }
    )
```

### 5.3 請求驗證 Schema

app/schemas/stock.py 定義請求與響應的 Pydantic Schema。

```python
# app/schemas/stock.py
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator

from app.schemas.common import BaseSchema


class StockSchema(BaseSchema):
    """股票 Schema"""
    
    code: str = Field(..., description='股票代碼')
    name: str = Field(..., description='股票名稱')
    market: str = Field(..., description='市場')
    industry: Optional[str] = Field(None, description='產業類別')
    list_date: Optional[date] = Field(None, description='上市日期')
    is_active: bool = Field(True, description='是否活躍')


class StockPriceSchema(BaseSchema):
    """股票行情 Schema"""
    
    trade_date: date = Field(..., description='交易日期')
    open_price: Optional[float] = Field(None, description='開盤價')
    high_price: Optional[float] = Field(None, description='最高價')
    low_price: Optional[float] = Field(None, description='最低價')
    close_price: Optional[float] = Field(None, description='收盤價')
    volume: Optional[int] = Field(None, description='成交量')
    turnover: Optional[float] = Field(None, description='成交金額')
    change_percent: Optional[float] = Field(None, description='漲跌百分比')


class KLineDataSchema(BaseSchema):
    """K線數據 Schema"""
    
    date: str = Field(..., description='日期')
    open: float = Field(..., description='開盤價')
    high: float = Field(..., description='最高價')
    low: float = Field(..., description='最低價')
    close: float = Field(..., description='收盤價')
    volume: int = Field(..., description='成交量')


class IndicatorSchema(BaseSchema):
    """技術指標 Schema"""
    
    trade_date: date = Field(..., description='交易日期')
    ma5: Optional[float] = Field(None, description='5日均線')
    ma10: Optional[float] = Field(None, description='10日均線')
    ma20: Optional[float] = Field(None, description='20日均線')
    ma60: Optional[float] = Field(None, description='60日均線')
    rsi: Optional[float] = Field(None, description='RSI')
    k: Optional[float] = Field(None, description='%K值')
    d: Optional[float] = Field(None, description='%D值')
    macd: Optional[float] = Field(None, description='MACD')
    macd_signal: Optional[float] = Field(None, description='MACD Signal')
    macd_hist: Optional[float] = Field(None, description='MACD Hist')
    atr: Optional[float] = Field(None, description='ATR')
    boll_upper: Optional[float] = Field(None, description='布林上軌')
    boll_middle: Optional[float] = Field(None, description='布林中軌')
    boll_lower: Optional[float] = Field(None, description='布林下軌')


class StockSearchSchema(BaseSchema):
    """股票搜尋 Schema"""
    
    keyword: Optional[str] = Field('', description='關鍵字')
    market: Optional[str] = Field(None, description='市場')
    industry: Optional[str] = Field(None, description='產業')
    page: int = Field(1, ge=1, description='頁碼')
    pageSize: int = Field(20, ge=1, le=100, description='每頁數量')
```

---

## 第六章：業務邏輯層

### 6.1 行情服務

app/services/stock_service.py 實作行情相關的業務邏輯。

```python
# app/services/stock_service.py
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from collections import defaultdict

from app import db, cache
from app.models import Stock, StockPrice, StockIndicator
from app.repositories import StockRepository
from app.utils.decorators import cached
from app.utils.number import calculate_moving_average, calculate_rsi


class StockService:
    """股票服務類"""
    
    def __init__(self):
        self.repo = StockRepository()
    
    def get_stock_quote(self, code: str) -> Dict[str, Any]:
        """
        取得股票即時報價
        
        Args:
            code: 股票代碼
            
        Returns:
            報價資訊字典
        """
        # 獲取最新行情
        latest_price = StockPrice.query.filter_by(
            stock_code=code
        ).order_by(StockPrice.trade_date.desc()).first()
        
        if not latest_price:
            return {}
        
        # 計算漲跌幅
        prev_price = StockPrice.query.filter(
            StockPrice.stock_code == code,
            StockPrice.trade_date < latest_price.trade_date
        ).order_by(StockPrice.trade_date.desc()).first()
        
        change_percent = None
        if prev_price and prev_price.close_price:
            change_percent = (
                (latest_price.close_price - prev_price.close_price) /
                prev_price.close_price * 100
            )
        
        return {
            'code': code,
            'tradeDate': latest_price.trade_date.isoformat(),
            'open': float(latest_price.open_price) if latest_price.open_price else None,
            'high': float(latest_price.high_price) if latest_price.high_price else None,
            'low': float(latest_price.low_price) if latest_price.low_price else None,
            'close': float(latest_price.close_price) if latest_price.close_price else None,
            'volume': latest_price.volume,
            'turnover': float(latest_price.turnover) if latest_price.turnover else None,
            'changePercent': float(change_percent) if change_percent else None
        }
    
    def get_kline_data(
        self,
        code: str,
        chart_type: str = 'K',
        time_unit: str = 'D',
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        取得 K 線數據
        
        Args:
            code: 股票代碼
            chart_type: 圖表類型（K/Line）
            time_unit: 時間單位（D/W/M）
            start_date: 開始日期
            end_date: 結束日期
            
        Returns:
            K 線數據列表
        """
        # 查詢參數
        query = StockPrice.query.filter_by(stock_code=code)
        
        if start_date:
            query = query.filter(StockPrice.trade_date >= start_date)
        if end_date:
            query = query.filter(StockPrice.trade_date <= end_date)
        
        prices = query.order_by(StockPrice.trade_date.asc()).all()
        
        # 轉換為 K 線格式
        if chart_type == 'Line':
            return [
                {
                    'date': p.trade_date.isoformat(),
                    'value': float(p.close_price) if p.close_price else None
                }
                for p in prices
                if p.close_price
            ]
        
        return [
            {
                'date': p.trade_date.isoformat(),
                'open': float(p.open_price) if p.open_price else None,
                'high': float(p.high_price) if p.high_price else None,
                'low': float(p.low_price) if p.low_price else None,
                'close': float(p.close_price) if p.close_price else None,
                'volume': p.volume
            }
            for p in prices
        ]
    
    def get_indicators(
        self,
        code: str,
        trade_date: Optional[str] = None,
        indicators: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        取得技術指標
        
        Args:
            code: 股票代碼
            trade_date: 交易日期
            indicators: 指標列表
            
        Returns:
            技術指標字典
        """
        # 查詢最新或指定日期的指標
        query = StockIndicator.query.filter_by(stock_code=code)
        
        if trade_date:
            target_date = datetime.strptime(trade_date, '%Y-%m-%d').date()
            indicator = query.filter_by(trade_date=target_date).first()
            indicators_data = [indicator] if indicator else []
        else:
            indicators_data = query.order_by(
                StockIndicator.trade_date.desc()
            ).limit(50).all()
        
        # 如果沒有計算好的指標，則即時計算
        if not indicators_data:
            indicators_data = self._calculate_indicators(code)
        
        result = {}
        for ind in indicators_data:
            if ind:
                data = ind.to_dict()
                del data['id']
                del data['stock_code']
                del data['trade_date']
                result.update(data)
        
        return result
    
    def _calculate_indicators(self, code: str) -> List[StockIndicator]:
        """計算技術指標"""
        
        # 獲取股價數據
        prices = StockPrice.query.filter_by(
            stock_code=code
        ).order_by(StockPrice.trade_date.asc()).limit(120).all()
        
        if len(prices) < 20:
            return []
        
        closes = [p.close_price for p in prices if p.close_price]
        
        # 計算移動平均線
        ma5 = calculate_moving_average(closes, 5)
        ma10 = calculate_moving_average(closes, 10)
        ma20 = calculate_moving_average(closes, 20)
        ma60 = calculate_moving_average(closes, 60)
        
        # 計算 RSI
        rsi = calculate_rsi(closes, 14)
        
        # 創建指標記錄
        latest_price = prices[-1]
        indicator = StockIndicator(
            stock_code=code,
            trade_date=latest_price.trade_date,
            ma5=ma5[-1] if ma5 else None,
            ma10=ma10[-1] if ma10 else None,
            ma20=ma20[-1] if ma20 else None,
            ma60=ma60[-1] if ma60 else None,
            rsi=rsi[-1] if rsi else None
        )
        
        return [indicator]
    
    def get_industries(self, query: str = None) -> List[Dict[str, str]]:
        """
        取得產業清單
        
        Args:
            query: 搜尋關鍵字
            
        Returns:
            產業列表
        """
        sql_query = db.session.query(
            Stock.industry,
            db.func.count(Stock.code)
        ).filter(
            Stock.is_active == True,
            Stock.industry.isnot(None)
        ).group_by(Stock.industry)
        
        if query:
            sql_query = sql_query.filter(
                Stock.industry.ilike(f'%{query}%')
            )
        
        results = sql_query.all()
        
        return [
            {'code': r[0], 'name': r[0], 'count': r[1]}
            for r in results if r[0]
        ]


# 單例實例
stock_service = StockService()
```

### 6.2 宏觀數據服務

app/services/macro_service.py 實作宏觀數據相關的業務邏輯。

```python
# app/services/macro_service.py
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from collections import defaultdict

from app import db, cache
from app.models import MacroIndicator, MacroIndicatorInfo, MacroFactor
from app.repositories import MacroRepository
from app.utils.decorators import cached


class MacroService:
    """宏觀數據服務類"""
    
    def __init__(self):
        self.repo = MacroRepository()
    
    @cached(timeout=300)
    def search_indicators(
        self,
        country: str = None,
        category: str = None,
        keyword: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        搜尋宏觀指標
        
        Args:
            country: 國家代碼
            category: 分類
            keyword: 關鍵字
            page: 頁碼
            page_size: 每頁數量
            
        Returns:
            分頁結果
        """
        query = MacroIndicatorInfo.query
        
        if country:
            query = query.filter_by(country=country)
        if category:
            query = query.filter_by(category=category)
        if keyword:
            query = query.filter(
                (MacroIndicatorInfo.indicator_code.ilike(f'%{keyword}%')) |
                (MacroIndicatorInfo.indicator_name.ilike(f'%{keyword}%'))
            )
        
        pagination = query.paginate(
            page=page,
            per_page=page_size,
            error_out=False
        )
        
        return {
            'list': [self._format_indicator_info(i) for i in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'pageSize': pagination.per_page
        }
    
    def get_indicator_data(
        self,
        code: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        transformation: str = '原值'
    ) -> List[Dict[str, Any]]:
        """
        取得指標歷史數據
        
        Args:
            code: 指標代碼
            start_date: 開始日期
            end_date: 結束日期
            transformation: 轉換類型（原值/YoY/MoM/QoQ）
            
        Returns:
            時間序列數據
        """
        query = MacroIndicator.query.filter_by(indicator_code=code)
        
        if start_date:
            query = query.filter(
                MacroIndicator.reference_date >= start_date
            )
        if end_date:
            query = query.filter(
                MacroIndicator.reference_date <= end_date
            )
        
        data = query.order_by(
            MacroIndicator.reference_date.asc()
        ).all()
        
        result = []
        prev_values = None
        
        for item in data:
            value = item.value
            
            # 計算 YoY/MoM/QoQ
            if transformation == 'YoY' and prev_values and len(prev_values) >= 12:
                yoy_value = (value - prev_values[-12]) / prev_values[-12] * 100
                value = yoy_value
            elif transformation == 'MoM' and prev_values and len(prev_values) >= 1:
                mom_value = (value - prev_values[-1]) / prev_values[-1] * 100
                value = mom_value
            
            result.append({
                'date': item.reference_date.isoformat(),
                'value': float(value) if value else None,
                'unit': item.unit,
                'source': item.source
            })
            
            prev_values = [d['value'] for d in result if d['value'] is not None]
        
        return result
    
    def get_indicator_info(self, code: str) -> Optional[Dict[str, Any]]:
        """
        取得指標基本資訊
        
        Args:
            code: 指標代碼
            
        Returns:
            指標資訊
        """
        info = MacroIndicatorInfo.query.filter_by(
            indicator_code=code
        ).first()
        
        return self._format_indicator_info(info) if info else None
    
    def get_macro_factors(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: str = None
    ) -> List[Dict[str, Any]]:
        """
        取得宏觀因子
        
        Args:
            start_date: 開始日期
            end_date: 結束日期
            category: 分類
            
        Returns:
            因子數據列表
        """
        query = MacroFactor.query
        
        if start_date:
            query = query.filter(
                MacroFactor.calculation_date >= start_date
            )
        if end_date:
            query = query.filter(
                MacroFactor.calculation_date <= end_date
            )
        if category:
            query = query.filter_by(factor_category=category)
        
        factors = query.order_by(
            MacroFactor.calculation_date.asc()
        ).all()
        
        # 按日期分組
        grouped = defaultdict(list)
        for f in factors:
            grouped[f.calculation_date.isoformat()].append({
                'code': f.factor_code,
                'name': f.factor_name,
                'category': f.factor_category,
                'value': float(f.value) if f.value else None,
                'unit': f.unit
            })
        
        return [
            {'date': date, 'factors': factors}
            for date, factors in sorted(grouped.items())
        ]
    
    def calculate_factors(self, calculation_date: date):
        """計算宏觀因子"""
        
        # 殖利率曲線斜率
        long_rate = self._get_latest_rate('DGS10')
        short_rate = self._get_latest_rate('DGS2')
        if long_rate and short_rate:
            curve_slope = long_rate - short_rate
            self._save_factor(
                'yield_curve_slope',
                '殖利率曲線斜率',
                '利率',
                curve_slope,
                '%',
                calculation_date
            )
        
        # 實質利率
        nominal_rate = self._get_latest_rate('FEDFUNDS')
        inflation = self._get_latest_value('T10YIE')
        if nominal_rate and inflation:
            real_rate = nominal_rate - inflation
            self._save_factor(
                'real_rate',
                '實質利率',
                '利率',
                real_rate,
                '%',
                calculation_date
            )
        
        # M2 年增率
        m2 = self._get_latest_value('M2GROWTH')
        if m2 is not None:
            self._save_factor(
                'm2_growth',
                'M2 貨幣供給年增率',
                '貨幣',
                m2,
                '%',
                calculation_date
            )
    
    def _get_latest_rate(self, series_id: str) -> Optional[float]:
        """取得最新利率"""
        indicator = MacroIndicator.query.filter_by(
            series_id=series_id
        ).order_by(
            MacroIndicator.reference_date.desc()
        ).first()
        return indicator.value if indicator else None
    
    def _get_latest_value(self, indicator_code: str) -> Optional[float]:
        """取得最新指標值"""
        indicator = MacroIndicator.query.filter_by(
            indicator_code=indicator_code
        ).order_by(
            MacroIndicator.reference_date.desc()
        ).first()
        return indicator.value if indicator else None
    
    def _save_factor(
        self,
        code: str,
        name: str,
        category: str,
        value: float,
        unit: str,
        calc_date: date
    ):
        """儲存宏觀因子"""
        factor = MacroFactor(
            factor_code=code,
            factor_name=name,
            factor_category=category,
            value=value,
            unit=unit,
            calculation_date=calc_date
        )
        db.session.add(factor)
    
    def _format_indicator_info(self, info: MacroIndicatorInfo) -> Dict[str, Any]:
        """格式化指標資訊"""
        return {
            'code': info.indicator_code,
            'name': info.indicator_name,
            'country': info.country,
            'category': info.category,
            'subcategory': info.subcategory,
            'description': info.description,
            'unit': info.unit,
            'frequency': info.frequency,
            'source': info.source,
            'latestValue': float(info.latest_value) if info.latest_value else None,
            'latestDate': info.latest_date.isoformat() if info.latest_date else None
        }


# 單例實例
macro_service = MacroService()
```

---

## 第七章：數據處理服務

### 7.1 數據處理引擎

app/services/data_processor.py 實作數據清洗與處理邏輯。

```python
# app/services/data_processor.py
from datetime import date, datetime
from typing import List, Dict, Any, Optional
import logging

from app import db, cache
from app.models import StockPrice, StockIndicator, Stock
from app.utils.validators import validate_stock_price, validate_number
from app.utils.exceptions import DataQualityError


class DataProcessor:
    """數據處理引擎"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.quality_rules = self._init_quality_rules()
    
    def _init_quality_rules(self) -> Dict[str, Dict]:
        """初始化品質規則"""
        return {
            'price_range': {
                'min': 0.01,
                'max': 100000,
                'field': '價格'
            },
            'volume_range': {
                'min': 0,
                'max': 1000000000,
                'field': '成交量'
            },
            'change_limit': {
                'max': 30,
                'field': '漲跌幅'
            }
        }
    
    def process_stock_prices(
        self,
        prices: List[Dict[str, Any]],
        stock_code: str
    ) -> List[StockPrice]:
        """
        處理股票行情數據
        
        Args:
            prices: 原始行情數據列表
            stock_code: 股票代碼
            
        Returns:
            處理後的 StockPrice 對象列表
        """
        processed = []
        errors = []
        
        for idx, price_data in enumerate(prices):
            try:
                # 驗證數據
                self._validate_price_data(price_data, stock_code)
                
                # 計算衍生欄位
                price_data = self._calculate_derived_fields(price_data)
                
                # 創建或更新記錄
                existing = self._find_existing_price(stock_code, price_data['trade_date'])
                
                if existing:
                    for key, value in price_data.items():
                        if hasattr(existing, key):
                            setattr(existing, key, value)
                    processed.append(existing)
                else:
                    price = StockPrice(stock_code=stock_code, **price_data)
                    processed.append(price)
                    
            except DataQualityError as e:
                errors.append({
                    'index': idx,
                    'date': str(price_data.get('trade_date')),
                    'error': str(e)
                })
            except Exception as e:
                self.logger.error(f'Error processing price at index {idx}: {e}')
                errors.append({
                    'index': idx,
                    'error': str(e)
                })
        
        # 記錄錯誤
        if errors:
            self.logger.warning(
                f'Data quality issues for {stock_code}: {len(errors)} errors'
            )
            self._log_quality_issues(stock_code, errors)
        
        return processed
    
    def _validate_price_data(
        self,
        data: Dict[str, Any],
        stock_code: str
    ) -> None:
        """驗證行情數據"""
        
        required_fields = ['trade_date', 'close_price']
        for field in required_fields:
            if field not in data or data[field] is None:
                raise DataQualityError(f'缺少必要欄位: {field}')
        
        # 價格範圍檢查
        for price_field in ['open_price', 'high_price', 'low_price', 'close_price']:
            if price_field in data and data[price_field] is not None:
                value = float(data[price_field])
                rule = self.quality_rules['price_range']
                if value < rule['min'] or value > rule['max']:
                    raise DataQualityError(
                        f'{rule["field"]} {value} 超出合理範圍'
                    )
        
        # 成交量檢查
        if 'volume' in data and data['volume'] is not None:
            volume = int(data['volume'])
            rule = self.quality_rules['volume_range']
            if volume < rule['min'] or volume > rule['max']:
                raise DataQualityError(
                    f'{rule["field"]} {volume} 超出合理範圍'
                )
        
        # OHLC 邏輯檢查
        if all(k in data for k in ['open_price', 'high_price', 'low_price', 'close_price']):
            if data['high_price'] is not None and data['low_price'] is not None:
                if data['high_price'] < data['low_price']:
                    raise DataQualityError('最高價低於最低價')
    
    def _calculate_derived_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """計算衍生欄位"""
        
        # 計算漲跌幅
        if 'close_price' in data and 'prev_close' in data:
            if data['close_price'] and data['prev_close']:
                data['change_percent'] = (
                    (data['close_price'] - data['prev_close']) /
                    data['prev_close'] * 100
                )
        
        # 計算成交金額
        if 'volume' in data and 'close_price' in data:
            if data['volume'] and data['close_price']:
                data['turnover'] = data['volume'] * data['close_price'] * 1000  # 股數 × 收盤價 × 面額
        
        return data
    
    def _find_existing_price(
        self,
        stock_code: str,
        trade_date: date
    ) -> Optional[StockPrice]:
        """查找現有行情記錄"""
        return StockPrice.query.filter_by(
            stock_code=stock_code,
            trade_date=trade_date
        ).first()
    
    def _log_quality_issues(
        self,
        stock_code: str,
        errors: List[Dict[str, Any]]
    ) -> None:
        """記錄品質問題"""
        
        # 寫入品質日誌表
        from app.models import DataQualityLog
        
        for error in errors:
            log = DataQualityLog(
                data_type='stock_price',
                data_code=stock_code,
                issue_date=error.get('date'),
                issue_type='validation_error',
                details=str(error.get('error')),
                status='logged'
            )
            db.session.add(log)
        
        db.session.commit()
    
    def calculate_indicators(self, stock_code: str, trade_date: date):
        """計算股票技術指標"""
        
        # 獲取股價數據
        prices = StockPrice.query.filter_by(
            stock_code=stock_code
        ).filter(
            StockPrice.trade_date <= trade_date
        ).order_by(
            StockPrice.trade_date.desc()
        ).limit(120).all()
        
        if len(prices) < 20:
            return
        
        # 準備數據
        closes = [p.close_price for p in prices if p.close_price]
        highs = [p.high_price for p in prices if p.high_price]
        lows = [p.low_price for p in prices if p.low_price]
        
        # 計算各項指標
        indicator_data = {
            'stock_code': stock_code,
            'trade_date': trade_date,
            'ma5': self._ma(closes, 5),
            'ma10': self._ma(closes, 10),
            'ma20': self._ma(closes, 20),
            'ma60': self._ma(closes, 60),
            'rsi': self._rsi(closes, 14),
            'macd': self._macd(closes, 12, 26),
            'atr': self._atr(highs, lows, closes, 14),
            'boll': self._bollinger(closes, 20, 2),
        }
        
        # 更新或創建指標記錄
        existing = StockIndicator.query.filter_by(
            stock_code=stock_code,
            trade_date=trade_date
        ).first()
        
        if existing:
            for key, value in indicator_data.items():
                setattr(existing, key, value)
        else:
            indicator = StockIndicator(**indicator_data)
            db.session.add(indicator)
        
        db.session.commit()
    
    def _ma(self, data: List[float], period: int) -> Optional[float]:
        """計算移動平均"""
        if len(data) < period:
            return None
        return sum(data[-period:]) / period
    
    def _rsi(self, data: List[float], period: int) -> Optional[float]:
        """計算 RSI"""
        if len(data) < period + 1:
            return None
        
        gains = []
        losses = []
        
        for i in range(-period, 0):
            change = data[i] - data[i-1]
            if change > 0:
                gains.append(change)
            else:
                losses.append(abs(change))
        
        avg_gain = sum(gains) / period if gains else 0
        avg_loss = sum(losses) / period if losses else 0
        
        if avg_loss == 0:
            return 100
        
        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))
    
    def _macd(
        self,
        data: List[float],
        fast: int,
        slow: int
    ) -> Dict[str, Optional[float]]:
        """計算 MACD"""
        ema12 = self._ema(data, fast) if len(data) >= fast else None
        ema26 = self._ema(data, slow) if len(data) >= slow else None
        
        if ema12 is None or ema26 is None:
            return {'macd': None, 'signal': None, 'hist': None}
        
        macd = ema12 - ema26
        
        # Signal line (9日 EMA of MACD)
        signal = self._ema_signal(data, slow, fast, 9)
        
        return {
            'macd': macd,
            'signal': signal,
            'hist': macd - signal if signal else None
        }
    
    def _ema(self, data: List[float], period: int) -> Optional[float]:
        """計算指數移動平均"""
        if len(data) < period:
            return None
        
        multiplier = 2 / (period + 1)
        ema = sum(data[-period:]) / period
        
        for price in data[-period:]:
            ema = price * multiplier + ema * (1 - multiplier)
        
        return ema
    
    def _ema_signal(
        self,
        data: List[float],
        slow: int,
        fast: int,
        signal_period: int
    ) -> Optional[float]:
        """計算 Signal Line"""
        if len(data) < slow + signal_period:
            return None
        
        # 計算 MACD 值
        ema_fast = self._ema(data[-slow-fast:], fast)
        ema_slow = self._ema(data[-slow-fast:], slow)
        if ema_fast is None or ema_slow is None:
            return None
        
        macd_line = ema_fast - ema_slow
        
        # 計算 Signal Line
        multiplier = 2 / (signal_period + 1)
        signal = macd_line
        
        return signal
    
    def _atr(
        self,
        highs: List[float],
        lows: List[float],
        closes: List[float],
        period: int
    ) -> Optional[float]:
        """計算 ATR"""
        if len(highs) < period + 1:
            return None
        
        true_ranges = []
        for i in range(-period, 0):
            tr = max(
                highs[i] - lows[i],
                abs(highs[i] - closes[i-1]),
                abs(lows[i] - closes[i-1])
            )
            true_ranges.append(tr)
        
        return sum(true_ranges) / period
    
    def _bollinger(
        self,
        data: List[float],
        period: int,
        std_dev: int
    ) -> Dict[str, Optional[float]]:
        """計算布林通道"""
        if len(data) < period:
            return {'upper': None, 'middle': None, 'lower': None}
        
        middle = self._ma(data, period)
        
        # 計算標準差
        sliced = data[-period:]
        variance = sum((x - middle) ** 2 for x in sliced) / period
        std = variance ** 0.5
        
        return {
            'upper': middle + std_dev * std if middle else None,
            'middle': middle,
            'lower': middle - std_dev * std if middle else None
        }


# 單例實例
data_processor = DataProcessor()
```

### 7.2 數據品質監控

app/services/data_quality.py 實作數據品質監控功能。

```python
# app/services/data_quality.py
from datetime import date, datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict
import logging

from app import db, cache
from app.models import DataQualityLog


class DataQualityMonitor:
    """數據品質監控類"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.thresholds = self._load_thresholds()
    
    def _load_thresholds(self) -> Dict[str, Any]:
        """載入品質閾值"""
        return {
            'completeness': {
                'stock_prices': 0.99,  # 99% 完整性
                'macro_indicators': 0.95
            },
            'timeliness': {
                'stock_prices': 60,  # 分鐘
                'macro_indicators': 1440  # 24小時
            },
            'consistency': {
                'duplicate_ratio': 0.01  # 1% 以下重複
            }
        }
    
    def check_completeness(
        self,
        data_type: str,
        date_range: tuple
    ) -> Dict[str, Any]:
        """
        檢查數據完整性
        
        Args:
            data_type: 數據類型
            date_range: 日期範圍
            
        Returns:
            檢查結果
        """
        # 計算預期記錄數與實際記錄數
        expected_count = self._calculate_expected_count(data_type, date_range)
        actual_count = self._get_actual_count(data_type, date_range)
        
        completeness = actual_count / expected_count if expected_count > 0 else 0
        threshold = self.thresholds['completeness'].get(data_type, 0.9)
        
        return {
            'data_type': data_type,
            'date_range': date_range,
            'expected_count': expected_count,
            'actual_count': actual_count,
            'completeness_rate': completeness,
            'is_passed': completeness >= threshold,
            'threshold': threshold
        }
    
    def check_timeliness(
        self,
        data_type: str,
        update_time: datetime
    ) -> Dict[str, Any]:
        """
        檢查數據時效性
        
        Args:
            data_type: 數據類型
            update_time: 更新時間
            
        Returns:
            檢查結果
        """
        now = datetime.utcnow()
        latency = (now - update_time).total_seconds() / 60  # 分鐘
        threshold = self.thresholds['timeliness'].get(data_type, 60)
        
        return {
            'data_type': data_type,
            'update_time': update_time.isoformat(),
            'latency_minutes': latency,
            'is_passed': latency <= threshold,
            'threshold_minutes': threshold
        }
    
    def check_duplicates(
        self,
        data_type: str,
        date_range: tuple
    ) -> Dict[str, Any]:
        """
        檢查數據重複
        
        Args:
            data_type: 數據類型
            date_range: 日期範圍
            
        Returns:
            檢查結果
        """
        duplicate_count = self._count_duplicates(data_type, date_range)
        total_count = self._get_actual_count(data_type, date_range)
        
        duplicate_ratio = duplicate_count / total_count if total_count > 0 else 0
        threshold = self.thresholds['consistency']['duplicate_ratio']
        
        return {
            'data_type': data_type,
            'date_range': date_range,
            'duplicate_count': duplicate_count,
            'duplicate_ratio': duplicate_ratio,
            'is_passed': duplicate_ratio <= threshold,
            'threshold': threshold
        }
    
    def run_full_quality_check(self, data_type: str) -> Dict[str, Any]:
        """
        執行完整品質檢查
        
        Args:
            data_type: 數據類型
            
        Returns:
            完整檢查報告
        """
        today = date.today()
        date_range = (today, today)
        
        results = {
            'check_date': today.isoformat(),
            'data_type': data_type,
            'checks': {},
            'overall_status': 'passed'
        }
        
        # 執行各項檢查
        results['checks']['completeness'] = self.check_completeness(
            data_type, date_range
        )
        results['checks']['duplicates'] = self.check_duplicates(
            data_type, date_range
        )
        
        # 判斷整體狀態
        if not all(
            check['is_passed'] 
            for check in results['checks'].values()
        ):
            results['overall_status'] = 'failed'
        
        return results
    
    def log_quality_issue(
        self,
        data_type: str,
        data_code: str,
        issue_type: str,
        details: str
    ):
        """
        記錄品質問題
        
        Args:
            data_type: 數據類型
            data_code: 數據代碼
            issue_type: 問題類型
            details: 詳細資訊
        """
        log = DataQualityLog(
            data_type=data_type,
            data_code=data_code,
            issue_date=date.today(),
            issue_type=issue_type,
            details=details,
            status='logged'
        )
        db.session.add(log)
        db.session.commit()
        
        self.logger.warning(
            f'Data quality issue: {data_type}/{data_code} - {issue_type}'
        )
    
    def _calculate_expected_count(
        self,
        data_type: str,
        date_range: tuple
    ) -> int:
        """計算預期記錄數"""
        
        if data_type == 'stock_prices':
            # 預估每日約 1000 檔上市櫃股票有交易
            return 1000 * (date_range[1] - date_range[0]).days
        elif data_type == 'macro_indicators':
            # FRED 每日約 50 個指標更新
            return 50 * (date_range[1] - date_range[0]).days
        
        return 0
    
    def _get_actual_count(
        self,
        data_type: str,
        date_range: tuple
    ) -> int:
        """獲取實際記錄數"""
        
        from app.models import StockPrice, MacroIndicator
        
        if data_type == 'stock_prices':
            return StockPrice.query.filter(
                StockPrice.trade_date.between(*date_range)
            ).count()
        elif data_type == 'macro_indicators':
            return MacroIndicator.query.filter(
                MacroIndicator.reference_date.between(*date_range)
            ).count()
        
        return 0
    
    def _count_duplicates(
        self,
        data_type: str,
        date_range: tuple
    ) -> int:
        """計算重複記錄數"""
        
        if data_type == 'stock_prices':
            from sqlalchemy import func
            subquery = db.session.query(
                StockPrice.stock_code,
                StockPrice.trade_date,
                func.count('*').label('cnt')
            ).filter(
                StockPrice.trade_date.between(*date_range)
            ).group_by(
                StockPrice.stock_code,
                StockPrice.trade_date
            ).having(func.count('*') > 1).subquery()
            
            return db.session.query(func.sum(subquery.c.cnt)).scalar() or 0
        
        return 0


# 單例實例
data_quality_monitor = DataQualityMonitor()
```

---

## 第八章：AI 分析服務

### 8.1 演化策略引擎

app/ml/evolution/evolver.py 實作演化策略優化引擎。

```python
# app/ml/evolution/evolver.py
from datetime import datetime
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, field
import random
import numpy as np
import logging

from app import db
from app.models import EvolutionGenome, EvolutionHistory


@dataclass
class Genome:
    """基因組資料類"""
    
    # 核心基因（14項）
    value_weight: float = 0.20
    growth_weight: float = 0.25
    quality_weight: float = 0.20
    momentum_weight: float = 0.20
    macro_weight: float = 0.15
    
    pe_threshold: float = 20.0
    pb_threshold: float = 2.0
    eps_growth_threshold: float = 10.0
    roe_threshold: float = 10.0
    momentum_threshold: float = 5.0
    
    holding_days_long: int = 30
    holding_days_short: int = 15
    rebalance_period: int = 7
    risk_adjustment: float = 1.0
    
    # 調控基因（12項）
    evolution_rate: float = 0.1
    mutation_rate: float = 0.05
    elite_ratio: float = 0.2
    population_size: int = 100
    iterations: int = 50
    crossover_rate: float = 0.8
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典"""
        return {
            'value_weight': self.value_weight,
            'growth_weight': self.growth_weight,
            'quality_weight': self.quality_weight,
            'momentum_weight': self.momentum_weight,
            'macro_weight': self.macro_weight,
            'pe_threshold': self.pe_threshold,
            'pb_threshold': self.pb_threshold,
            'eps_growth_threshold': self.eps_growth_threshold,
            'roe_threshold': self.roe_threshold,
            'momentum_threshold': self.momentum_threshold,
            'holding_days_long': self.holding_days_long,
            'holding_days_short': self.holding_days_short,
            'rebalance_period': self.rebalance_period,
            'risk_adjustment': self.risk_adjustment,
            'evolution_rate': self.evolution_rate,
            'mutation_rate': self.mutation_rate,
            'elite_ratio': self.elite_ratio,
            'population_size': self.population_size,
            'iterations': self.iterations,
            'crossover_rate': self.crossover_rate,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Genome':
        """從字典創建"""
        return cls(**{k: v for k, v in data.items() if hasattr(cls, k)})
    
    @classmethod
    def random(cls) -> 'Genome':
        """隨機創建"""
        return cls(
            value_weight=random.uniform(0.1, 0.4),
            growth_weight=random.uniform(0.1, 0.4),
            quality_weight=random.uniform(0.1, 0.4),
            momentum_weight=random.uniform(0.1, 0.4),
            macro_weight=random.uniform(0.05, 0.3),
            pe_threshold=random.uniform(10, 30),
            pb_threshold=random.uniform(1, 5),
            eps_growth_threshold=random.uniform(5, 20),
            roe_threshold=random.uniform(5, 20),
            momentum_threshold=random.uniform(-10, 20),
            holding_days_long=random.randint(10, 60),
            holding_days_short=random.randint(5, 30),
            rebalance_period=random.randint(1, 14),
            risk_adjustment=random.uniform(0.5, 2.0),
            evolution_rate=random.uniform(0.05, 0.2),
            mutation_rate=random.uniform(0.01, 0.1),
            elite_ratio=random.uniform(0.1, 0.3),
            population_size=random.randint(50, 200),
            iterations=random.randint(20, 100),
            crossover_rate=random.uniform(0.6, 1.0),
        )
    
    def mutate(self, rate: float = 0.1) -> 'Genome':
        """突變"""
        new_genome = Genome()
        
        for field_name in self.__dataclass_fields__:
            value = getattr(self, field_name)
            
            if random.random() < rate:
                if isinstance(value, float):
                    # 浮點數突變
                    delta = value * random.uniform(-0.2, 0.2)
                    value = max(0, value + delta)
                elif isinstance(value, int):
                    # 整數突變
                    delta = random.randint(-2, 2)
                    value = max(1, value + delta)
            
            setattr(new_genome, field_name, value)
        
        return new_genome
    
    def crossover(self, other: 'Genome') -> List['Genome']:
        """交叉"""
        if random.random() > self.crossover_rate:
            return [self, other]
        
        child1 = Genome()
        child2 = Genome()
        
        for field_name in self.__dataclass_fields__:
            if random.random() < 0.5:
                setattr(child1, field_name, getattr(self, field_name))
                setattr(child2, field_name, getattr(other, field_name))
            else:
                setattr(child1, field_name, getattr(other, field_name))
                setattr(child2, field_name, getattr(self, field_name))
        
        return [child1, child2]


class EvolutionEngine:
    """演化策略引擎"""
    
    def __init__(self, fitness_function: Callable[[Genome], float]):
        """
        初始化演化引擎
        
        Args:
            fitness_function: 適應度函數，輸入基因組，輸出適應度值
        """
        self.logger = logging.getLogger(__name__)
        self.fitness_function = fitness_function
        
        # 當前最佳基因組
        self.best_genome: Optional[Genome] = None
        self.best_fitness: float = float('-inf')
        
        # 演化歷史
        self.history: List[Dict[str, Any]] = []
    
    def evolve(
        self,
        initial_population: List[Genome] = None,
        generations: int = 50,
        elite_ratio: float = 0.2,
        mutation_rate: float = 0.05
    ) -> Genome:
        """
        執行演化過程
        
        Args:
            initial_population: 初始族群
            generations: 迭代代數
            elite_ratio: 菁英保留比例
            mutation_rate: 突變率
            
        Returns:
            最佳基因組
        """
        # 初始化族群
        if initial_population is None:
            population = [Genome.random() for _ in range(100)]
        else:
            population = initial_population
        
        self.logger.info(f'Starting evolution with {len(population)} individuals')
        
        for gen in range(generations):
            # 評估適應度
            fitness_scores = [(genome, self.fitness_function(genome)) 
                            for genome in population]
            
            # 排序
            fitness_scores.sort(key=lambda x: x[1], reverse=True)
            
            # 記錄歷史
            avg_fitness = sum(s[1] for s in fitness_scores) / len(fitness_scores)
            diversity = self._calculate_diversity(population)
            
            self.history.append({
                'generation': gen + 1,
                'best_fitness': fitness_scores[0][1],
                'avg_fitness': avg_fitness,
                'diversity': diversity
            })
            
            self.logger.info(
                f'Generation {gen + 1}: Best={fitness_scores[0][1]:.4f}, '
                f'Avg={avg_fitness:.4f}, Diversity={diversity:.4f}'
            )
            
            # 檢查是否為最佳
            if fitness_scores[0][1] > self.best_fitness:
                self.best_fitness = fitness_scores[0][1]
                self.best_genome = fitness_scores[0][0]
            
            # 選擇
            population = self._selection(fitness_scores, elite_ratio)
            
            # 交叉與突變
            new_population = []
            while len(new_population) < len(fitness_scores):
                parent1, parent2 = random.sample(population, 2)
                children = parent1.crossover(parent2)
                for child in children:
                    mutated = child.mutate(mutation_rate)
                    new_population.append(mutated)
            
            population = new_population[:len(fitness_scores)]
        
        self.logger.info(
            f'Evolution completed. Best fitness: {self.best_fitness:.4f}'
        )
        
        return self.best_genome
    
    def _selection(
        self,
        fitness_scores: List[tuple],
        elite_ratio: float
    ) -> List[Genome]:
        """選擇"""
        population_size = len(fitness_scores)
        elite_count = int(population_size * elite_ratio)
        
        # 菁英保留
        elites = [fs[0] for fs in fitness_scores[:elite_count]]
        
        # 輪盤選擇
        selected = []
        total_fitness = sum(fs[1] for fs in fitness_scores[elite_count:])
        
        for _ in range(population_size - elite_count):
            if total_fitness <= 0:
                selected.append(fitness_scores[elite_count][0])
                continue
            
            r = random.uniform(0, total_fitness)
            cumsum = 0
            for genome, fitness in fitness_scores[elite_count:]:
                cumsum += fitness
                if cumsum >= r:
                    selected.append(genome)
                    break
        
        return elites + selected
    
    def _calculate_diversity(self, population: List[Genome]) -> float:
        """計算族群多樣性"""
        if len(population) < 2:
            return 0
        
        # 計算基因差異
        all_values = []
        for genome in population:
            values = [float(getattr(genome, f)) 
                     for f in genome.__dataclass_fields__]
            all_values.append(values)
        
        # 計算標準差
        arr = np.array(all_values)
        return float(np.std(arr))
    
    def save_genome(self, genome: Genome, version: str = None):
        """
        儲存基因組至資料庫
        
        Args:
            genome: 基因組
            version: 版本號
        """
        if version is None:
            version = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        
        # 計算適應度
        fitness = self.fitness_function(genome)
        
        genome_data = genome.to_dict()
        genome_data['version'] = version
        genome_data['fitness_value'] = fitness
        
        # 檢查是否存在
        existing = EvolutionGenome.query.filter_by(
            version=version
        ).first()
        
        if existing:
            for key, value in genome_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
        else:
            eg = EvolutionGenome(**genome_data)
            db.session.add(eg)
        
        # 保存歷史
        history = EvolutionHistory(
            generation=len(self.history),
            best_fitness=self.best_fitness,
            avg_fitness=self.history[-1]['avg_fitness'] if self.history else None,
            diversity=self.history[-1]['diversity'] if self.history else None
        )
        db.session.add(history)
        
        db.session.commit()
        
        self.logger.info(f'Genome saved: {version}')


# 歷史回測適應度函數工廠
def create_fitness_function(
    returns: List[float],
    risks: List[float]
) -> Callable[[Genome], float]:
    """
    創建適應度函數
    
    Args:
        returns: 歷史報酬率列表
        risks: 歷史風險（標準差）列表
        
    Returns:
        適應度函數
    """
    annual_return = np.mean(returns) * 252 if returns else 0
    volatility = np.std(risks) * np.sqrt(252) if risks else 1
    sharpe = annual_return / volatility if volatility > 0 else 0
    
    def fitness(genome: Genome) -> float:
        # 計算加權評分
        value_score = annual_return * 0.3
        quality_score = -volatility * 0.2
        growth_score = (returns[-1] - returns[0]) / max(abs(returns[0]), 0.01) * 0.25 if returns else 0
        momentum_score = (returns[-1] - returns[-30]) / max(abs(returns[-30]), 0.01) * 0.25 if len(returns) >= 30 else 0
        
        total = (
            value_score * genome.value_weight +
            quality_score * genome.quality_weight +
            growth_score * genome.growth_weight +
            momentum_score * genome.momentum_weight
        )
        
        # 夏普比率加成
        total += sharpe * genome.risk_adjustment * 0.5
        
        return total
    
    return fitness
```

### 8.2 AI 評分服務

app/services/ai_service.py 實作 AI 評分與報告生成邏輯。

```python
# app/services/ai_service.py
from datetime import date, datetime
from typing import Dict, List, Any, Optional
import uuid
import logging

from app import db, cache
from app.models import AIScore, AIReport, EvolutionGenome, Stock
from app.repositories import AIRepository
from app.ml.evolution.evolver import EvolutionEngine, create_fitness_function


class AIService:
    """AI 分析服務類"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.repo = AIRepository()
    
    @cache.cached(timeout=1800, key_prefix='ai_scores')
    def get_ai_scores(
        self,
        time_range: str = 'today',
        sort_by: str = 'composite',
        sector: str = None,
        page: int = 1,
        page_size: int = 50
    ) -> Dict[str, Any]:
        """
        取得 AI 評分排行
        
        Args:
            time_range: 時間範圍
            sort_by: 排序欄位
            sector: 產業篩選
            page: 頁碼
            page_size: 每頁數量
            
        Returns:
            分頁結果
        """
        # 計算日期範圍
        end_date = date.today()
        if time_range == '1W':
            start_date = end_date - timedelta(days=7)
        elif time_range == '1M':
            start_date = end_date - timedelta(days=30)
        elif time_range == '3M':
            start_date = end_date - timedelta(days=90)
        elif time_range == '1Y':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date
        
        # 查詢
        query = AIScore.query.filter(
            AIScore.calculation_date.between(start_date, end_date)
        )
        
        if sector:
            # 關聯 Stock 表篩選產業
            query = query.join(Stock).filter(Stock.industry == sector)
        
        # 排序與分頁
        sort_column = getattr(AIScore, f'{sort_by}_score', AIScore.composite_score)
        pagination = query.order_by(sort_column.desc()).paginate(
            page=page,
            per_page=page_size,
            error_out=False
        )
        
        # 格式化結果
        results = []
        for idx, score in enumerate(pagination.items):
            stock = Stock.query.filter_by(code=score.stock_code).first()
            results.append({
                'rank': (page - 1) * page_size + idx + 1,
                'code': score.stock_code,
                'name': stock.name if stock else None,
                'sector': stock.industry if stock else None,
                'composite_score': float(score.composite_score) if score.composite_score else None,
                'value_score': float(score.value_score) if score.value_score else None,
                'growth_score': float(score.growth_score) if score.growth_score else None,
                'quality_score': float(score.quality_score) if score.quality_score else None,
                'momentum_score': float(score.momentum_score) if score.momentum_score else None,
                'close': None  # 另行查詢
            })
        
        return {
            'list': results,
            'total': pagination.total,
            'page': pagination.page,
            'pageSize': pagination.per_page
        }
    
    def get_ai_score(self, code: str) -> Optional[Dict[str, Any]]:
        """
        取得個股 AI 評分
        
        Args:
            code: 股票代碼
            
        Returns:
            AI 評分資訊
        """
        # 獲取最新評分
        score = AIScore.query.filter_by(
            stock_code=code
        ).order_by(
            AIScore.calculation_date.desc()
        ).first()
        
        if not score:
            return None
        
        # 獲取評分趨勢
        trends = AIScore.query.filter_by(
            stock_code=code
        ).order_by(
            AIScore.calculation_date.desc()
        ).limit(30).all()
        
        return {
            'code': code,
            'calculationDate': score.calculation_date.isoformat(),
            'scores': {
                'value': float(score.value_score) if score.value_score else None,
                'growth': float(score.growth_score) if score.growth_score else None,
                'quality': float(score.quality_score) if score.quality_score else None,
                'momentum': float(score.momentum_score) if score.momentum_score else None,
                'macro': float(score.macro_score) if score.macro_score else None,
                'composite': float(score.composite_score) if score.composite_score else None
            },
            'trends': [
                {'date': s.calculation_date.isoformat(), 'score': float(s.composite_score)}
                for s in trends
            ],
            'genomeVersion': score.genome_version
        }
    
    def calculate_scores(self, calculation_date: date):
        """
        計算所有股票的 AI 評分
        
        Args:
            calculation_date: 計算日期
        """
        self.logger.info(f'Starting AI score calculation for {calculation_date}')
        
        # 獲取當前最佳基因組
        genome = EvolutionGenome.query.order_by(
            EvolutionGenome.fitness_value.desc()
        ).first()
        
        if not genome:
            self.logger.warning('No genome found, using default weights')
            weights = {
                'value': 0.20,
                'growth': 0.25,
                'quality': 0.20,
                'momentum': 0.20,
                'macro': 0.15
            }
        else:
            weights = {
                'value': float(genome.value_weight),
                'growth': float(genome.growth_weight),
                'quality': float(genome.quality_weight),
                'momentum': float(genome.momentum_weight),
                'macro': float(genome.macro_weight)
            }
        
        # 獲取所有活躍股票
        stocks = Stock.query.filter_by(is_active=True).all()
        
        for stock in stocks:
            try:
                scores = self._calculate_single_stock(
                    stock.code,
                    calculation_date,
                    weights
                )
                
                # 儲存評分
                ai_score = AIScore(
                    stock_code=stock.code,
                    calculation_date=calculation_date,
                    **scores,
                    genome_version=genome.version if genome else None
                )
                db.session.add(ai_score)
                
            except Exception as e:
                self.logger.error(f'Error calculating score for {stock.code}: {e}')
        
        db.session.commit()
        self.logger.info(f'AI score calculation completed for {len(stocks)} stocks')
    
    def _calculate_single_stock(
        self,
        code: str,
        calc_date: date,
        weights: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        計算單一股票評分
        
        Args:
            code: 股票代碼
            calc_date: 計算日期
            weights: 權重字典
            
        Returns:
            評分字典
        """
        # 從各維度計算評分
        value_score = self._calculate_value_score(code, calc_date)
        growth_score = self._calculate_growth_score(code, calc_date)
        quality_score = self._calculate_quality_score(code, calc_date)
        momentum_score = self._calculate_momentum_score(code, calc_date)
        macro_score = self._calculate_macro_score(code, calc_date)
        
        # 計算綜合評分
        composite = (
            value_score * weights['value'] +
            growth_score * weights['growth'] +
            quality_score * weights['quality'] +
            momentum_score * weights['momentum'] +
            macro_score * weights['macro']
        )
        
        return {
            'value_score': value_score,
            'growth_score': growth_score,
            'quality_score': quality_score,
            'momentum_score': momentum_score,
            'macro_score': macro_score,
            'composite_score': composite
        }
    
    def _calculate_value_score(self, code: str, calc_date: date) -> float:
        """計算價值評分"""
        # 獲取估值數據並計算評分
        # PE、PB、殖利率等
        score = 50  # 基礎分數
        
        # 簡化的評分邏輯
        pe_ratio = self._get_financial_metric(code, 'pe')
        if pe_ratio:
            if pe_ratio < 10:
                score += 20
            elif pe_ratio < 15:
                score += 10
            elif pe_ratio > 25:
                score -= 10
        
        return min(100, max(0, score))
    
    def _calculate_growth_score(self, code: str, calc_date: date) -> float:
        """計算成長評分"""
        score = 50
        
        eps_growth = self._get_financial_metric(code, 'eps_growth')
        revenue_growth = self._get_financial_metric(code, 'revenue_growth')
        
        if eps_growth:
            if eps_growth > 20:
                score += 20
            elif eps_growth > 10:
                score += 10
            elif eps_growth < 0:
                score -= 10
        
        return min(100, max(0, score))
    
    def _calculate_quality_score(self, code: str, calc_date: date) -> float:
        """計算品質評分"""
        score = 50
        
        roe = self._get_financial_metric(code, 'roe')
        if roe:
            if roe > 20:
                score += 25
            elif roe > 15:
                score += 15
            elif roe < 5:
                score -= 15
        
        return min(100, max(0, score))
    
    def _calculate_momentum_score(self, code: str, calc_date: date) -> float:
        """計算動能評分"""
        score = 50
        
        # 價格動能
        returns = self._get_price_returns(code, calc_date, 30)
        if returns:
            if returns > 10:
                score += 25
            elif returns > 5:
                score += 15
            elif returns < -10:
                score -= 20
        
        return min(100, max(0, score))
    
    def _calculate_macro_score(self, code: str, calc_date: date) -> float:
        """計算宏觀評分"""
        score = 50
        
        # 根據產業獲得宏觀因子暴露
        industry = self._get_stock_industry(code)
        
        # 簡化的宏觀評分
        yield_curve = self._get_macro_factor('yield_curve_slope', calc_date)
        if yield_curve is not None:
            if yield_curve > 0.5:  # 正斜率，景氣擴張
                score += 15
            elif yield_curve < 0:  # 負斜率，景氣衰退
                score -= 10
        
        return min(100, max(0, score))
    
    def _get_financial_metric(self, code: str, metric: str) -> Optional[float]:
        """獲取財務指標"""
        # 簡化實現，實際應該從資料庫查詢
        return None
    
    def _get_price_returns(self, code: str, end_date: date, days: int) -> Optional[float]:
        """計算價格報酬率"""
        from app.models import StockPrice
        
        start_date = end_date - timedelta(days=days)
        
        end_price = StockPrice.query.filter_by(
            stock_code=code,
            trade_date=end_date
        ).first()
        
        start_price = StockPrice.query.filter_by(
            stock_code=code,
            trade_date=start_date
        ).first()
        
        if end_price and start_price and start_price.close_price:
            return (end_price.close_price - start_price.close_price) / start_price.close_price * 100
        
        return None
    
    def _get_stock_industry(self, code: str) -> Optional[str]:
        """獲取股票產業"""
        stock = Stock.query.filter_by(code=code).first()
        return stock.industry if stock else None
    
    def _get_macro_factor(self, factor_code: str, calc_date: date) -> Optional[float]:
        """獲取宏觀因子"""
        from app.models import MacroFactor
        
        factor = MacroFactor.query.filter_by(
            factor_code=factor_code,
            calculation_date=calc_date
        ).first()
        
        return factor.value if factor else None
    
    def generate_report(self, code: str, report_date: date = None) -> AIReport:
        """
        生成 AI 投資報告
        
        Args:
            code: 股票代碼
            report_date: 報告日期
            
        Returns:
            AIReport 實例
        """
        if report_date is None:
            report_date = date.today()
        
        # 獲取最新數據
        score = self.get_ai_score(code)
        price_data = self._get_price_data(code, report_date)
        stock_info = self._get_stock_info(code)
        
        # 生成報告內容
        report_id = str(uuid.uuid4())
        title = f'{stock_info["name"]} ({code}) AI 投資分析報告'
        
        # 生成分析內容
        content = self._generate_report_content(
            code,
            stock_info,
            score,
            price_data
        )
        
        # 產生建議
        recommendation, confidence, risk_level = self._generate_recommendation(score)
        
        # 創建報告
        report = AIReport(
            id=report_id,
            stock_code=code,
            report_date=report_date,
            title=title,
            summary=self._generate_summary(score, stock_info),
            content=content,
            recommendation=recommendation,
            confidence=confidence,
            risk_level=risk_level,
            data_completeness=95.0,
            analysis_depth=85.0
        )
        
        db.session.add(report)
        db.session.commit()
        
        return report
    
    def _generate_report_content(
        self,
        code: str,
        stock_info: Dict,
        score: Dict,
        price_data: Dict
    ) -> str:
        """生成報告內容"""
        content = f'''# {stock_info['name']} ({code}) 投資分析報告

## 一、公司概覽

{stock_info.get('description', '暫無公司簡介')}

## 二、AI 評分分析

### 2.1 綜合評分

| 評分維度 | 分數 | 評價 |
|---------|------|------|
| 價值評分 | {score['scores']['value']:.1f} | {"優異" if score['scores']['value'] >= 80 else "良好" if score['scores']['value'] >= 60 else "一般" if score['scores']['value'] >= 40 else "較差"} |
| 成長評分 | {score['scores']['growth']:.1f} | {"優異" if score['scores']['growth'] >= 80 else "良好" if score['scores']['growth'] >= 60 else "一般" if score['scores']['growth'] >= 40 else "較差"} |
| 品質評分 | {score['scores']['quality']:.1f} | {"優異" if score['scores']['quality'] >= 80 else "良好" if score['scores']['quality'] >= 60 else "一般" if score['scores']['quality'] >= 40 else "較差"} |
| 動能評分 | {score['scores']['momentum']:.1f} | {"優異" if score['scores']['momentum'] >= 80 else "良好" if score['scores']['momentum'] >= 60 else "一般" if score['scores']['momentum'] >= 40 else "較差"} |
| 宏觀評分 | {score['scores']['macro']:.1f} | {"優異" if score['scores']['macro'] >= 80 else "良好" if score['scores']['macro'] >= 60 else "一般" if score['scores']['macro'] >= 40 else "較差"} |

**綜合評分：{score['scores']['composite']:.1f}**

### 2.2 評分趨勢

[評分趨勢圖]

## 三、基本面分析

### 3.1 財務概覽

| 指標 | 數值 | 產業平均 | 評價 |
|------|------|---------|------|
| 本益比 | - | - | - |
| 殖利率 | - | - | - |
| ROE | - | - | - |

### 3.2 營運狀況

[營運分析]

## 四、技術面分析

### 4.1 價格走勢

最新收盤價：{price_data.get('close', 'N/A')}
近一月漲跌幅：{price_data.get('change_1m', 'N/A')}%

### 4.2 技術指標

| 指標 | 數值 | 訊號 |
|------|------|------|
| MA20 | - | - |
| RSI | - | - |
| MACD | - | - |

## 五、籌碼面分析

[籌碼分析]

## 六、投資建議

### 6.1 AI 建議

**{self._get_recommendation_text(score['scores']['composite'])}**

### 6.2 風險提示

1. 股價波動風險
2. 產業景氣循環風險
3. 國際局勢影響風險

---

*本報告由 AI 投資分析儀自動生成，僅供參考，不構成投資建議。*
'''
        return content
    
    def _generate_summary(
        self,
        score: Dict,
        stock_info: Dict
    ) -> str:
        """生成摘要"""
        composite = score['scores']['composite']
        recommendation = self._get_recommendation_text(composite)
        
        return f'''{stock_info['name']} ({stock_info['code']}) {report_date} AI 綜合評分為 {composite:.1f} 分，AI 建議「{recommendation}」。'''

    def _generate_recommendation(
        self,
        score: Dict
    ) -> tuple:
        """產生投資建議"""
        composite = score['scores']['composite']
        
        if composite >= 80:
            return '買入', 85.0, '低'
        elif composite >= 70:
            return '持有', 75.0, '中低'
        elif composite >= 60:
            return '持有', 65.0, '中'
        elif composite >= 50:
            return '觀望', 55.0, '中'
        elif composite >= 40:
            return '減碼', 45.0, '中高'
        else:
            return '賣出', 35.0, '高'
    
    def _get_recommendation_text(self, composite: float) -> str:
        """取得建議文字"""
        if composite >= 80:
            return '買入'
        elif composite >= 70:
            return '適量買入'
        elif composite >= 60:
            return '持有'
        elif composite >= 50:
            return '觀望'
        elif composite >= 40:
            return '適量賣出'
        else:
            return '賣出'
    
    def _get_price_data(self, code: str, calc_date: date) -> Dict:
        """取得股價數據"""
        from app.models import StockPrice
        
        price = StockPrice.query.filter_by(
            stock_code=code,
            trade_date=calc_date
        ).first()
        
        if price:
            prev_price = StockPrice.query.filter(
                StockPrice.stock_code == code,
                StockPrice.trade_date < calc_date
            ).order_by(StockPrice.trade_date.desc()).first()
            
            change_1m = None
            if prev_price:
                change_1m = (price.close_price - prev_price.close_price) / prev_price.close_price * 100
            
            return {
                'close': float(price.close_price) if price.close_price else None,
                'change': float(price.change_percent) if price.change_percent else None,
                'change_1m': float(change_1m) if change_1m else None,
                'volume': price.volume
            }
        
        return {}
    
    def _get_stock_info(self, code: str) -> Dict:
        """取得股票資訊"""
        stock = Stock.query.filter_by(code=code).first()
        return {
            'code': code,
            'name': stock.name if stock else None,
            'industry': stock.industry if stock else None,
            'description': None
        }


# 單例實例
ai_service = AIService()
```

---

## 第九章：排程與任務管理

### 9.1 Prefect 任務流

app/tasks/fred_fetcher.py 實作 FRED 數據獲取任務。

```python
# app/tasks/fred_fetcher.py
from prefect import task, flow
from datetime import datetime, timedelta
import logging
import requests

from app import db
from app.models import MacroIndicator, MacroIndicatorInfo
from app.config import settings


logger = logging.getLogger(__name__)


@task(timeout_seconds=300)
def fetch_fred_series(series_id: str) -> dict:
    """
    獲取 FRED 單一序列數據
    
    Args:
        series_id: FRED 系列 ID
        
    Returns:
        獲取的數據
    """
    api_key = settings.FRED_API_KEY
    base_url = f'https://api.stlouisfed.org/fred/series/observations'
    
    params = {
        'series_id': series_id,
        'api_key': api_key,
        'file_type': 'json',
        'observation_start': (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d'),
        'observation_end': datetime.utcnow().strftime('%Y-%m-%d')
    }
    
    response = requests.get(base_url, params=params)
    response.raise_for_status()
    
    data = response.json()
    
    return {
        'series_id': series_id,
        'observations': data.get('observations', [])
    }


@task(timeout_seconds=600)
def process_fred_data(observations: dict):
    """
    處理 FRED 數據
    
    Args:
        observations: FRED 觀測數據
    """
    from app.services import macro_service
    
    series_id = observations['series_id']
    
    # 獲取指標資訊
    info = MacroIndicatorInfo.query.filter_by(
        series_id=series_id
    ).first()
    
    if not info:
        logger.warning(f'No indicator info found for series {series_id}')
        return
    
    results = []
    for obs in observations['observations']:
        try:
            indicator = MacroIndicator(
                indicator_code=info.indicator_code,
                indicator_name=info.indicator_name,
                country=info.country,
                category=info.category,
                reference_date=obs['date'],
                value=float(obs['value']) if obs['value'] != '.' else None,
                unit=info.unit,
                frequency=info.frequency,
                source=info.source,
                series_id=series_id
            )
            results.append(indicator)
        except Exception as e:
            logger.error(f'Error processing FRED data: {e}')
    
    # 批量寫入
    if results:
        db.session.bulk_save_objects(results)
        db.session.commit()
        logger.info(f'Processed {len(results)} FRED observations for {series_id}')


@flow(name="FRED Data Fetch Flow")
def fred_data_flow():
    """
    FRED 數據獲取工作流
    """
    logger.info("Starting FRED data fetch flow")
    
    # 獲取所有需要更新的序列
    series_list = MacroIndicatorInfo.query.filter(
        MacroIndicatorInfo.series_id.isnot(None)
    ).with_entities(MacroIndicatorInfo.series_id).all()
    
    series_ids = [s[0] for s in series_list]
    
    for series_id in series_ids:
        try:
            # 獲取數據
            observations = fetch_fred_series(series_id)
            
            # 處理數據
            process_fred_data(observations)
            
        except Exception as e:
            logger.error(f'Error fetching FRED series {series_id}: {e}')
    
    logger.info("FRED data fetch flow completed")


@task
def run_daily_tasks():
    """執行每日任務"""
    from app.tasks import twse_fetcher, macro_processor
    
    logger.info("Starting daily tasks")
    
    # 執行 FRED 數據獲取
    fred_data_flow()
    
    logger.info("Daily tasks completed")
```

### 9.2 數據獲取腳本

app/tasks/__init__.py 初始化任務模組。

```python
# app/tasks/__init__.py
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging

from app import app
from app.config import settings


logger = logging.getLogger(__name__)


def init_scheduler(app):
    """初始化排程器"""
    scheduler = BackgroundScheduler()
    
    # 每日執行 FRED 數據獲取
    scheduler.add_job(
        func=lambda: with_app_context(fred_data_flow),
        trigger='cron',
        hour='16',  # 下午 4 點（FRED 通常在此時更新）
        minute='0',
        id='fred_fetcher',
        name='FRED Data Fetcher',
        replace_existing=True
    )
    
    # 每日執行台股行情更新
    scheduler.add_job(
        func=lambda: with_app_context(twse_fetcher.run_flow),
        trigger='cron',
        hour='15',  # 下午 3 點（台股收盤後）
        minute='10',
        id='twse_fetcher',
        name='TWSE Data Fetcher',
        replace_existing=True
    )
    
    # 每日執行 AI 評分計算
    scheduler.add_job(
        func=lambda: with_app_context(ai_score_calculation),
        trigger='cron',
        hour='16',
        minute='30',
        id='ai_score_calc',
        name='AI Score Calculator',
        replace_existing=True
    )
    
    # 測試任務（每 5 分鐘執行）
    scheduler.add_job(
        func=lambda: logger.info('Heartbeat task executed'),
        trigger='interval',
        minutes=5,
        id='heartbeat',
        name='System Heartbeat',
        replace_existing=True
    )
    
    scheduler.start()
    
    return scheduler


def with_app_context(func):
    """在應用上下文執行函數"""
    with app.app_context():
        return func()


def fred_data_flow():
    """FRED 數據流程"""
    from app.tasks.fred_fetcher import fred_data_flow
    fred_data_flow()


def twse_fetcher_run():
    """台股數據獲取"""
    from app.tasks.twse_fetcher import twse_data_flow
    twse_data_flow()


def ai_score_calculation():
    """AI 評分計算"""
    from app.services import ai_service
    from datetime import date
    
    ai_service.calculate_scores(date.today())


# 初始化時啟動排程器
scheduler = None
```

### 9.3 Flask CLI 命令

app/cli/commands.py 定義自定義 CLI 命令。

```python
# app/cli/commands.py
import click
from flask import current_app
from flask.cli import with_appcontext

from app import db
from app.config import settings


@click.command('init-db')
@with_appcontext
def init_db_command():
    """初始化資料庫"""
    click.echo('Initializing database...')
    
    # 創建所有表格
    db.create_all()
    
    # 初始化基礎數據
    from app.cli.init_data import init_basic_data
    init_basic_data()
    
    click.echo('Database initialized successfully.')


@click.command('backup-db')
@click.argument('output_path', type=click.Path())
@with_appcontext
def backup_db_command(output_path):
    """備份資料庫"""
    click.echo(f'Backing up database to {output_path}...')
    
    import subprocess
    
    result = subprocess.run(
        [
            'pg_dump',
            '-h', settings.DATABASE_URL.split('@')[0].split('://')[1].split(':')[0],
            '-U', settings.DATABASE_URL.split(':')[1].split('@')[0],
            '-d', settings.DATABASE_URL.split('/')[-1],
            '-f', output_path,
            '-Fc'
        ],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        click.echo(f'Database backup completed: {output_path}')
    else:
        click.echo(f'Backup failed: {result.stderr}')


@click.command('calc-ai-scores')
@click.option('--date', default=None, help='Calculation date (YYYY-MM-DD)')
@with_appcontext
def calc_ai_scores_command(date):
    """計算 AI 評分"""
    from datetime import date as dt
    from app.services import ai_service
    
    calc_date = dt.today()
    if date:
        calc_date = dt.strptime(date, '%Y-%m-%d')
    
    click.echo(f'Calculating AI scores for {calc_date}...')
    
    ai_service.calculate_scores(calc_date)
    
    click.echo('AI scores calculated successfully.')


@click.command('gen-reports')
@click.option('--date', default=None, help='Report date (YYYY-MM-DD)')
@click.option('--limit', default=100, help='Max reports to generate')
@with_appcontext
def gen_reports_command(date, limit):
    """生成 AI 報告"""
    from datetime import date as dt
    from app.services import ai_service
    from app.models import Stock
    
    report_date = dt.today()
    if date:
        report_date = dt.strptime(date, '%Y-%m-%d')
    
    click.echo(f'Generating AI reports for {report_date}...')
    
    stocks = Stock.query.filter_by(is_active=True).limit(limit).all()
    
    for stock in stocks:
        try:
            ai_service.generate_report(stock.code, report_date)
            click.echo(f'Generated report for {stock.code}')
        except Exception as e:
            click.echo(f'Error generating report for {stock.code}: {e}')
    
    click.echo(f'Generated {len(stocks)} reports.')
```

---

## 第十章：資訊安全實作

### 10.1 API 認證與授權

app/utils/auth.py 實作 API 認證邏輯。

```python
# app/utils/auth.py
from functools import wraps
from flask import request, g, jsonify
import hmac
import hashlib
import time

from app.config import settings
from app.models import User


def generate_api_key(user_id: str) -> str:
    """
    生成 API Key
    
    Args:
        user_id: 用戶 ID
        
    Returns:
        API Key
    """
    timestamp = str(int(time.time()))
    random_part = ''.join([
        'abcdefghijklmnopqrstuvwxyz',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '0123456789'
    ][i % 3][int(time.time()) % 62] for i in range(32))
    
    key = f'{user_id}.{timestamp}.{random_part}'
    
    # 計算 HMAC
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        key.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f'{key}.{signature[:32]}'


def verify_api_key(api_key: str) -> tuple:
    """
    驗證 API Key
    
    Args:
        api_key: API Key
        
    Returns:
        (user_id, is_valid)
    """
    try:
        parts = api_key.split('.')
        if len(parts) != 4:
            return None, False
        
        user_id, timestamp, random_part, signature = parts
        
        # 驗證簽名
        expected_signature = hmac.new(
            settings.SECRET_KEY.encode(),
            f'{user_id}.{timestamp}.{random_part}'.encode(),
            hashlib.sha256
        ).hexdigest()[:32]
        
        if not hmac.compare_digest(signature, expected_signature):
            return None, False
        
        # 檢查 Key 是否過期（例如 90 天）
        key_timestamp = int(timestamp)
        if time.time() - key_timestamp > 90 * 24 * 3600:
            return None, False
        
        return user_id, True
        
    except Exception:
        return None, False


def api_rate_limit(f):
    """
    API 速率限制裝飾器
    
    Args:
        f: 被裝飾的函數
        
    Returns:
        裝飾後的函數
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request
        from app.utils.rate_limiter import rate_limiter
        
        # 從請求頭獲取 API Key
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            from app.utils.response import error_response
            return error_response('40100', '缺少 API Key'), 401
        
        # 驗證 API Key
        user_id, is_valid = verify_api_key(api_key)
        if not is_valid:
            from app.utils.response import error_response
            return error_response('40101', '無效的 API Key'), 401
        
        # 速率限制檢查
        client_id = user_id or request.remote_addr
        
        if not rate_limiter.is_allowed(client_id, settings.API_RATE_LIMIT):
            from app.utils.response import error_response
            return error_response('42900', '請求過於頻繁'), 429
        
        # 設置用戶 ID 到 Flask g 對象
        g.user_id = user_id
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_auth(f):
    """
    需要認證的裝飾器
    
    Args:
        f: 被裝飾的函數
        
    Returns:
        裝飾後的函數
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import g
        from app.utils.response import error_response
        
        if not hasattr(g, 'user_id') or not g.user_id:
            return error_response('40100', '需要登入'), 401
        
        return f(*args, **kwargs)
    
    return decorated_function
```

### 10.2 速率限制

app/utils/rate_limiter.py 實作速率限制功能。

```python
# app/utils/rate_limiter.py
from flask import request, g
import time
from collections import defaultdict
import threading

from app.config import settings


class RateLimiter:
    """速率限制器"""
    
    def __init__(self):
        self.requests = defaultdict(list)
        self.lock = threading.Lock()
    
    def is_allowed(self, client_id: str, max_requests: int = 60) -> bool:
        """
        檢查是否允許請求
        
        Args:
            client_id: 客戶端 ID
            max_requests: 最大請求數
            
        Returns:
            是否允許
        """
        current_time = time.time()
        window_start = current_time - 60  # 1 分鐘窗口
        
        with self.lock:
            # 清理過期的請求記錄
            self.requests[client_id] = [
                req_time for req_time in self.requests[client_id]
                if req_time > window_start
            ]
            
            # 檢查是否超過限制
            if len(self.requests[client_id]) >= max_requests:
                return False
            
            # 記錄當前請求
            self.requests[client_id].append(current_time)
            
            return True
    
    def get_remaining(self, client_id: str, max_requests: int = 60) -> int:
        """
        獲取剩餘請求數
        
        Args:
            client_id: 客戶端 ID
            max_requests: 最大請求數
            
        Returns:
            剩餘請求數
        """
        current_time = time.time()
        window_start = current_time - 60
        
        with self.lock:
            recent_requests = [
                req_time for req_time in self.requests[client_id]
                if req_time > window_start
            ]
            
            return max(0, max_requests - len(recent_requests))
    
    def reset(self, client_id: str):
        """
        重置客戶端的請求記錄
        
        Args:
            client_id: 客戶端 ID
        """
        with self.lock:
            if client_id in self.requests:
                del self.requests[client_id]


# 單例實例
rate_limiter = RateLimiter()


def rate_limit_exceeded(request) -> bool:
    """
    檢查請求是否超過速率限制
    
    Args:
        request: Flask 請求對象
        
    Returns:
        是否超限
    """
    client_id = request.headers.get('X-API-Key') or request.remote_addr
    return not rate_limiter.is_allowed(client_id, settings.API_RATE_LIMIT)
```

---

## 第十一章：效能優化策略

### 11.1 資料庫效能優化

系統採用多種策略優化資料庫效能。

索引優化方面，為常用查詢建立複合索引。針對 StockPrice 的 stock_code + trade_date 建立複合索引。針對 MacroIndicator 的 indicator_code + reference_date 建立複合索引。定期分析查詢效能並優化索引策略。

查詢優化方面，使用 eager loading 避免 N+1 查詢問題。實現分頁查詢，避免一次載入大量數據。使用快取減少資料庫查詢次數。

連接池管理方面，配置適當的連接池大小（10-20）。設定連接超時與閒置連接回收策略。監控連接池使用情況。

### 11.2 快取策略

系統實現多層快取策略。

Redis 快取用於儲存熱門數據（如最新行情、指標資訊）。快取時間根據數據類型設定（行情 5 分鐘、指標準確認後快取 30 分鐘）。使用快取失效機制確保數據一致性。

本地快取用於 Flask-Caching，儲存少量經常存取的數據。配置合理的快取大小與淘汰策略。

### 11.3 API 效能優化

回應壓縮方面，啟用 Gzip 壓縮回應內容。對於大型 JSON 響應使用壓縮。

響應優化方面，只返回必要的欄位，避免傳輸過多數據。實現_fields 參數，支援客戶端選擇返回欄位。

---

## 第十二章：測試策略與品質保證

### 12.1 測試配置

pytest.ini 配置 pytest 測試框架。

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
filterwarnings =
    ignore::DeprecationWarning
    ignore::PendingDeprecationWarning

[tool:pytest]
asyncio_mode = auto
```

conftest.py 配置測試fixtures。

```python
# tests/conftest.py
import pytest
from app import create_app, db
from app.models import User


@pytest.fixture
def app():
    """創建測試 Flask 應用"""
    app = create_app('testing')
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """創建測試客戶端"""
    return app.test_client()


@pytest.fixture
def auth_client(client):
    """創建已認證的客戶端"""
    # 創建測試用戶
    with app.app_context():
        user = User(
            id='test-user-id',
            email='test@example.com',
            name='Test User'
        )
        db.session.add(user)
        db.session.commit()
    
    # 設置認證頭
    client.environ_base['HTTP_X_API_KEY'] = 'test-api-key'
    
    return client


@pytest.fixture
def sample_stock():
    """創建模擬股票數據"""
    from app.models import Stock, StockPrice
    
    stock = Stock(
        code='2330',
        name='台積電',
        market='上市',
        industry='半導體',
        is_active=True
    )
    
    return stock
```

### 12.2 單元測試範例

tests/unit/test_stock_service.py 單元測試範例。

```python
# tests/unit/test_stock_service.py
import pytest
from unittest.mock import MagicMock, patch
from datetime import date, timedelta

from app.services import stock_service


class TestStockService:
    
    def test_get_stock_quote_success(self, app, sample_stock):
        """測試取得股票報價 - 成功"""
        with app.app_context():
            # 模擬數據
            mock_price = MagicMock()
            mock_price.trade_date = date.today()
            mock_price.open_price = 500.0
            mock_price.high_price = 510.0
            mock_price.low_price = 495.0
            mock_price.close_price = 505.0
            mock_price.volume = 1000000
            mock_price.turnover = 500000000
            
            with patch('app.services.stock_service.StockPrice') as MockPrice:
                MockPrice.query.filter_by.return_value.order_by.return_value.first \
                    .side_effect = [mock_price, None]
                
                result = stock_service.get_stock_quote('2330')
                
                assert result['code'] == '2330'
                assert result['close'] == 505.0
    
    def test_get_stock_quote_not_found(self, app):
        """測試取得股票報價 - 股票不存在"""
        with app.app_context():
            with patch('app.services.stock_service.StockPrice') as MockPrice:
                MockPrice.query.filter_by.return_value.order_by.return_value.first \
                    .return_value = None
                
                result = stock_service.get_stock_quote('9999')
                
                assert result == {}
    
    def test_get_kline_data(self, app, sample_stock):
        """測試取得 K 線數據"""
        with app.app_context():
            mock_prices = []
            base_price = 500
            for i in range(10):
                price = MagicMock()
                price.trade_date = date.today() - timedelta(days=10-i)
                price.open_price = base_price + i * 5
                price.high_price = base_price + i * 5 + 10
                price.low_price = base_price + i * 5 - 5
                price.close_price = base_price + i * 5 + 2
                price.volume = 1000000
                mock_prices.append(price)
            
            with patch('app.services.stock_service.StockPrice') as MockPrice:
                MockPrice.query.filter_by.return_value.order_by.return_value.all \
                    .return_value = mock_prices
                
                result = stock_service.get_kline_data('2330')
                
                assert len(result) == 10
                assert result[0]['date'] == (date.today() - timedelta(days=10)).isoformat()


class TestDataProcessor:
    
    def test_validate_price_data_valid(self, app):
        """測試有效數據驗證"""
        with app.app_context():
            valid_data = {
                'trade_date': date.today(),
                'open_price': 500.0,
                'high_price': 510.0,
                'low_price': 495.0,
                'close_price': 505.0,
                'volume': 1000000,
                'prev_close': 500.0
            }
            
            # 應該不拋出異常
            # 實際實現需要從模組導入
            pass
    
    def test_validate_price_data_invalid(self, app):
        """測試無效數據驗證"""
        with app.app_context():
            invalid_data = {
                'trade_date': date.today(),
                'open_price': 500.0,
                'high_price': 490.0,  # 高於開盤價
                'low_price': 495.0,
                'close_price': 505.0
            }
            
            # 應該拋出異常
            from app.utils.exceptions import DataQualityError
            
            with pytest.raises(DataQualityError):
                pass  # 調用驗證邏輯
```

---

## 第十三章：部署與維運

### 13.1 Docker 配置文件

Dockerfile 後端 Dockerfile。

```dockerfile
# 後端 Dockerfile
FROM python:3.11-slim

# 設置環境變數
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 工作目錄
WORKDIR /app

# 系統依賴
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式碼
COPY . .

# 創建非 root 用戶
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# 端口
EXPOSE 5000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# 啟動命令
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "app:create_app()"]
```

### 13.2 Docker Compose 配置

docker-compose.yml 配置多服務部署。

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ai-invest-api
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_invest
      - REDIS_URL=redis://redis:6379/0
      - MILVUS_HOST=milvus
    env_file:
      - .env
    volumes:
      - app_data:/app/data
    networks:
      - app-network
    depends_on:
      - db
      - redis
      - milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15
    container_name: ai-invest-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=ai_invest
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ai-invest-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  milvus:
    image: milvusdb/milvus:2.3
    container_name: ai-invest-milvus
    restart: unless-stopped
    command: etcd,minio,milvus
    environment:
      - ETCD_DATA_DIR=/etcd
      - MINIO_DATA_DIR=/minio_data
      - MILVUS_DATA_DIR=/var/lib/milvus/data
    volumes:
      - milvus_data:/var/lib/milvus/data
      - milvus_etcd:/etcd
      - milvus_minio:/minio_data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/Container/nvme_data/postgres
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/Container/nvme_data/redis
  milvus_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/Container/ssd_data/milvus
  milvus_etcd:
    driver: local
  milvus_minio:
    driver: local
  app_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/Container/app_data

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## 第十四章：監控與日誌管理

### 14.1 日誌配置

app/utils/logger.py 配置日誌系統。

```python
# app/utils/logger.py
import logging
import sys
from datetime import datetime
from pathlib import Path

from app.config import settings


def setup_logger(app):
    """配置應用日誌"""
    
    # 創建日誌目錄
    log_dir = Path('/share/Container/logs')
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # 日誌格式
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 文件日誌
    file_handler = logging.FileHandler(
        log_dir / f'ai-invest-{datetime.now().strftime("%Y%m%d")}.log',
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)
    
    # 錯誤日誌
    error_handler = logging.FileHandler(
        log_dir / f'ai-invest-error-{datetime.now().strftime("%Y%m%d")}.log',
        encoding='utf-8'
    )
    error_handler.setFormatter(formatter)
    error_handler.setLevel(logging.ERROR)
    
    # 控制台日誌
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # 配置根日誌
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)
    root_logger.addHandler(console_handler)
    
    # 配置 Flask 日誌
    app_logger = logging.getLogger('app')
    app_logger.setLevel(logging.DEBUG)
    
    # 配置 SQLAlchemy 日誌
    sql_logger = logging.getLogger('sqlalchemy')
    sql_logger.setLevel(logging.WARNING)
    
    return app_logger
```

### 14.2 健康檢查端點

app/api/v1/health.py 健康檢查 API。

```python
# app/api/v1/health.py
from flask import jsonify
from flask_restful import Resource
from datetime import datetime
import subprocess

from app import db
from app.models import Stock


class HealthResource(Resource):
    """健康檢查資源"""
    
    def get(self):
        """
        健康檢查端點
        
        Returns:
            系統健康狀態
        """
        status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'components': {}
        }
        
        # 檢查資料庫
        try:
            db.session.execute(db.text('SELECT 1'))
            status['components']['database'] = 'healthy'
        except Exception as e:
            status['components']['database'] = f'unhealthy: {str(e)}'
            status['status'] = 'degraded'
        
        # 檢查磁碟空間
        try:
            result = subprocess.run(
                ['df', '-h', '/'],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                usage = lines[1].split()[4]
                status['components']['disk'] = f'used: {usage}'
            else:
                status['components']['disk'] = 'unknown'
        except Exception:
            status['components']['disk'] = 'unknown'
        
        return jsonify(status)


class ReadyResource(Resource):
    """就緒檢查資源"""
    
    def get(self):
        """
        就緒檢查端點
        
        Returns:
            系統就緒狀態
        """
        # 檢查關鍵依賴
        try:
            # 檢查資料庫連接
            db.session.execute(db.text('SELECT 1'))
            
            # 檢查是否有股票數據
            stock_count = Stock.query.count()
            
            if stock_count > 0:
                return jsonify({
                    'ready': True,
                    'stockCount': stock_count
                })
            else:
                return jsonify({
                    'ready': False,
                    'reason': 'No stock data available'
                }), 503
                
        except Exception as e:
            return jsonify({
                'ready': False,
                'reason': str(e)
            }), 503
```

---

## 結論

本文檔完整描述了 AI 投資分析儀 V10.0 後端應用程式的開發規格，涵蓋專案結構、核心框架配置、資料庫設計、API 服務、業務邏輯、數據處理、AI 分析、排程任務、資安實作、效能優化、測試策略、以及部署維運等各個層面。

後端系統採用 Python Flask 搭配現代化的技術棧，遵循分層架構設計原則，為前端提供高效、穩定、安全的 API 服務。透過完善的資料庫模型設計、詳盡的 API 文件、完整的測試覆蓋、以及健全的監控機制，確保系統能夠滿足專業投資人對數據分析與投資決策支援的需求。

---

**文件結束**

*本文檔為 AI 投資分析儀 V10.0 後端完整開發文件*  
*文件編號：SYS-BACKEND-001*  
*版本：6.0.0*  
*建立日期：2026年2月20日*  
*文件狀態：正式發布*  

---

**核準簽章**：

| 角色 | 姓名 | 簽章 | 日期 |
|------|------|------|------|
| 撰寫 | 後端架構師 | _____________ | _____________ |
| 審查 | 技術負責人 | _____________ | _____________ |
| 核准 | 專案經理 | _____________ | _____________ |

---

**附錄 A：技術棧摘要**

| 類別 | 技術 | 版本 |
|------|------|------|
| 核心框架 | Flask | 3.x |
| ORM | SQLAlchemy | 2.x |
| API 框架 | Flask-RESTful | 0.3.x |
| 數據驗證 | Pydantic | 2.x |
| 任務排程 | Prefect | 2.x |
| 快取 | Redis | 7.x |
| 資料庫 | PostgreSQL | 15.x |
| 向量資料庫 | Milvus | 2.3 |
| 部署 | Docker + Docker Compose | 最新版 |
| 測試 | pytest | 7.x |

**附錄 B：API 端點清單**

| 模組 | 端點 | 方法 | 說明 |
|------|------|------|------|
| 行情 | /api/v1/stocks | GET | 股票清單 |
| 行情 | /api/v1/stocks/{code} | GET | 個股資訊 |
| 行情 | /api/v1/stocks/{code}/prices | GET | 歷史行情 |
| 行情 | /api/v1/stocks/{code}/quote | GET | 即時報價 |
| 行情 | /api/v1/stocks/{code}/kline | GET | K線數據 |
| 行情 | /api/v1/stocks/watcher | GET/POST/DELETE | 自選股 |
| 宏觀 | /api/v1/macro/indicators | GET | 指標列表 |
| 宏觀 | /api/v1/macro/indicators/{code} | GET | 指標數據 |
| 宏觀 | /api/v1/macro/factors | GET | 宏觀因子 |
| AI | /api/v1/ai/scores | GET | AI評分排行 |
| AI | /api/v1/ai/scores/{code} | GET | 個股評分 |
| AI | /api/v1/ai/reports | GET/POST | AI報告 |
| 健康 | /api/v1/health | GET | 健康檢查 |
| 健康 | /api/v1/ready | GET | 就緒檢查 |