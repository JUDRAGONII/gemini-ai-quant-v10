---
description: 啟動 AI 投資分析儀 V10.0 開發環境
---

# 🚀 上工了 (Start Work) - V10.0

請依照以下步驟啟動開發環境：

1. **環境檢查 (Pre-flight Check)**
   - 檢查 `.env` 是否存在且包含必要 Key (GEMINI_API_KEY, SUPABASE_URL)。
   - **[NEW]** 檢查 `NEXT_PUBLIC_SUPABASE_URL` 與 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否存在於 `.env` 中 (前端連線必要)。
   - **[NEW]** 檢查 `frontend/.env.local` 是否存在 (敏感變數隔離)。
   - **[NEW]** 檢查 Port 3000 (Frontend) 與 Port 8000 (Supabase/Kong) 是否未被佔用 (`netstat -ano | findstr "3000"`).
   - 檢查 Docker Engine 是否運行中。

2. **啟動容器 (Container Startup)**
   // turbo
   - 執行 `docker-compose up -d` 啟動所有服務 (Supabase, Worker, Frontend)。
   - 等待 10-15 秒讓資料庫完成初始化。

3. **健康檢測 (Health Check)**
   - 檢查 `ai-worker` 容器日誌，確認 "Scheduler Started" 或無重大錯誤。
   - 檢查 `ai-frontend` 容器，確認 Port 3000 已監聽。

4. **狀態匯報 (Report)**
   - 告知使用者目前系統狀態 (Frontend URL: http://localhost:3000)。
   - 讀取 `doc/PCM/0-1_DEV_SUMMARY.md`，列出今日待辦事項。
