# 007_RESTful API 設計規範

**文件編號**：API-V10.0-001
**版本**：2.0.0
**建立日期**：2026-02-25
**核心架構**：Supabase (PostgREST) + Kong Gateway

---

## 1. 通訊基礎規格

### 1.1 端點基址 (Base URLs)
*   **本地開發**: `http://localhost:8000/rest/v1/`
*   **NAS 生產**: `https://nas-ip:8443/rest/v1/`

### 1.2 傳輸安全性
*   強制使用 **HTTPS (TLS 1.3)** 進行數據傳輸。
*   所有 API 請求必須包含 `apikey` 標頭以通過 Kong 門鎖。

---

## 2. 請求規範 (Request)

### 2.1 標頭 (Headers)
| 標頭項目 | 規格範例 | 說明 |
| :--- | :--- | :--- |
| `apikey` | `eyJhbGci...` | Supabase 公鑰 (Anon Key) |
| `Authorization` | `Bearer <JWT>` | 用戶登入後取得之權限令牌 |
| `Content-Type` | `application/json` | 預設交互格式 |
| `Prefer` | `return=representation` | (PostgREST) 要求寫入後回傳完整實體 |

### 2.2 參數傳遞 (Filtering & Sorting)
由於採用 PostgREST，查詢參數遵循其語句規範：
*   **篩選**: `?stock_code=eq.2330`
*   **區間**: `?trade_date=gte.2024-01-01&trade_date=lte.2024-01-31`
*   **排序**: `?order=trade_date.desc`
*   **分頁**: `?limit=100&offset=0`

---

## 3. 回應規範 (Response)

### 3.1 成功狀態碼
*   `200 OK`: 查詢成功。
*   `201 Created`: 新增成功。
*   `204 No Content`: 更新或刪除成功（無回傳實體時）。

### 3.2 錯誤處理
系統採用標準 HTTP 狀態碼配合 JSON 錯誤體：
```json
{
  "code": "42P01",
  "details": null,
  "hint": null,
  "message": "relation \"public.non_existent_table\" does not exist"
}
```

---

## 4. 速率限制與安全 (Rate Limiting)

1.  **Kong 限流**: 預設單一 IP 每秒限制 30 次請求。
2.  **CORS 政策**: 僅允許來源為 `frontend` 容器之網域進行跨域請求。
3.  **RLS (Row Level Security)**: 
    - 數據層級的權限交由 PostgreSQL 執行。
    - 未經認證之請求（Anon Role）僅能讀取 `public` 行情數據，無法讀取 `portfolios` 數據。

---
**文件結束**
