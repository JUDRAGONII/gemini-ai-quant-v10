# Phase 9.1：AI 多維度選股引擎詳細實作計畫

**計畫編號**：033
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段**：Phase 9.1 (AI Screener)
**關聯任務**：T-AI-009
**狀態**：規劃中 (Planning)

---

## 一、計畫核心目標

實作一個支持「技術面 + 籌碼面 + AI 預測」交叉核驗的選股引擎，讓用戶能從 1,360 萬筆數據中精確鎖定符合策略的標的。

---

## 二、後端實作規格 (Backend)

### 2.1 資料庫查詢邏輯
*   **目標**: 針對 `stock_factors` 的 `factors_all` JSONB 欄位進行高效動態查詢。
*   **SQL 策略**: 利用 PostgreSQL 的 `->>` 操作符與 GIN 索引進行篩選。

### 2.2 存儲庫層 (`backend/db/repositories/screener_repo.py`)
```python
class ScreenerRepository:
    async def filter_stocks(self, filters: Dict[str, Any], limit: int = 50):
        """
        filters 範例: 
        {
          "rsi_14": {"gt": 70},
          "predicted_alpha": {"gt": 0.02},
          "inst_buy_days": {"gte": 3}
        }
        """
        # 動態構建 SQL:
        # SELECT * FROM stock_factors 
        # WHERE (factors_all->>'rsi_14')::float > 70 
        # AND (factors_all->>'predicted_alpha')::float > 0.02
```

---

## 三、API 設計 (FastAPI)

### 3.1 選股端點 (`POST /api/v1/screener/filter`)
*   **Request Schema**:
    ```python
    class ScreenerFilter(BaseModel):
        technical: Optional[Dict[str, Any]]
        chips: Optional[Dict[str, Any]]
        ai: Optional[Dict[str, Any]]
        sort_by: str = "predicted_alpha"
        order: str = "desc"
        limit: int = 50
    ```

---

## 四、前端 UI/UX 設計 (Frontend)

### 4.1 選股控制面板 (`components/Screener/FilterPanel.tsx`)
*   **視覺**: Glassmorphism 側邊欄。
*   **交互**: 步進式滑桿 (Sliders) 與多選框 (Checkboxes)。
*   **預設策略**: 「飆股模式」、「籌碼集中」、「AI 看多」。

### 4.2 虛擬化數據表格 (`components/Screener/ScreenerTable.tsx`)
*   **庫**: 使用 `react-window` 或 `tanstack-table`。
*   **特性**: 
    *   **Sparklines**: 在表格內嵌小型的週漲跌走勢圖。
    *   **Badges**: 為 AI 評分提供動態發光標籤。

---

## 五、執行步驟 (Action Plan)

1.  **後端基礎**: 實作 `ScreenerRepository` 動態查詢。
2.  **API 開發**: 完成 `/filter` 路由。
3.  **前端框架**: 建立 `/screener` 頁面與基礎 Layout。
4.  **組件實作**: 完成 FilterPanel 與 ScreenerTable。
5.  **整合驗證**: 測試複雜條件下的查詢速度與數據精度。

---

**文件結束**
*計畫編號：033*
