# 📖 AI 報告詳情頁開發文檔

## 1. 功能概述 (Overview)
本模組提供使用者閱讀完整「AI 多空辯論報告」的介面。透過 Markdown 渲染引擎，將 AI 生成的結構化分析轉化為易讀的各種圖文格式。

## 2. 技術架構 (Architecture)

### 核心元件
| 元件 | 路徑 | 職責 |
|:---|:---|:---|
| **Page Root** | `app/ai/[id]/page.tsx` | 負責數據獲取 (Server-side Fetching) 與主佈局。 |
| **Renderer** | `react-markdown` | 將純文本 Markdown 轉化為 HTML。 |
| **Plugins** | `remark-gfm` | 支援表格 (Tables)、刪除線等 GitHub 風格語法。 |
| **Styling** | `@tailwindcss/typography` | 自動排版文章樣式 (Prose)，搭配 Glassmorphism 背景。 |

### 資料流 (Data Flow)
1.  User 點擊 Dashboard `$Link`。
2.  Next.js Server 接收請求 (`params.id`)。
3.  `supabase.from('ai_reports').select('*').eq('id', id).single()`。
4.  渲染 HTML 並回傳 (ISR Revalidate: 60s)。

## 3. UI 設計規範 (UI/UX)
*   **Article Layout**: 限制最大寬度 (`max-w-4xl`) 以提升閱讀體驗。
*   **Typography**: 使用 `prose-lg` 與 `prose-invert` (Dark Mode)。
*   **Visual Hierarchy**:
    *   H1: 漸層標題
    *   Summary: 獨立的 Glass Card + Cyan Border
    *   Content: 標準文章排版

## 4. API 參考
無公開 API，內部使用 Supabase Direct Query。
