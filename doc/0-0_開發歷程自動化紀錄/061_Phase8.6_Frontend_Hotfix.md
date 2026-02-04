# 061_Phase8.6_Frontend_Hotfix.md

## 📅 日期: 2026-02-02
## 🏷️ 標籤: #Hotfix #SyntaxError #NextJS #JSX

---

## 🚩 問題現象
在執行全站視覺統一 (Phase 8.6) 的過程中，由於多次使用 `multi_replace_file_content` 進行組件刪除，導致 `ai/search/page.tsx` 等檔案出現 `Unexpected token div` 的編譯錯誤，前端頁面呈現 Failed to compile。

## 🔍 根本原因分析
1. **多行替換殘留**: 在移除 `ProButton` 與 `Breadcrumb` 區塊時，由於上下文比對不夠精確，部分檔案在 `return (` 後方殘留了空格或非法字元（如反引號）。
2. **JSX 結構毀損**: 編輯過程中不慎影響了括號的閉合結構，導致 Next.js 解析器無法識別標籤。

## 🛠️ 修復方案
- **全面重寫 (Total Rewrite)**: 放棄局部替換，改用 `write_to_file` 直接寫入完整的、經過校準的 TSX 代碼。
- **檔案範圍**: 
    - [ai/search/page.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/ai/search/page.tsx)
    - [ai/strategy/page.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/ai/strategy/page.tsx)
    - [portfolios/page.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/portfolios/page.tsx)
- **視覺規範**: 在修復語法同時，確保「標題漸層、圓角、雙語」等精品 UI 要求完全保留。

## ✅ 驗證結果
- 已執行 `docker-compose restart frontend`。
- 本地開發環境編譯檢查中。

## 💡 經驗教訓
- 在進行大範圍 UI 動手腳時，`write_to_file` 比頻繁的 `replace` 更具原子性與安全性，能避免殘留字元。
- 編輯前後應執行 `npm run build` 或觀察 Dev Server 日誌（雖然容器環境較難即時察覺）。

---
決。
