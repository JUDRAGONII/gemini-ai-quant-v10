# 043_Phase7_Infrastructure_Boost (前端恢復與 Studio 部署)

## 1. 需求解構 (Thinking Phase)
- **問題 1：前端進不去**
    - **診斷**：根據 `ERR_CONNECTION_REFUSED` 截圖，開發伺服器未在 3000 端口監聽。可能是因先前清理 `node` 進程後未正確重啟。
- **問題 2：本地 Studio 部署**
    - **目標**：在 Docker Compose 中補全 Supabase Studio 及其相依服務 `postgres-meta`。
    - **挑戰**：`latest` 標籤在本地 Docker Hub 解析失敗。

## 2. 方案設計 與 執行 (Execution Phase)
### 2.1 基礎設施升級 (Infrastructure)
- **版本校準**：
    - `meta`: 改用穩定版 `supabase/postgres-meta:v0.84.2` 並成功 Pull。
    - `studio`: 使用 `supabase/studio:latest`。
- **配置變更**：
    - 在 `docker-compose.yml` 中新增 `meta` 與 `studio` 服務。
    - 將 Studio 映射至專屬開發端口 **`54323`**。
- **部署指令**：
    ```bash
    docker-compose up -d meta studio
    ```

### 2.2 前端恢復 (Frontend)
- **執行重啟**：在 `frontend` 目錄下執行 `npm run dev`。
- **狀態確認**：
    - Next.js 14.0.4 成功啟動。
    - 端口 `3000` 恢復連線。

## 3. 驗收與結果 (Verification)
- **容器狀態**：`supabase-studio` 與 `supabase-meta` 均正常運行中。
- **介面訪問**：
    - [前端首頁](http://localhost:3000) -> 恢復連線。
    - [Studio 儀表板](http://localhost:54323) -> 成功加載。

## 4. 後續計畫
- **安全性檢查**：確保外部網路無法直連 54323 端口。
- **功能連動**：開始將 Studio 獲取的即時數據反饋至前端「數據監控中心」。
