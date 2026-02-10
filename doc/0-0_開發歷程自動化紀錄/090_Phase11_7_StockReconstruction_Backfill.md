# 090_Phase11_7_StockReconstruction_Backfill.md

## 1. 任務概要
- **專案里程碑**：Phase 11.3 (Infrastructure & Data Recovery)
- **核心目標**：重建標的主檔，執行 1990+ 全歷史數據回補 (台股/美股/宏觀/匯率)。
- **執行策略**：跨世代雙軌制 (Yahoo Finance 1990-2010 + TWSE Official 2010+)。

## 2. 實作細節
### 2.1 基礎設施加固
- **匯率表重建**：建立 `exchange_rates` 表，採用 11.6 最新規格 (`base_currency`, `target_currency`, `trade_date`)。
- **標的主檔初始化**：執行 `init_stock_list.py`，成功導入 1125 筆核心標的。

### 2.2 核心回補任務 (並行執行中)
| 任務 | 腳本 | 進度 | 數據源 |
| :--- | :--- | :--- | :--- |
| **宏觀數據** | `backfill_macro.py` | 執行中 (1990+) | FRED |
| **匯率數據** | `backfill_currency.py` | 執行中 (1990+) | Yahoo |
| **標的行情** | `backfill_manager.py` | 執行中 (1990+) | Hybrid (Yahoo/TWSE) |

## 3. 關鍵修正 (Hotfixes)
- **HybridFetcher 優化**：修正美股回補起點 logic，確保正確下探至 1990。
- **CurrencyFetcher 修復**：修正遺漏 `pandas` 引用導致的崩潰。

## 4. 驗證現狀
- **標的總數**：1125 筆。
- **核心服務**：正常運行於 Port 8000/3000。
- **監控中心**：可透過 `/admin/monitor` 即時查看回補狀態。
