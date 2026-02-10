# 04. 數據獲取與 API 開發治理 (Data Sources & API Governance)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 15+ 數據源詳細規格、API Key Pool 智慧路由、爬蟲風險管控，涵蓋 V10.0 130+ 宏觀指標與 11 家 13F 機構數據整合

---

## 1. 全方位數據源集錦 (Complete Data Sources)

### 1.1 V10.0 數據覆蓋對比

| 數據類別 | V9.3 | V10.0 強化 |
|----------|------|------------|
| **宏觀指標** | 30+ 項 | **130+ 項** (涵蓋 5 大經濟體) |
| **13F 機構** | 4 家 | **11 家** (橋水、波克夏、文藝復興、Ark 等) |
| **美股核心標的** | 有 | 2,707 檔 |
| **台股上市** | 有 | 980 檔 |
| **台股上櫃** | 有 | 820 檔 |
| **台股 ETF** | 有 | 240 檔 |

### 1.2 核心市場數據 (Equity & Price)

| 來源 | 類型 | 用途 | 請求限制 | 環境變數 |
|------|------|------|----------|----------|
| **yfinance** | Python Lib | 台美股指數、即時報價 | 無限制 | - |
| **Finnhub** | API | 美股即時行情、財務報表 | 60/分鐘 | `FINNHUB_API_KEY` |
| **Tiingo** | API | 高品質歷史 K 線 | 500/月 | `TIINGO_API_KEY` |
| **Fugle** | API | 台股即時/歷史行情 | 60/分鐘 | `FUGLE_API_KEY` |
| **Alpha Vantage** | API | 技術指標、外匯 K 線 | 25/天 | `ALPHA_VANTAGE_API_KEY` |

### 1.3 V10.0 宏觀數據源 (130+ 指標)

#### 美國宏觀指標 (60+ 項)

| 類別 | 指標數量 | 主要來源 |
|------|----------|----------|
| **利率與貨幣政策** | 9 項 | FRED (FEDFUNDS, DGS10, DGS2 等) |
| **通貨膨脹** | 7 項 | FRED (CPIAUCSL, CPILFESL, PCE 等) |
| **就業與勞動市場** | 7 項 | FRED (UNRATE, PAYEMS, ICSA 等) |
| **經濟成長** | 9 項 | FRED (GDP, PCE, IPMAN 等) |
| **信心指數** | 5 項 | FRED (UMICHCSI, CCSA 等) |
| **風險與國際** | 2 項 | FRED (VIXCLS, BAA10Y) |

#### 台灣宏觀指標 (40+ 項)

| 類別 | 指標數量 | 主要來源 |
|------|----------|----------|
| **景氣循環** | 4 項 | 國發會 (景氣燈號、領先指標) |
| **國民所得** | 3 項 | 主計總處 (GDP 季增/年增) |
| **物價** | 3 項 | 主計總處 (CPI, PPI) |
| **勞動市場** | 3 項 | 主計總處 (失業率、薪資) |
| **貨幣與利率** | 4 項 | 央行 (M1B, M2, 重貼現率) |
| **匯率** | 4 項 | 央行、台銀 (USD/TWD 等) |
| **對外貿易** | 2 項 | 財政部 (進出口統計) |
| **電力景氣 (EPI)** | 1 項 | 台綜院 (獨家) |
| **PMI 採購經理人** | 1 項 | 中經院 (獨家) |

#### 全球宏觀指標 (30+ 項)

| 區域 | 指標數量 | 主要來源 |
|------|----------|----------|
| **中國** | 10 項 | 國家統計局、中國人民銀行 |
| **日本** | 8 項 | 日本統計局、日本銀行 |
| **歐元區** | 8 項 | Eurostat、歐洲央行 |
| **全球整合** | 5 項 | IMF、OECD、世界銀行 |

### 1.4 V10.0 13F 機構持倉 (11 家)

| 機構名稱 | 追蹤價值 | 特色 |
|----------|----------|------|
| **橋水基金 (Bridgewater)** | 全球宏觀避險之王 | 對抗通膨與經濟衰退配置 |
| **波克夏海瑟威 (Berkshire)** | 價值投資典範 | 巴菲特持倉、長線布局 |
| **文藝復興 (Renaissance)** | 量化交易鼻祖 | 科技股與數學模型趨勢 |
| **Ark Invest** | 破壞式創新 | 創新投資風向球 |
| **Two Sigma** | 量化對沖 | 數據驅動策略 |
| **Citadel** | 對沖基金巨頭 | 多元化投資策略 |
| **D. E. Shaw** | 量化先驅 | 高頻交易與科技 |
| **AQR Capital** | 量化資管 | 風險溢酬策略 |
| **Millennium Management** | 對沖基金 | 多元化 alpha 來源 |
| **Point72 Asset Management** | 對沖基金 | 長期資本增值 |
| **Soros Fund Management** | 宏觀對沖 | 喬治·索羅斯 |

### 1.5 台灣官方數據源

| 來源 | 數據類型 | API 端點 | 更新頻率 |
|------|----------|----------|----------|
| **TWSE 臺灣證券交易所** | 上市股票行情 | `/v1/exchangeReport/STOCK_DAY_ALL` | 每日 18:00 |
| | | 三大法人買賣超 | `/v1/exchangeReport/TWT38U_ALL` | 每日 15:00 |
| | | 融資融券餘額 | `/v1/exchangeReport/MI_MARGN` | 每日 16:00 |
| **TPEX 櫃檯買賣中心** | 上櫃股票行情 | `/v1/tpex_mainboard_quotes` | 每日 18:00 |
| **TDCC 集保結算所** | 股權分散表 | `/opendata/balance_certification` | 每週五 |
| **TAIFEX 期交所** | 期權/衍生品 | `/v1/DailyInstitutionalTrades` | 每日 15:00 |

---

## 2. API Key Pool 智能治理 (V10.0)

### 2.1 多 Key Pool 管理器

```python
# V10.0 API Key Pool 管理器 (定義)

class APIKeyPoolManager:
    """API Key Pool 智慧路由管理器 - V10.0"""
    
    def __init__(self, api_keys: List[str]):
        self.keys = api_keys
        self.key_status: Dict[str, APIKeyStatus] = {}
        self.current_index = 0
        self.lock = asyncio.Lock()
    
    async def get_healthy_key(self, model: str) -> str:
        """取得可用的 API Key"""
        # 策略：
        # 1. 循環選擇 Key
        # 2. 檢查健康狀態
        # 3. 檢查配額
        # 4. 故障轉移
        pass
    
    async def update_quota(self, key_id: str, model: str, used: int):
        """更新配額"""
        pass
```

### 2.2 配額監控閾值

| 模型/服務 | 每日閾值 | 警報閾值 | 備用策略 |
|-----------|----------|----------|----------|
| **Gemini-1.5-Pro** | 1500 次 | 100 次 | 切換至 Flash |
| **Gemini-1.5-Flash** | 15000 次 | 1000 次 | 切換至 Lite |
| **Finnhub** | 86400 次 | 1000 次 | 切換至備援源 |
| **FRED** | 1000 次 | 100 次 | 降級查詢頻率 |
| **Tiingo** | 500 次 | 50 次 | 批量合併請求 |

---

## 3. 爬蟲風險管控 (Anti-Bot & Web Scraping)

### 3.1 爬蟲配置策略

| 數據源 | 請求間隔 | User-Agent 輪詢 | Stealth 模式 | 失敗備援 |
|--------|----------|-----------------|--------------|----------|
| **PTT Stock** | 5-10 秒 | ✅ | ✅ (playwright-stealth) | 返回快取 |
| **CNN Fear & Greed** | 60 秒 | ✅ | ✅ | 返回歷史值 |
| **EPI 台綜院** | 600 秒 | ✅ | ✅ | 返回上月數據 |
| **PMI 中經院** | 600 秒 | ✅ | ✅ | 返回歷史均值 |
| **TWSE 公開API** | 0.3 秒 | - | - | - |

### 3.2 反封鎖機制

```python
# V10.0 反封鎖管理器 (定義)

class AntiBotManagerV10:
    """V10.0 反封鎖管理器"""
    
    def __init__(self):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        ]
        self.blocked_ips = set()
    
    async def get_page(self, url: str) -> Optional[str]:
        """取得頁面內容 (繞過 Bot 檢測)"""
        # 1. 隨機 User-Agent
        # 2. 隨機延遲 3-10 秒
        # 3. playwright-stealth 繞過
        # 4. 失敗時切換代理
        pass
```

---

## 4. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [03_Data_Management_and_Database.md](03_Data_Management_and_Database.md) | 資料庫設計 | 數據存儲 Schema |
| [05_Quant_Theory_and_Calculations.md](05_Quant_Theory_and_Calculations.md) | 量化理論 | 宏觀因子計算 |
| [06_Automation_and_Prefect_Workflow.md](06_Automation_and_Prefect_Workflow.md) | 工作流自動化 | 數據獲取排程 |

---

> **文件版本**：v1.0.0
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師
> **最後更新**：2026-02-10

