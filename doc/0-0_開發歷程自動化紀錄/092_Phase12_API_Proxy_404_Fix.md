# 092_Phase12_API_Proxy_404_Fix.md

## 1. 任務概要
- **功能名稱**：修復 Docker 容器內 API 代理 404 路由錯誤
- **目標**：消除因前端缺少 Rewrite 規則與硬編碼 URL 導致的全站 API 不可達問題。

## 2. 核心變更
### 根本原因
三層故障疊加：
1. `next.config.mjs` 缺少 `rewrites()` 代理配置。
2. `backend/api/main.py` 遺漏 `macro` 路由器註冊。
3. 7 處前端組件硬編碼 `localhost:8001`，在 Docker 容器內解析為自身。

### 修復清單
| 檔案 | 修改內容 |
|------|---------|
| `next.config.mjs` | 新增 6 組 rewrites 規則，使用 `BACKEND_URL` 環境變數 |
| `main.py` | 註冊 `macro` 路由器 |
| `useInsights.ts` | 改為相對路徑 |
| `EconomicCalendar.tsx` | 改為相對路徑 |
| `DialecticPanel.tsx` | 改為相對路徑 |
| `CorrelationChart.tsx` | 改為相對路徑 |
| `TacticalPlanner.tsx` | 3 處硬編碼改為相對路徑 |

## 3. 驗證結果
- ✅ 後端直連 `http://localhost:8001/api/v1/alerts/count` → `{"unread_count": 3}`
- ✅ 前端代理 `http://localhost:3300/api/v1/alerts/count` → `{"unread_count": 3}`
- ✅ AI 辯證 `http://localhost:8001/api/v1/insights/dialectic/2330` → 正常返回三方辯論結果
- ✅ 宏觀日曆 `http://localhost:8001/api/v1/macro/calendar` → 正常返回經濟事件
