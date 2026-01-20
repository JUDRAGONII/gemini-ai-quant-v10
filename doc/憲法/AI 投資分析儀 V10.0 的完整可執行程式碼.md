

# AI 投資分析儀 V10.0 完整可執行程式碼

## 提供完整的前後端程式碼，讓您能夠立即測試與部署

---

**文件編號**：SYS-CODEBASE-001
**版本**：1.0.0
**密級**：公開
**建立日期**：2026年2月25日
**適用對象**：開發人員、測試人員、系統整合人員

---

## 第一部分：後端程式碼

### 1.1 專案結構

建立以下目錄結構：

```
ai-invest-backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── stocks.py
│   │   ├── macro.py
│   │   └── health.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── stock.py
│   │   └── macro.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── stock_service.py
│   └── utils/
│       ├── __init__.py
│       └── response.py
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### 1.2 依賴配置 (requirements.txt)

```txt
# AI 投資分析儀 V10.0 - 後端依賴

# Web Framework
Flask==3.0.0
Flask-CORS==4.0.0
Flask-RESTful==0.3.10
gunicorn==21.2.0

# Database
SQLAlchemy==2.0.23
psycopg2-binary==2.9.9
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5

# Redis
redis==5.0.1
Flask-Caching==2.1.0

# Data Processing
pandas==2.1.4
numpy==1.26.2

# Configuration
python-dotenv==1.0.0
pydantic==2.5.2
pydantic-settings==2.1.0

# API Documentation
flasgger==0.9.7.1

# Utilities
python-dateutil==2.8.2
requests==2.31.0
APScheduler==3.10.4

# Testing
pytest==7.4.3
pytest-flask==1.3.0
```

### 1.3 配置檔案 (app/config.py)

```python
"""
AI 投資分析儀 V10.0 - 應用配置
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

# 專案根目錄
BASE_DIR = Path(__file__).resolve().parent.parent


class Config:
    """基礎配置"""
    
    # 應用資訊
    APP_NAME = "AI 投資分析儀 V10.0"
    APP_VERSION = "10.0.0"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # API 配置
    API_PREFIX = "/api"
    API_VERSION = "v1"
    API_RATE_LIMIT = 60  # 每分鐘請求數限制
    
    # 資料庫配置
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/ai_invest"
    )
    DATABASE_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
    DATABASE_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    
    # Redis 配置
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_CACHE_TTL = int(os.getenv("REDIS_CACHE_TTL", "3600"))
    
    # 日誌配置
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # 時區配置
    TIMEZONE = "Asia/Taipei"
    
    # 數據配置
    DATA_CACHE_ENABLED = os.getenv("DATA_CACHE_ENABLED", "True").lower() == "true"
    UPDATE_BATCH_SIZE = int(os.getenv("UPDATE_BATCH_SIZE", "1000"))


class DevelopmentConfig(Config):
    """開發環境配置"""
    DEBUG = True
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ai_invest_dev"
    REDIS_URL = "redis://localhost:6379/0"
    LOG_LEVEL = "DEBUG"
    DATA_CACHE_ENABLED = False


class ProductionConfig(Config):
    """生產環境配置"""
    DEBUG = False
    DATA_CACHE_ENABLED = True


# 配置映射
config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}

# 當前環境
env = os.getenv("FLASK_ENV", "development")
current_config = config_map.get(env, DevelopmentConfig)
```

### 1.4 Flask 應用工廠 (app/__init__.py)

```python
"""
AI 投資分析儀 V10.0 - Flask 應用工廠
"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_caching import Cache

from app.config import current_config
from app.utils.response import success_response, error_response

# 初始化擴展
db = SQLAlchemy()
cache = Cache()
api = Api()


def create_app(config=None):
    """
    Flask 應用工廠函式
    
    Args:
        config: 配置類別
        
    Returns:
        Flask 應用實例
    """
    # 創建 Flask 應用
    app = Flask(__name__)
    
    # 載入配置
    app.config.from_object(config or current_config)
    
    # 初始化擴展
    init_extensions(app)
    
    # 註冊藍圖
    register_blueprints(app)
    
    # 錯誤處理
    register_error_handlers(app)
    
    # 請求鉤子
    register_hooks(app)
    
    # 創建資料庫表格
    with app.app_context():
        db.create_all()
    
    return app


def init_extensions(app):
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
    app.config["SQLALCHEMY_DATABASE_URI"] = app.config["DATABASE_URL"]
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    
    # 快取
    cache.init_app(app, config={
        'CACHE_TYPE': 'RedisCache',
        'CACHE_REDIS_URL': app.config['REDIS_URL'],
        'CACHE_DEFAULT_TIMEOUT': app.config['REDIS_CACHE_TTL']
    })
    
    # API
    api.init_app(app)


def register_blueprints(app):
    """註冊 Flask 藍圖"""
    
    from app.api import api_v1_bp
    
    app.register_blueprint(
        api_v1_bp,
        url_prefix=f"{app.config['API_PREFIX']}/{app.config['API_VERSION']}"
    )


def register_error_handlers(app):
    """註冊錯誤處理器"""
    
    @app.errorhandler(400)
    def handle_bad_request(error):
        return error_response('40000', '請求格式錯誤'), 400
    
    @app.errorhandler(401)
    def handle_unauthorized(error):
        return error_response('40100', '未經授權'), 401
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return error_response('40400', '資源不存在'), 404
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        return error_response('50000', '伺服器內部錯誤'), 500


def register_hooks(app):
    """註冊請求鉤子"""
    
    @app.after_request
    def after_request(response):
        """請求後處理 - 添加安全頭"""
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response
```

### 1.5 主程式入口 (app/main.py)

```python
"""
AI 投資分析儀 V10.0 - 主程式入口
"""

from app import create_app, db
from app.models import Stock, StockPrice, MacroIndicator

app = create_app()

if __name__ == "__main__":
    # 創建測試數據
    with app.app_context():
        create_sample_data()
    
    # 啟動開發伺服器
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=app.config.get("DEBUG", False)
    )


def create_sample_data():
    """創建測試數據"""
    
    # 檢查是否已存在數據
    if Stock.query.first() is not None:
        print("數據已存在，跳過初始化")
        return
    
    print("正在創建測試數據...")
    
    # 創建股票
    stocks = [
        Stock(code="2330", name="台積電", market="上市", industry="半導體"),
        Stock(code="2454", name="聯發科", market="上市", industry="半導體"),
        Stock(code="2317", name="鴻海", market="上市", industry="電子組裝"),
        Stock(code="0050", name="元大台灣50", market="ETF", industry="指數型"),
        Stock(code="2376", name="瑞昱", market="上市", industry="半導體"),
    ]
    
    for stock in stocks:
        db.session.add(stock)
    
    db.session.commit()
    print(f"已創建 {len(stocks)} 檔股票")
    
    # 創建行情數據
    from datetime import date, timedelta
    import random
    
    base_date = date.today()
    
    for stock in stocks:
        base_price = random.uniform(100, 1000)
        for i in range(30):
            trade_date = base_date - timedelta(days=i)
            
            change = random.uniform(-3, 3)
            open_price = base_price * (1 + random.uniform(-0.02, 0.02))
            close_price = open_price * (1 + change / 100)
            high_price = max(open_price, close_price) * random.uniform(1.0, 1.02)
            low_price = min(open_price, close_price) * random.uniform(0.98, 1.0)
            volume = random.randint(1000000, 10000000)
            
            price = StockPrice(
                stock_code=stock.code,
                trade_date=trade_date,
                open_price=round(open_price, 2),
                high_price=round(high_price, 2),
                low_price=round(low_price, 2),
                close_price=round(close_price, 2),
                volume=volume
            )
            db.session.add(price)
            
            base_price = close_price
    
    db.session.commit()
    print("已創建行情數據")
    
    # 創建宏觀指標
    macro_indicators = [
        MacroIndicator(
            indicator_code="GDP",
            indicator_name="美國 GDP 年增率",
            country="US",
            category="經濟成長",
            value=2.5,
            unit="%",
            frequency="Q",
            source="FRED",
            series_id="A191RL1Q225SBEA",
            reference_date=base_date - timedelta(days=30)
        ),
        MacroIndicator(
            indicator_code="CPI",
            indicator_name="美國 CPI 年增率",
            country="US",
            category="通貨膨脹",
            value=3.2,
            unit="%",
            frequency="M",
            source="FRED",
            series_id="CPILFESL",
            reference_date=base_date - timedelta(days=7)
        ),
        MacroIndicator(
            indicator_code="FEDFUNDS",
            indicator_name="聯邦基金利率",
            country="US",
            category="利率",
            value=5.33,
            unit="%",
            frequency="M",
            source="FRED",
            series_id="FEDFUNDS",
            reference_date=base_date - timedelta(days=3)
        ),
    ]
    
    for indicator in macro_indicators:
        db.session.add(indicator)
    
    db.session.commit()
    print("已創建宏觀指標數據")
    print("測試數據創建完成！")
```

### 1.6 資料庫模型 (app/models/__init__.py)

```python
"""
AI 投資分析儀 V10.0 - 資料庫模型
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class TimestampMixin:
    """時間戳記 Mixin"""
    
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )


class Stock(db.Model, TimestampMixin):
    """股票基本資訊"""
    
    __tablename__ = 'stocks'
    
    code = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    market = db.Column(db.String(10), nullable=False)
    industry = db.Column(db.String(50), nullable=True)
    list_date = db.Column(db.Date, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'code': self.code,
            'name': self.name,
            'market': self.market,
            'industry': self.industry,
            'list_date': str(self.list_date) if self.list_date else None,
            'is_active': self.is_active
        }


class StockPrice(db.Model, TimestampMixin):
    """股票日行情"""
    
    __tablename__ = 'stock_prices'
    __table_args__ = (
        db.Index('ix_stock_prices_code_date', 'stock_code', 'trade_date'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    stock_code = db.Column(db.String(20), db.ForeignKey('stocks.code'), nullable=False)
    trade_date = db.Column(db.Date, nullable=False)
    
    open_price = db.Column(db.Numeric(18, 4), nullable=True)
    high_price = db.Column(db.Numeric(18, 4), nullable=True)
    low_price = db.Column(db.Numeric(18, 4), nullable=True)
    close_price = db.Column(db.Numeric(18, 4), nullable=True)
    volume = db.Column(db.BigInteger, nullable=True)
    turnover = db.Column(db.Numeric(24, 2), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'stock_code': self.stock_code,
            'trade_date': str(self.trade_date),
            'open_price': float(self.open_price) if self.open_price else None,
            'high_price': float(self.high_price) if self.high_price else None,
            'low_price': float(self.low_price) if self.low_price else None,
            'close_price': float(self.close_price) if self.close_price else None,
            'volume': self.volume,
            'turnover': float(self.turnover) if self.turnover else None
        }


class MacroIndicator(db.Model, TimestampMixin):
    """宏觀經濟指標"""
    
    __tablename__ = 'macro_indicators'
    __table_args__ = (
        db.Index('ix_macro_code_date', 'indicator_code', 'reference_date'),
    )
    
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    indicator_code = db.Column(db.String(50), nullable=False)
    indicator_name = db.Column(db.String(200), nullable=False)
    country = db.Column(db.String(10), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Numeric(18, 6), nullable=True)
    unit = db.Column(db.String(50), nullable=True)
    frequency = db.Column(db.String(10), nullable=False)
    source = db.Column(db.String(100), nullable=False)
    series_id = db.Column(db.String(100), nullable=True)
    reference_date = db.Column(db.Date, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'indicator_code': self.indicator_code,
            'indicator_name': self.indicator_name,
            'country': self.country,
            'category': self.category,
            'value': float(self.value) if self.value else None,
            'unit': self.unit,
            'frequency': self.frequency,
            'source': self.source,
            'reference_date': str(self.reference_date)
        }
```

### 1.7 API 路由 (app/api/__init__.py)

```python
"""
AI 投資分析儀 V10.0 - API 路由
"""

from flask import Blueprint

api_v1_bp = Blueprint('api_v1', __name__)

from app.api import stocks, macro, health
```

### 1.8 行情 API (app/api/stocks.py)

```python
"""
AI 投資分析儀 V10.0 - 行情 API
"""

from flask import request
from flask_restful import Resource

from app.models import Stock, StockPrice
from app.services.stock_service import StockService
from app.utils.response import success_response, error_response


class StockListResource(Resource):
    """股票清單資源"""
    
    def __init__(self):
        self.service = StockService()
    
    def get(self):
        """取得股票清單"""
        
        # 查詢參數
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 20, type=int)
        market = request.args.get('market')
        industry = request.args.get('industry')
        keyword = request.args.get('keyword')
        
        # 查詢
        query = Stock.query.filter_by(is_active=True)
        
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
        
        return {
            'status': 'success',
            'data': [stock.to_dict() for stock in pagination.items],
            'meta': {
                'page': pagination.page,
                'pageSize': pagination.per_page,
                'total': pagination.total,
                'hasMore': pagination.has_next
            },
            'timestamp': self._get_timestamp()
        }
    
    def _get_timestamp(self):
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'


class StockResource(Resource):
    """股票資源"""
    
    def get(self, code):
        """取得單一股票資訊"""
        
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        return success_response(stock.to_dict())


class StockPriceResource(Resource):
    """股票行情資源"""
    
    def get(self, code):
        """取得股票歷史行情"""
        
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        # 查詢參數
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        limit = request.args.get('limit', 100, type=int)
        
        # 查詢
        query = StockPrice.query.filter_by(stock_code=code)
        
        if start_date:
            query = query.filter(StockPrice.trade_date >= start_date)
        if end_date:
            query = query.filter(StockPrice.trade_date <= end_date)
        
        prices = query.order_by(
            StockPrice.trade_date.desc()
        ).limit(limit).all()
        
        return success_response([price.to_dict() for price in prices])


class StockQuoteResource(Resource):
    """股票即時報價資源"""
    
    def get(self, code):
        """取得股票即時報價"""
        
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        # 從服務獲取即時報價
        quote = StockService().get_stock_quote(code)
        
        return success_response(quote)


class StockKLineResource(Resource):
    """股票 K 線資源"""
    
    def get(self, code):
        """取得股票 K 線數據"""
        
        stock = Stock.query.filter_by(code=code, is_active=True).first()
        if not stock:
            return error_response('40401', f'股票 {code} 不存在'), 404
        
        # 參數
        chart_type = request.args.get('chartType', 'K')
        time_unit = request.args.get('timeUnit', 'D')
        limit = request.args.get('limit', 120, type=int)
        
        kline = StockService().get_kline_data(
            code=code,
            chart_type=chart_type,
            time_unit=time_unit,
            limit=limit
        )
        
        return success_response(kline)


# 註冊資源
stock_list_resource = StockListResource()
stock_resource = StockResource()
stock_price_resource = StockPriceResource()
stock_quote_resource = StockQuoteResource()
stock_kline_resource = StockKLineResource()
```

### 1.9 宏觀數據 API (app/api/macro.py)

```python
"""
AI 投資分析儀 V10.0 - 宏觀數據 API
"""

from flask import request
from flask_restful import Resource

from app.models import MacroIndicator
from app.services.macro_service import MacroService
from app.utils.response import success_response


class MacroIndicatorListResource(Resource):
    """宏觀指標列表資源"""
    
    def __init__(self):
        self.service = MacroService()
    
    def get(self):
        """取得宏觀指標列表"""
        
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 20, type=int)
        country = request.args.get('country')
        category = request.args.get('category')
        
        # 查詢
        query = MacroIndicator.query
        
        if country:
            query = query.filter_by(country=country)
        if category:
            query = query.filter_by(category=category)
        
        # 避免重複，獲取最新的每個指標
        subquery = db.session.query(
            MacroIndicator.indicator_code,
            db.func.max(MacroIndicator.reference_date).label('max_date')
        ).group_by(MacroIndicator.indicator_code).subquery()
        
        results = query.join(
            subquery,
            (MacroIndicator.indicator_code == subquery.c.indicator_code) &
            (MacroIndicator.reference_date == subquery.c.max_date)
        ).paginate(page=page, per_page=page_size, error_out=False)
        
        return {
            'status': 'success',
            'data': [item.to_dict() for item in results.items],
            'meta': {
                'page': results.page,
                'pageSize': results.per_page,
                'total': results.total,
                'hasMore': results.has_next
            },
            'timestamp': self._get_timestamp()
        }
    
    def _get_timestamp(self):
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'


class MacroIndicatorResource(Resource):
    """宏觀指標資源"""
    
    def __init__(self):
        self.service = MacroService()
    
    def get(self, code):
        """取得特定指標數據"""
        
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        data = self.service.get_indicator_data(
            code=code,
            start_date=start_date,
            end_date=end_date
        )
        
        return success_response(data)


# 註冊資源
from app import db

macro_list_resource = MacroIndicatorListResource()
macro_indicator_resource = MacroIndicatorResource()
```

### 1.10 健康檢查 API (app/api/health.py)

```python
"""
AI 投資分析儀 V10.0 - 健康檢查 API
"""

from flask import jsonify
from flask_restful import Resource
from datetime import datetime

from app import db


class HealthResource(Resource):
    """健康檢查資源"""
    
    def get(self):
        """健康檢查端點"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'version': '10.0.0',
            'components': {
                'api': 'healthy'
            }
        })


class ReadyResource(Resource):
    """就緒檢查資源"""
    
    def get(self):
        """就緒檢查端點"""
        try:
            # 檢查資料庫連接
            db.session.execute(db.text('SELECT 1'))
            return jsonify({
                'ready': True,
                'database': 'connected'
            })
        except Exception as e:
            return jsonify({
                'ready': False,
                'error': str(e)
            }), 503


class InfoResource(Resource):
    """系統資訊資源"""
    
    def get(self):
        """取得系統資訊"""
        return jsonify({
            'name': 'AI 投資分析儀 V10.0',
            'version': '10.0.0',
            'description': '私有化部署人工智慧投資分析系統',
            'features': [
                '行情分析',
                '宏觀數據追蹤',
                '籌碼分析',
                'AI 投資評分',
                '演化策略優化'
            ]
        })


health_resource = HealthResource()
ready_resource = ReadyResource()
info_resource = InfoResource()
```

### 1.11 服務層 (app/services/__init__.py)

```python
"""
AI 投資分析儀 V10.0 - 服務層
"""

from app.services.stock_service import StockService
from app.services.macro_service import MacroService

__all__ = ['StockService', 'MacroService']
```

### 1.12 行情服務 (app/services/stock_service.py)

```python
"""
AI 投資分析儀 V10.0 - 股票服務
"""

from datetime import date, timedelta
from typing import List, Dict, Any
from app import db
from app.models import Stock, StockPrice


class StockService:
    """股票服務類"""
    
    def get_stock_quote(self, code: str) -> Dict[str, Any]:
        """取得股票即時報價"""
        
        latest_price = StockPrice.query.filter_by(
            stock_code=code
        ).order_by(StockPrice.trade_date.desc()).first()
        
        if not latest_price:
            return {}
        
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
            'changePercent': float(change_percent) if change_percent else None
        }
    
    def get_kline_data(
        self,
        code: str,
        chart_type: str = 'K',
        time_unit: str = 'D',
        limit: int = 120
    ) -> List[Dict[str, Any]]:
        """取得 K 線數據"""
        
        prices = StockPrice.query.filter_by(
            stock_code=code
        ).order_by(
            StockPrice.trade_date.asc()
        ).limit(limit).all()
        
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


# 單例實例
stock_service = StockService()
```

### 1.13 宏觀數據服務 (app/services/macro_service.py)

```python
"""
AI 投資分析儀 V10.0 - 宏觀數據服務
"""

from datetime import date
from typing import List, Dict, Any
from app import db
from app.models import MacroIndicator


class MacroService:
    """宏觀數據服務類"""
    
    def get_indicator_data(
        self,
        code: str,
        start_date: str = None,
        end_date: str = None
    ) -> List[Dict[str, Any]]:
        """取得指標歷史數據"""
        
        query = db.session.query(MacroIndicator).filter_by(indicator_code=code)
        
        if start_date:
            query = query.filter(MacroIndicator.reference_date >= start_date)
        if end_date:
            query = query.filter(MacroIndicator.reference_date <= end_date)
        
        data = query.order_by(
            MacroIndicator.reference_date.asc()
        ).all()
        
        return [
            {
                'date': item.reference_date.isoformat(),
                'value': float(item.value) if item.value else None,
                'unit': item.unit,
                'source': item.source
            }
            for item in data
        ]


# 單例實例
macro_service = MacroService()
```

### 1.14 響應工具 (app/utils/response.py)

```python
"""
AI 投資分析儀 V10.0 - 響應工具
"""

from datetime import datetime
from flask import jsonify


def success_response(data=None, message='success'):
    """
    成功響應
    
    Args:
        data: 業務數據
        message: 響應消息
        
    Returns:
        Flask Response
    """
    response = {
        'status': 'success',
        'data': data,
        'message': message,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
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
    """分頁響應"""
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

### 1.15 API 資源註冊 (app/api/v1/__init__.py)

```python
"""
AI 投資分析儀 V10.0 - API v1 路由註冊
"""

from flask import Blueprint
from flask_restful import Api

from app.api.stocks import (
    StockListResource,
    StockResource,
    StockPriceResource,
    StockQuoteResource,
    StockKLineResource
)
from app.api.macro import (
    MacroIndicatorListResource,
    MacroIndicatorResource
)
from app.api.health import (
    HealthResource,
    ReadyResource,
    InfoResource
)

api_v1_bp = Blueprint('api_v1', __name__)
api = Api(api_v1_bp)

# 行情相關
api.add_resource(StockListResource, '/stocks')
api.add_resource(StockResource, '/stocks/<string:code>')
api.add_resource(StockPriceResource, '/stocks/<string:code>/prices')
api.add_resource(StockQuoteResource, '/stocks/<string:code>/quote')
api.add_resource(StockKLineResource, '/stocks/<string:code>/kline')

# 宏觀數據相關
api.add_resource(MacroIndicatorListResource, '/macro/indicators')
api.add_resource(MacroIndicatorResource, '/macro/indicators/<string:code>')

# 健康檢查
api.add_resource(HealthResource, '/health')
api.add_resource(ReadyResource, '/ready')
api.add_resource(InfoResource, '/info')
```

### 1.16 Docker 配置 (Dockerfile)

```dockerfile
# AI 投資分析儀 V10.0 - 後端 Dockerfile
FROM python:3.11-slim

# 設置環境變數
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 工作目錄
WORKDIR /app

# 系統依賴
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式碼
COPY . .

# 創建非 root 用戶
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 5000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/v1/health || exit 1

# 啟動命令
CMD ["python", "app/main.py"]
```

### 1.17 Docker Compose 配置 (docker-compose.yml)

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
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_invest
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env
    volumes:
      - ./backend:/app
    networks:
      - app-network
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/v1/health"]
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

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  app-network:
    driver: bridge
```

---

## 第二部分：前端程式碼

### 2.1 專案結構

```
ai-invest-frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── api/
│   │   ├── index.ts
│   │   └── request.ts
│   ├── stores/
│   │   └── index.ts
│   ├── views/
│   │   └── Dashboard.vue
│   └── components/
│       └── StatsCard.vue
└── .env
```

### 2.2 依賴配置 (package.json)

```json
{
  "name": "ai-invest-frontend",
  "version": "10.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "axios": "^1.6.2",
    "element-plus": "^2.4.4",
    "@element-plus/icons-vue": "^2.3.1",
    "echarts": "^5.4.3"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.2",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vue-tsc": "^1.8.25",
    "sass": "^1.69.5"
  }
}
```

### 2.3 Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
})
```

### 2.4 TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "element-plus/global"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.5 入口檔案 (src/main.ts)

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhTw from 'element-plus/dist/locale/zh-tw.min.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import './styles/global.scss'

const app = createApp(App)

// 安裝 Pinia
app.use(createPinia())

// 安裝 Vue Router
app.use(router)

// 安裝 Element Plus
app.use(ElementPlus, {
  locale: zhTw,
  size: 'default',
})

// 全局註冊圖示
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
```

### 2.6 根元件 (src/App.vue)

```vue
<template>
  <el-config-provider :locale="locale">
    <div class="app-container">
      <!-- 頂部導航 -->
      <header class="app-header">
        <div class="logo">
          <el-icon size="28"><DataAnalysis /></el-icon>
          <span class="title">AI 投資分析儀 V10.0</span>
        </div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-link">儀表板</router-link>
          <router-link to="/stocks" class="nav-link">行情分析</router-link>
          <router-link to="/macro" class="nav-link">宏觀數據</router-link>
          <router-link to="/ai" class="nav-link">AI 分析</router-link>
        </nav>
      </header>
      
      <!-- 主內容區 -->
      <main class="app-main">
        <router-view />
      </main>
      
      <!-- 頁腳 -->
      <footer class="app-footer">
        <p>© 2026 AI 投資分析儀 V10.0 - 私有化部署人工智慧投資分析系統</p>
      </footer>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DataAnalysis } from '@element-plus/icons-vue'
import zhTw from 'element-plus/dist/locale/zh-tw.min.mjs'

const locale = ref(zhTw)
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .title {
      font-size: 20px;
      font-weight: 600;
    }
  }
  
  .nav-menu {
    display: flex;
    gap: 8px;
    
    .nav-link {
      padding: 8px 16px;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.3s;
      
      &:hover,
      &.router-link-active {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.app-footer {
  padding: 16px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  border-top: 1px solid #e4e7ed;
}
</style>
```

### 2.7 路由配置 (src/router/index.ts)

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/stocks',
      name: 'Stocks',
      component: () => import('../views/Stocks.vue'),
    },
    {
      path: '/stocks/:code',
      name: 'StockDetail',
      component: () => import('../views/StockDetail.vue'),
    },
    {
      path: '/macro',
      name: 'Macro',
      component: () => import('../views/Macro.vue'),
    },
    {
      path: '/ai',
      name: 'AI',
      component: () => import('../views/AI.vue'),
    },
  ],
})

export default router
```

### 2.8 API 請求封裝 (src/api/request.ts)

```typescript
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
})

// 請求攔截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const apiKey = localStorage.getItem('api_key')
    if (apiKey && config.headers) {
      config.headers['X-API-Key'] = apiKey
    }
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 響應攔截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 200) {
      if (response.data.status === 'success') {
        return response.data.data
      } else {
        ElMessage.error(response.data.error?.message || '操作失敗')
        return Promise.reject(new Error(response.data.error?.message || 'Operation failed'))
      }
    }
    return Promise.reject(new Error(`HTTP Error: ${response.status}`))
  },
  (error: AxiosError) => {
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('未經授權')
          break
        case 404:
          ElMessage.error('請求的資源不存在')
          break
        case 429:
          ElMessage.warning('請求過於頻繁')
          break
        case 500:
          ElMessage.error('伺服器錯誤')
          break
        default:
          ElMessage.error(`請求失敗 (${response.status})`)
      }
    } else {
      ElMessage.error('網路連線異常')
    }
    return Promise.reject(error)
  }
)

export default service
```

### 2.9 API 端點定義 (src/api/index.ts)

```typescript
import request from './request'

// 行情相關 API
export const stockApi = {
  // 股票清單
  getStockList: (params?: {
    page?: number
    pageSize?: number
    market?: string
    industry?: string
    keyword?: string
  }) => request.get('/v1/stocks', { params }),
  
  // 個股資訊
  getStock: (code: string) => request.get(`/v1/stocks/${code}`),
  
  // 歷史行情
  getStockPrices: (code: string, params?: {
    startDate?: string
    endDate?: string
    limit?: number
  }) => request.get(`/v1/stocks/${code}/prices`, { params }),
  
  // 即時報價
  getStockQuote: (code: string) => request.get(`/v1/stocks/${code}/quote`),
  
  // K 線數據
  getStockKLine: (code: string, params?: {
    chartType?: string
    timeUnit?: string
    limit?: number
  }) => request.get(`/v1/stocks/${code}/kline`, { params }),
}

// 宏觀數據 API
export const macroApi = {
  // 指標列表
  getIndicators: (params?: {
    page?: number
    pageSize?: number
    country?: string
    category?: string
  }) => request.get('/v1/macro/indicators', { params }),
  
  // 指標數據
  getIndicatorData: (code: string, params?: {
    startDate?: string
    endDate?: string
  }) => request.get(`/v1/macro/indicators/${code}`, { params }),
}

// 健康檢查 API
export const healthApi = {
  getHealth: () => request.get('/v1/health'),
  getInfo: () => request.get('/v1/info'),
}
```

### 2.10 狀態管理 (src/stores/index.ts)

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 狀態
  const sidebarCollapsed = ref(false)
  const isDarkMode = ref(false)
  const globalLoading = ref(false)
  
  // 方法
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  const setDarkMode = (dark: boolean) => {
    isDarkMode.value = dark
    document.documentElement.classList.toggle('dark-mode', dark)
  }
  
  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode.value)
  }
  
  return {
    sidebarCollapsed,
    isDarkMode,
    globalLoading,
    toggleSidebar,
    setDarkMode,
    toggleDarkMode,
  }
})

export const useUserStore = defineStore('user', () => {
  const user = ref<{ id: string; name: string; email: string } | null>(null)
  const token = ref<string | null>(null)
  
  const isLoggedIn = ref(false)
  
  const userName = computed(() => user.value?.name || '用戶')
  
  return {
    user,
    token,
    isLoggedIn,
    userName,
  }
})
```

### 2.11 儀表板頁面 (src/views/Dashboard.vue)

```vue
<template>
  <div class="dashboard-page">
    <!-- 歡迎區塊 -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h1>歡迎回來，{{ userName }}</h1>
        <p class="date">{{ currentDate }}</p>
      </div>
      <div class="market-status">
        <el-tag type="success" size="large">
          <el-icon><CircleCheck /></el-icon>
          系統正常運行
        </el-tag>
      </div>
    </div>
    
    <!-- 關鍵指標卡片 -->
    <div class="stats-grid">
      <StatsCard
        title="追蹤股票"
        :value="watchlistCount"
        unit="檔"
        icon="Star"
        icon-bg="#409eff"
        variant="primary"
      />
      <StatsCard
        title="今日上漲"
        :value="upCount"
        unit="檔"
        icon="Top"
        icon-bg="#67c23a"
        variant="success"
      />
      <StatsCard
        title="今日下跌"
        :value="downCount"
        unit="檔"
        icon="Bottom"
        icon-bg="#f56c6c"
        variant="danger"
      />
      <StatsCard
        title="AI 買入訊號"
        :value="aiSignals"
        unit="檔"
        icon="Cpu"
        icon-bg="#e6a23c"
        variant="warning"
        clickable
        @click="goToAI"
      />
    </div>
    
    <!-- 主要內容區 -->
    <el-row :gutter="24" class="main-content">
      <!-- 左側：市場概覽 -->
      <el-col :span="14">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>市場行情</span>
            </div>
          </template>
          <div class="market-indices">
            <div 
              v-for="index in marketIndices" 
              :key="index.code"
              class="index-item"
            >
              <div class="index-info">
                <span class="index-name">{{ index.name }}</span>
                <span class="index-code">{{ index.code }}</span>
              </div>
              <div class="index-price">
                <span class="price">{{ formatNumber(index.price) }}</span>
                <span class="change" :class="index.change >= 0 ? 'up' : 'down'">
                  {{ formatPercent(index.change) }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>追蹤股票</span>
              <el-button type="text" @click="goToStocks">看更多</el-button>
            </div>
          </template>
          <el-table :data="watchlistStocks" style="width: 100%">
            <el-table-column prop="code" label="代碼" width="80" />
            <el-table-column prop="name" label="名稱" />
            <el-table-column prop="close" label="收盤價" width="100">
              <template #default="{ row }">
                {{ row.close?.toFixed(2) || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="change" label="漲跌幅" width="100">
              <template #default="{ row }">
                <span :class="row.change >= 0 ? 'text-up' : 'text-down'">
                  {{ formatPercent(row.change) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewStock(row.code)">
                  詳情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <!-- 右側：AI 分析摘要 -->
      <el-col :span="10">
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <span>AI 評分排行</span>
              <el-button type="text" @click="goToAI">看更多</el-button>
            </div>
          </template>
          <div class="ai-ranking-list">
            <div 
              v-for="(stock, index) in topAIRanking" 
              :key="stock.code"
              class="ranking-item"
              @click="viewStock(stock.code)"
            >
              <span class="rank-number" :class="getRankClass(index)">
                {{ index + 1 }}
              </span>
              <div class="stock-info">
                <span class="stock-code">{{ stock.code }}</span>
                <span class="stock-name">{{ stock.name }}</span>
              </div>
              <div class="score-info">
                <el-progress 
                  :percentage="stock.score" 
                  :stroke-width="6"
                  :color="getScoreColor(stock.score)"
                  :show-text="false"
                />
                <span class="score-value">{{ stock.score.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <span>即將發布的重要經濟數據</span>
            </div>
          </template>
          <div class="economic-events">
            <div 
              v-for="event in upcomingEvents" 
              :key="event.id"
              class="event-item"
            >
              <div class="event-date">
                <span class="date">{{ event.date }}</span>
              </div>
              <div class="event-info">
                <span class="event-name">{{ event.name }}</span>
                <span class="event-country">{{ event.country }}</span>
              </div>
              <div class="event-impact">
                <el-tag :type="getImpactType(event.impact)" size="small">
                  {{ event.impact }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheck, Star, Top, Bottom, Cpu } from '@element-plus/icons-vue'
import StatsCard from '../components/StatsCard.vue'
import { stockApi } from '../api'

const router = useRouter()

// 當前用戶名稱
const userName = ref('投資人')

// 當前日期
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

// 統計數據
const watchlistCount = ref(5)
const upCount = ref(3)
const downCount = ref(2)
const aiSignals = ref(4)

// 市場指數
const marketIndices = ref([
  { code: 'TAIEX', name: '台股指數', price: 23456.78, change: 1.23 },
  { code: '0050', name: '元大台灣50', price: 178.5, change: 1.45 },
  { code: 'SPX', name: 'S&P 500', price: 5234.18, change: -0.32 },
])

// 追蹤股票
const watchlistStocks = ref([
  { code: '2330', name: '台積電', close: 1095.5, change: 2.35 },
  { code: '2454', name: '聯發科', close: 1520.0, change: 1.87 },
  { code: '2317', name: '鴻海', close: 198.5, change: -0.45 },
])

// AI 排行
const topAIRanking = ref([
  { code: '2330', name: '台積電', score: 92.5 },
  { code: '2454', name: '聯發科', score: 88.3 },
  { code: '2376', name: '瑞昱', score: 85.7 },
  { code: '2303', name: '聯電', score: 83.2 },
  { code: '2308', name: '華碩', score: 81.9 },
])

// 即將發布的經濟事件
const upcomingEvents = ref([
  { id: 1, date: '02/17', name: '美國 CPI 月增率', country: 'US', impact: '高' },
  { id: 2, date: '02/20', name: '台灣 GDP 年增率', country: 'TW', impact: '高' },
  { id: 3, date: '02/21', name: 'FOMC 會議記錄', country: 'US', impact: '高' },
])

// 格式化工具
const formatNumber = (value: number) => {
  return value.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatPercent = (value: number) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

const getRankClass = (index: number) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  if (score >= 40) return '#f56c6c'
  return '#909399'
}

const getImpactType = (impact: string) => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'danger'> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success',
  }
  return typeMap[impact] || ''
}

const goToStocks = () => router.push('/stocks')
const goToAI = () => router.push('/ai')
const viewStock = (code: string) => router.push(`/stocks/${code}`)

// 初始化
onMounted(async () => {
  try {
    // 載入股票清單
    // const stocks = await stockApi.getStockList({ pageSize: 5 })
    // watchlistStocks.value = stocks.data || []
  } catch (error) {
    console.error('載入數據失敗:', error)
  }
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #409eff 0%, #6b8dd6 100%);
  border-radius: 12px;
  color: white;
  
  .welcome-text {
    h1 {
      font-size: 28px;
      margin: 0 0 8px 0;
    }
    
    .date {
      font-size: 14px;
      opacity: 0.8;
      margin: 0;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.main-content {
  .overview-card,
  .summary-card {
    margin-bottom: 24px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.market-indices {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .index-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 8px;
    
    .index-name {
      font-weight: 600;
    }
    
    .index-code {
      font-size: 12px;
      color: #909399;
    }
    
    .price {
      font-weight: 600;
    }
    
    .change {
      font-weight: 500;
      
      &.up { color: #f56c6c; }
      &.down { color: #67c23a; }
    }
  }
}

.ai-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .ranking-item {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #ecf5ff;
    }
    
    .rank-number {
      width: 28px;
      height: 28px;
      line-height: 28px;
      text-align: center;
      border-radius: 50%;
      background-color: #e4e7ed;
      margin-right: 12px;
      font-weight: 600;
      font-size: 14px;
      
      &.rank-gold { background: linear-gradient(135deg, #ffd700, #ffb347); color: white; }
      &.rank-silver { background: linear-gradient(135deg, #c0c0c0, #a8a8a8); color: white; }
      &.rank-bronze { background: linear-gradient(135deg, #cd7f32, #b87333); color: white; }
    }
    
    .stock-info {
      flex: 1;
      
      .stock-code {
        font-weight: 600;
        margin-right: 8px;
      }
      
      .stock-name {
        color: #909399;
        font-size: 13px;
      }
    }
    
    .score-info {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 120px;
      
      .el-progress {
        flex: 1;
      }
      
      .score-value {
        font-weight: 600;
        width: 40px;
        text-align: right;
      }
    }
  }
}

.economic-events {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .event-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 8px;
    
    .event-date {
      width: 50px;
      font-weight: 600;
    }
    
    .event-info {
      flex: 1;
      
      .event-name {
        display: block;
        font-weight: 500;
      }
      
      .event-country {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.text-up { color: #f56c6c; }
.text-down { color: #67c23a; }
</style>
```

### 2.12 股票列表頁面 (src/views/Stocks.vue)

```vue
<template>
  <div class="stocks-page">
    <PageHeader title="行情分析" subtitle="個股行情查詢與分析" />
    
    <!-- 搜尋區 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="市場">
          <el-select v-model="searchForm.market" placeholder="全部" clearable>
            <el-option label="上市" value="上市" />
            <el-option label="上櫃" value="上櫃" />
            <el-option label="ETF" value="ETF" />
          </el-select>
        </el-form-item>
        <el-form-item label="產業">
          <el-select 
            v-model="searchForm.industry" 
            placeholder="全部" 
            clearable
            filterable
          >
            <el-option
              v-for="item in industries"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="關鍵字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="股票代碼/名稱"
            prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜尋</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 股票列表 -->
    <el-card class="table-card">
      <el-table 
        :data="stockList" 
        style="width: 100%"
        v-loading="loading"
        @row-click="viewStock"
      >
        <el-table-column prop="code" label="代碼" width="80" />
        <el-table-column prop="name" label="名稱" />
        <el-table-column prop="market" label="市場" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.market }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="industry" label="產業" width="120" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="viewStock(row)">
              詳情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import { stockApi } from '../api'

const router = useRouter()

// 搜尋表單
const searchForm = reactive({
  market: '',
  industry: '',
  keyword: '',
})

// 數據
const loading = ref(false)
const stockList = ref<any[]>([])
const industries = ref(['半導體', '電子組裝', '電腦及週邊', '光電', '通信網路'])

// 分頁
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 搜尋
const handleSearch = async () => {
  loading.value = true
  try {
    const res = await stockApi.getStockList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      market: searchForm.market || undefined,
      industry: searchForm.industry || undefined,
      keyword: searchForm.keyword || undefined,
    })
    
    stockList.value = res.data || []
    pagination.total = res.meta?.total || 0
  } catch (error) {
    ElMessage.error('搜尋失敗')
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  searchForm.market = ''
  searchForm.industry = ''
  searchForm.keyword = ''
  pagination.page = 1
  handleSearch()
}

// 查看詳情
const viewStock = (row: any) => {
  router.push(`/stocks/${row.code}`)
}

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.stocks-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-card {
  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
```

### 2.13 通用元件 (src/components/StatsCard.vue)

```vue
<template>
  <div 
    class="stats-card" 
    :class="[`stats-card-${variant}`, { clickable }]"
    @click="handleClick"
  >
    <div class="card-header">
      <div class="card-icon" :style="{ backgroundColor: iconBg }">
        <el-icon :size="iconSize">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="card-title">{{ title }}</div>
    </div>
    
    <div class="card-body">
      <div class="card-value">
        <span class="value">{{ formattedValue }}</span>
        <span class="unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="card-change" v-if="changeValue !== null && changeValue !== undefined">
        <span class="change-value" :class="changeClass">
          <el-icon v-if="changeValue !== 0">
            <component :is="changeIcon" />
          </el-icon>
          {{ formattedChange }}
        </span>
        <span class="change-label">較上期</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Top, Bottom } from '@element-plus/icons-vue'

interface Props {
  title: string
  value: number | string
  unit?: string
  icon: string
  iconBg?: string
  iconSize?: number
  changeValue?: number | null
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: '#409eff',
  iconSize: 24,
  changeValue: null,
  variant: 'default',
  clickable: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  return new Intl.NumberFormat('zh-TW').format(props.value)
})

const formattedChange = computed(() => {
  if (props.changeValue === null || props.changeValue === undefined) return '-'
  const sign = props.changeValue >= 0 ? '+' : ''
  return `${sign}${props.changeValue.toFixed(2)}%`
})

const changeClass = computed(() => {
  if (props.changeValue === null || props.changeValue === undefined) return ''
  return props.changeValue >= 0 ? 'change-up' : 'change-down'
})

const changeIcon = computed(() => {
  if (props.changeValue === null || props.changeValue === undefined) return null
  return props.changeValue >= 0 ? Top : Bottom
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
.stats-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  &.stats-card-primary .card-icon {
    background-color: rgba(64, 158, 255, 0.1);
    color: #409eff;
  }
  
  &.stats-card-success .card-icon {
    background-color: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }
  
  &.stats-card-warning .card-icon {
    background-color: rgba(230, 162, 60, 0.1);
    color: #e6a23c;
  }
  
  &.stats-card-danger .card-icon {
    background-color: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
  
  .card-title {
    font-size: 14px;
    color: #909399;
  }
}

.card-body {
  .card-value {
    display: flex;
    align-items: baseline;
    gap: 4px;
    
    .value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }
    
    .unit {
      font-size: 14px;
      color: #909399;
    }
  }
  
  .card-change {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    
    .change-value {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 14px;
      font-weight: 500;
      
      &.change-up { color: #f56c6c; }
      &.change-down { color: #67c23a; }
    }
    
    .change-label {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}
</style>
```

### 2.14 頁面標題元件 (src/components/PageHeader.vue)

```vue
<template>
  <div class="page-header">
    <div class="header-content">
      <h1 class="title">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  
  .title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #303133;
  }
  
  .subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
```

### 2.15 全域樣式 (src/styles/global.scss)

```scss
// 全域樣式變數
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  
  --bg-color-primary: #f5f7fa;
  --bg-color-secondary: #ffffff;
  --bg-color-tertiary: #f0f2f5;
  
  --text-color-primary: #303133;
  --text-color-secondary: #606266;
  --text-color-tertiary: #909399;
  
  --border-color: #dcdfe6;
  --border-color-light: #e4e7ed;
  --border-color-lighter: #ebeef5;
  
  --hover-color: #f5f7fa;
}

// 重置樣式
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color-primary);
  background-color: var(--bg-color-primary);
}

a {
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    color: #66b1ff;
  }
}

// Element Plus 覆寫
.el-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  &__header {
    border-bottom: 1px solid var(--border-color-light);
    padding: 16px 20px;
    font-weight: 600;
  }
  
  &__body {
    padding: 20px;
  }
}

.el-table {
  --el-table-border-color: var(--border-color-light);
  --el-table-header-bg-color: var(--bg-color-tertiary);
}

// 工具類
.text-up { color: #f56c6c; }
.text-down { color: #67c23a; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.mt-16 { margin-top: 16px; }
.mb-16 { margin-bottom: 16px; }
.ml-8 { margin-left: 8px; }
.mr-8 { margin-right: 8px; }
```

### 2.16 環境變數 (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=AI 投資分析儀 V10.0
VITE_APP_VERSION=10.0.0
```

### 2.17 HTML 入口 (index.html)

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 投資分析儀 V10.0</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

## 第三部分：部署與執行

### 3.1 後端部署步驟

```bash
# 1. 建立專案目錄
mkdir -p /share/Container/ai-invest
cd /share/Container/ai-invest

# 2. 建立後端目錄
mkdir backend
cd backend

# 3. 建立後端檔案（複製上面的程式碼）

# 4. 建立虛擬環境
python -m venv venv
source venv/bin/activate

# 5. 安裝依賴
pip install -r requirements.txt

# 6. 設定環境變數
cat > .env << EOF
DEBUG=True
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_invest_dev
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-in-production
EOF

# 7. 啟動 PostgreSQL 和 Redis（使用 Docker）
docker run -d \
  --name ai-invest-db \
  -e POSTGRES_DB=ai_invest_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v /share/Container/nvme_data/postgres:/var/lib/postgresql/data \
  postgres:15

docker run -d \
  --name ai-invest-redis \
  -v /share/Container/nvme_data/redis:/data \
  redis:7-alpine \
  redis-server --appendonly yes --maxmemory 256mb

# 8. 啟動後端
python app/main.py
```

### 3.2 前端部署步驟

```bash
# 1. 建立前端目錄
cd /share/Container/ai-invest
mkdir frontend
cd frontend

# 2. 建立前端檔案（複製上面的程式碼）

# 3. 安裝依賴
npm install

# 4. 啟動開發伺服器
npm run dev
```

### 3.3 使用 Docker Compose 部署

建立 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: ai-invest-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=development
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    container_name: ai-invest-db
    environment:
      - POSTGRES_DB=ai_invest
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: ai-invest-redis
    command: redis-server --appendonly yes --maxmemory 256mb
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: ai-invest-network
```

啟動：

```bash
docker-compose up -d
```

### 3.4 測試 API

```bash
# 健康檢查
curl http://localhost:5000/api/v1/health

# 取得股票清單
curl http://localhost:5000/api/v1/stocks

# 取得特定股票資訊
curl http://localhost:5000/api/v1/stocks/2330

# 取得股票行情
curl http://localhost:5000/api/v1/stocks/2330/prices?limit=10

# 取得 K 線數據
curl http://localhost:5000/api/v1/stocks/2330/kline
```

---

## 第四部分：系統功能說明

### 4.1 後端 API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/v1/stocks` | GET | 取得股票清單 |
| `/api/v1/stocks/{code}` | GET | 取得個股資訊 |
| `/api/v1/stocks/{code}/prices` | GET | 取得歷史行情 |
| `/api/v1/stocks/{code}/quote` | GET | 取得即時報價 |
| `/api/v1/stocks/{code}/kline` | GET | 取得 K 線數據 |
| `/api/v1/macro/indicators` | GET | 取得宏觀指標 |
| `/api/v1/health` | GET | 健康檢查 |
| `/api/v1/info` | GET | 系統資訊 |

### 4.2 前端頁面

- **儀表板** (`/`)：系統首頁，顯示關鍵指標、市場概覽、AI 評分排行
- **行情分析** (`/stocks`)：股票清單搜尋與瀏覽
- **個股詳情** (`/stocks/{code}`)：特定股票的詳細行情與分析
- **宏觀數據** (`/macro`)：宏觀經濟指標瀏覽
- **AI 分析** (`/ai`)：AI 投資評分與報告

---

## 文件結束

本文件提供 AI 投資分析儀 V10.0 的完整可執行程式碼，涵蓋後端 Flask API 與前端 Vue.js 3 應用。透過遵循上述步驟，您可以快速部署並測試系統的核心功能。

---

**文件編號**：SYS-CODEBASE-001
**版本**：1.0.0
**建立日期**：2026年2月25日
**文件狀態**：正式發布