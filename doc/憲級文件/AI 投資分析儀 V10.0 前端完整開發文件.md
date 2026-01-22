
# AI 投資分析儀 V10.0 前端完整開發文件

## 私有化部署人工智慧投資分析系統之前端應用程式

---

**文件編號**：SYS-FRONTEND-001
**版本**：5.0.0
**密級**：內部參考
**建立日期**：2026年2月15日
**文件狀態**：正式發布
**適用對象**：前端開發人員、UI/UX 設計師、系統整合人員

---

## 版本控制紀錄

| 版本 | 日期 | 修訂人 | 修訂內容 | 核准人 |
|------|------|--------|----------|--------|
| 1.0.0 | 2026-02-01 | 前端架構師 | 初始版本，建立前端架構框架 | 系統架構師 |
| 2.0.0 | 2026-02-05 | 前端架構師 | 完成核心元件與頁面規劃 | 技術總監 |
| 3.0.0 | 2026-02-10 | 前端架構師 | 整合 API 服務與狀態管理 | 專案經理 |
| 4.0.0 | 2026-02-12 | 前端架構師 | 完成圖表與數據視覺化元件 | 系統架構師 |
| 5.0.0 | 2026-02-15 | 前端架構師 | 完整前端開發文件定稿 | 專案經理 |
| 6.0.0 | 2026-02-20 | 系統架構師 | **架構重大修正**：從 Vue.js 3 遷移至 Next.js 14 | 系統主理人 |

---

> [!IMPORTANT]
> **架構轉型聲明 (Architecture Pivot Notice - 2026-02-20)**
> 本文件原定義之 Vue.js 3 + Element Plus 體系已正式廢棄。**AI 投資分析儀 V10.0 全面採用 Next.js 14 (App Router) + Tailwind CSS 作為核心憲級技術棧。**
> 後文若涉及 `.vue` 元件、`Pinia`、`Vite` 等技術描述，除邏輯參考外，具體實作應以 Next.js 規範為準。

---

## 目錄

第一章：前端架構總覽
第二章：專案結構與目錄規範
第三章：核心框架配置
第四章：通用元件層
第五章：業務元件層
第六章：頁面視圖層
第七章：API 服務層
第八章：狀態管理層
第九章：樣式與主題系統
第十章：圖表與數據視覺化
第十一章：效能優化策略
第十二章：測試與品質保證
第十三章：建置與部署

---

## 第一章：前端架構總覽

### 1.1 架構設計原則

AI 投資分析儀 V10.0 前端應用程式採用現代化的 Web 架構，基於 **Next.js 14 (App Router)** 框架構建，遵循服務端優先、元件化、極致效能的設計原則。本架構設計充分考量了金融投資分析系統的特點，包括大量數據流傳輸、複雜的金融圖表呈現、以及 AI 串流輸出之互動需求。

在前端技術選型方面，核心框架選用 **Next.js 14**，利用其 **Server Components (RSC)** 縮短首屏載入時間並強化數據安全。樣式系統選用 **Tailwind CSS** 以實現高度自定義的「WOW Design (Glassmorphism)」風格。狀態管理機制主要依賴 **Server Context** 與用戶端的 **React Hooks**，避免過度工程化。UI 圖標庫使用 **Lucide React**，圖表核心選用 **Recharts** 提供高品質金融視覺化。

在架構模式方面，系統採用 Next.js 推薦的 **App Router** 模式，將頁面劃分為服務端組件（負責數據 fetch 與私密邏輯）與用戶端組件（負責動態互動）。在資料對接方面，直接透過 **Supabase Client SDK** 進行高效數據存取，減少不必要的 API 中轉層層級。

### 1.2 功能模組劃分

前端應用程式的功能模組按照業務領域進行劃分，每個模組包含其特有的頁面、元件、服務與狀態。

第一個功能模組為儀表板模組，提供系統的首頁與概覽功能。該模組包含投資組合總覽、關鍵指標卡片、近期市場動態、以及快捷功能入口。該模組的技術特點為高頻數據更新、卡片式佈局、即時通知機制。

第二個功能模組為行情分析模組，提供市場行情的查詢與分析功能。該模組包含個股行情查詢、技術指標圖表、產業分類瀏覽、以及自選股管理。該模組的技術特點為大量圖表渲染、大數據量表格處理、即時行情更新。

第三個功能模組為宏觀數據模組，提供宏觀經濟指標的追蹤與分析功能。該模組包含指標瀏覽與搜尋、指標趨勢圖、經濟日曆、以及多指標比較。該模組的技術特點為時間序列數據處理、多維度篩選、圖表互動功能。

第四個功能模組為籌碼分析模組，提供籌碼與機構數據的分析功能。該模組包含融資融券分析、三大法人買賣超、選擇權部位分析、以及 13F 機構持倉。該模組的技術特點為多來源數據整合、階層式數據呈現、比較分析功能。

第五個功能模組為 AI 分析模組，提供人工智慧投資分析功能。該模組包含 AI 評分排行、個股 AI 評分、AI 投資報告、以及語義搜尋功能。該模組的技術特點為複雜評分計算、報告生成、向量搜尋介面。

第六個功能模組為系統設定模組，提供系統設定與用戶管理功能。該模組包含用戶設定、主題切換、數據管理、以及帳號安全。該模組的技術特點為表單處理、本地存儲整合、權限控制。

### 1.3 目標瀏覽器與相容性

前端應用程式支援以下目標瀏覽器與環境。

在桌面瀏覽器方面，Google Chrome 最新版與前兩個主要版本為完全支援。Mozilla Firefox 最新版與前兩個主要版本為完全支援。Microsoft Edge 最新版與前兩個主要版本為完全支援。Apple Safari 最新版與前兩個主要版本為基本支援。

在行動瀏覽器方面，iOS Safari 最新版與前兩個主要版本為基本支援。Android Chrome 最新版與前兩個主要版本為基本支援。

在解析度支援方面，桌面端支援 1920×1080 及其以上解析度。筆記型電腦端支援 1366×768 與 1440×900 解析度。平板端支援 768×1024 與 1024×768 解析度。響應式設計確保在各種解析度下都能正常顯示。

---

## 第二章：專案結構與目錄規範

### 2.1 專案根目錄結構

AI 投資分析儀 V10.0 前端專案採用 Next.js 14 標準結構，優化了數據流與元件邊界。

```
ai-invest-frontend/
├── app/                             # App Router 核心路由
│   ├── (auth)/                      # 認證相關路由
│   ├── ai/                          # AI 報告與排行
│   ├── chips/                       # 籌碼分析
│   ├── macro/                       # 宏觀指標
│   ├── stocks/                      # 個股查詢
│   └── layout.tsx                   # 全域配置與導航
├── components/                      # UI 元件層
│   ├── charts/                      # Recharts 封裝組件
│   ├── ui/                          # 基礎 UI 原子組件
│   └── ...                          # 業務相關組件
├── lib/                             # 工具與配置
│   ├── supabase.ts                  # Supabase SDK 單例
│   └── utils.ts                     # 通用工具函式 (clsx, twMerge)
├── public/                          # 靜態資源目錄
├── __tests__/                       # Jest / Playwright 測試
├── next.config.js                   # Next.js 配置
├── tailwind.config.ts               # Tailwind CSS 設計體系
└── tsconfig.json                    # TypeScript 編譯配置
```

### 2.2 API 服務層目錄結構

API 服務層負責與後端 API 的通信，按照功能模組組織 API 端點的定義。

```
src/api/
├── index.ts                         # API 統一出口
├── request.ts                       # axios 封裝與攔截器
├── types.ts                         # API 響應類型定義
│
├── stocks/                          # 行情相關 API
│   ├── index.ts                     # API 出口
│   ├── types.ts                     # 請求與響應類型
│   └── stock.ts                     # 個股行情 API
│
├── macro/                           # 宏觀數據相關 API
│   ├── index.ts                     # API 出口
│   ├── types.ts                     # 請求與響應類型
│   └── macro.ts                     # 宏觀指標 API
│
├── chips/                           # 籌碼數據相關 API
│   ├── index.ts                     # API 出口
│   ├── types.ts                     # 請求與響應類型
│   └── chips.ts                     # 籌碼分析 API
│
├── ai/                              # AI 分析相關 API
│   ├── index.ts                     # API 出口
│   ├── types.ts                     # 請求與響應類型
│   ├── score.ts                     # AI 評分 API
│   └── report.ts                    # AI 報告 API
│
└── user/                            # 用戶相關 API
    ├── index.ts                     # API 出口
    ├── types.ts                     # 請求與響應類型
    └── auth.ts                      # 認證 API
```

### 2.3 通用元件目錄結構

通用元件層存放可復用的 UI 元件，按照功能類別組織。

```
src/components/
├── Base/                            # 基礎元件
│   ├── BaseButton.vue               # 按鈕元件
│   ├── BaseInput.vue                # 輸入框元件
│   ├── BaseSelect.vue               # 選擇器元件
│   ├── BaseCard.vue                 # 卡片元件
│   ├── BaseDialog.vue               # 對話框元件
│   └── BaseLoading.vue              # 載入指示器
│
├── Chart/                           # 圖表元件
│   ├── LineChart.vue                # 折線圖
│   ├── CandlestickChart.vue         # K線圖
│   ├── BarChart.vue                 # 柱狀圖
│   ├── PieChart.vue                 # 餅圖
│   └── ComposedChart.vue            # 組合圖表
│
├── Table/                           # 表格元件
│   ├── DataTable.vue                # 數據表格
│   ├── SortableTable.vue            # 可排序表格
│   ├── PaginatedTable.vue           # 分頁表格
│   └── ExpandableTable.vue          # 可展開表格
│
├── Form/                            # 表單元件
│   ├── SearchForm.vue               # 搜尋表單
│   ├── DateRangePicker.vue          # 日期區間選擇器
│   ├── StockSelector.vue            # 股票選擇器
│   └── IndicatorSelector.vue        # 指標選擇器
│
└── Layout/                          # 布局元件
    ├── PageHeader.vue               # 頁面標題
    ├── TabNavigation.vue            # 標籤導航
    └── StatsCard.vue                # 統計卡片
```

### 2.4 頁面元件目錄結構

頁面元件層存放各功能模組的頁面元件，每個頁面作為路由的目標。

```
src/pages/
├── index.vue                        # 首頁/儀表板
│
├── stocks/                          # 行情分析模組
│   ├── index.vue                    # 股票清單頁
│   ├── detail.vue                   # 個股詳情頁
│   ├── chart.vue                    # 技術圖表頁
│   └── watcher.vue                  # 自選股頁面
│
├── macro/                           # 宏觀數據模組
│   ├── index.vue                    # 指標列表頁
│   ├── indicator.vue                # 指標詳情頁
│   ├── calendar.vue                 # 經濟日曆頁
│   └── comparison.vue               # 指標比較頁
│
├── chips/                           # 籌碼分析模組
│   ├── margin.vue                   # 融資融券頁
│   ├── institution.vue              # 三大法人頁
│   └── options.vue                  # 選擇權分析頁
│
├── ai/                              # AI 分析模組
│   ├── ranking.vue                  # AI 評分排行頁
│   ├── score.vue                    # 個股評分頁
│   ├── report.vue                   # AI 報告頁
│   └── search.vue                   # 語義搜尋頁
│
├── settings/                        # 系統設定模組
│   ├── index.vue                    # 設定首頁
│   ├── profile.vue                  # 個人資料
│   ├── preferences.vue              # 偏好設定
│   └── security.vue                 # 安全設定
│
└── login.vue                        # 登入頁
```

### 2.5 命名規範

前端專案遵循一致的命名規範，確保程式碼的可讀性與可維護性。

檔案命名方面，Vue 元件檔案採用 PascalCase 命名法，例如 BaseButton.vue、StockDetail.vue。普通腳本檔案採用 camelCase 命名法，例如 request.ts、utils.ts。樣式檔案採用 kebab-case 命名法，例如 global.scss、variables.scss。配置檔案維持其本身慣例，例如 .eslintrc.js、tsconfig.json。

類別命名方面，介面與類型採用 PascalCase 命名法並以 I 開頭，例如 IStockData、IApiResponse。列舉類型採用 PascalCase 命名法，例如 StockMarket、DataFrequency。Store 採用 PascalCase 命名法，例如 useStockStore、useUserStore。

變數與函式命名方面，變數採用 camelCase 命名法，例如 stockCode、currentPage。常數採用 UPPER_SNAKE_CASE 命名法，例如 API_BASE_URL、PAGE_SIZE。函式採用 camelCase 命名法，例如 fetchStockData、formatCurrency。

---

## 第三章：核心框架配置

### 3.1 入口檔案結構

入口檔案 main.ts 是 Vue 應用程式的起點，負責初始化應用程式所需的所有模組。

```typescript
// src/main.ts

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhTw from 'element-plus/dist/locale/zh-tw.min.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { setupPermission } from './router/permission'

import './styles/index.scss'

// 創建 Vue 應用程式實例
const app = createApp(App)

// 安裝 Pinia 狀態管理
app.use(createPinia())

// 安裝 Vue Router
app.use(router)

// 安裝 Element Plus UI 框架
app.use(ElementPlus, {
  locale: zhTw,
  size: 'default',
  zIndex: 3000,
})

// 全局註冊 Element Plus 圖示
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 路由權限控制
setupPermission(router)

// 全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err)
  console.error('Component:', vm)
  console.error('Error info:', info)
}

// 全局屬性配置
app.config.globalProperties.$filters = {
  formatNumber(value: number, decimals = 2): string {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  },
  
  formatCurrency(value: number): string {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
    }).format(value)
  },
  
  formatPercent(value: number, decimals = 2): string {
    if (value === null || value === undefined) return '-'
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
  },
  
  formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
    if (!date) return '-'
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return format.replace('YYYY', String(year)).replace('MM', month).replace('DD', day)
  },
}

// 掛載應用程式
app.mount('#app')
```

### 3.2 根元件結構

App.vue 是應用程式的根元件，負責布局結構與全域狀態的提供。

```vue
<!-- src/App.vue -->
<template>
  <el-config-provider :locale="locale">
    <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
      <!-- 頂部導航欄 -->
      <AppHeader 
        v-if="isLoggedIn"
        :user="user"
        @toggle-sidebar="toggleSidebar"
        @logout="handleLogout"
      />
      
      <!-- 主佈局區域 -->
      <div class="main-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <!-- 側邊欄導航 -->
        <AppSidebar 
          v-if="isLoggedIn"
          :collapsed="sidebarCollapsed"
          :menus="menus"
          :active-menu="activeMenu"
          @menu-click="handleMenuClick"
        />
        
        <!-- 主內容區域 -->
        <main class="content-area">
          <div class="content-wrapper">
            <router-view v-slot="{ Component }">
              <transition name="fade-slide" mode="out-in">
                <keep-alive :include="cachedViews">
                  <component :is="Component" />
                </keep-alive>
              </transition>
            </router-view>
          </div>
          
          <!-- 頁腳 -->
          <AppFooter v-if="isLoggedIn" />
        </main>
      </div>
      
      <!-- 全局提示 -->
      <MessageCenter v-if="isLoggedIn" />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import zhTw from 'element-plus/dist/locale/zh-tw.min.mjs'

import AppHeader from '@/layouts/components/AppHeader.vue'
import AppSidebar from '@/layouts/components/AppSidebar.vue'
import AppFooter from '@/layouts/components/AppFooter.vue'
import MessageCenter from '@/components/Base/MessageCenter.vue'

import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const { user, isLoggedIn } = storeToRefs(userStore)
const { sidebarCollapsed, isDarkMode, cachedViews } = storeToRefs(appStore)

// 語言配置
const locale = ref(zhTw)

// 選單配置
const menus = [
  {
    name: '儀表板',
    path: '/dashboard',
    icon: 'DataDashboard',
    children: [],
  },
  {
    name: '行情分析',
    path: '/stocks',
    icon: 'TrendCharts',
    children: [
      { name: '個股查詢', path: '/stocks/list' },
      { name: '技術圖表', path: '/stocks/chart' },
      { name: '自選股', path: '/stocks/watcher' },
    ],
  },
  {
    name: '宏觀數據',
    path: '/macro',
    icon: 'PieChart',
    children: [
      { name: '指標瀏覽', path: '/macro/list' },
      { name: '經濟日曆', path: '/macro/calendar' },
      { name: '指標比較', path: '/macro/comparison' },
    ],
  },
  {
    name: '籌碼分析',
    path: '/chips',
    icon: 'Histogram',
    children: [
      { name: '融資融券', path: '/chips/margin' },
      { name: '三大法人', path: '/chips/institution' },
      { name: '選擇權分析', path: '/chips/options' },
    ],
  },
  {
    name: 'AI 分析',
    path: '/ai',
    icon: 'Cpu',
    children: [
      { name: '評分排行', path: '/ai/ranking' },
      { name: 'AI 報告', path: '/ai/report' },
      { name: '語義搜尋', path: '/ai/search' },
    ],
  },
]

// 當前激活的選單
const activeMenu = computed(() => {
  const path = route.path
  const topMenu = menus.find(m => path.startsWith(m.path))
  return topMenu?.path || '/dashboard'
})

// 側邊欄切換
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 選單點擊處理
const handleMenuClick = (menu: { name: string; path: string }) => {
  router.push(menu.path)
}

// 登出處理
const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('已成功登出')
    router.push('/login')
  } catch (error) {
    ElMessage.error('登出失敗')
  }
}

// 初始化黑暗模式
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    appStore.setDarkMode(savedTheme === 'dark')
  }
})

// 監聽路由變化，記錄訪問歷史
watch(
  () => route.path,
  (newPath) => {
    document.title = `${route.meta.title || 'AI 投資分析儀'} - AI 投資分析儀 V10.0`
  }
)
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-color-primary);
  
  &.dark-mode {
    --bg-color-primary: #141414;
    --bg-color-secondary: #1d1d1d;
    --text-color-primary: #e0e0e0;
    --text-color-secondary: #a0a0a0;
    --border-color: #333333;
  }
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
  
  &.sidebar-collapsed {
    margin-left: 64px;
  }
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--bg-color-secondary);
}

// 路由過渡動畫
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

### 3.3 TypeScript 配置

tsconfig.json 配置檔案定義了 TypeScript 編譯器的行為設定。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    
    /* 模組解析配置 */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    
    /* JSX 配置 */
    "jsx": "preserve",
    
    /* 嚴格類型檢查 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* 路徑別名配置 */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    
    /* 類型定義 */
    "types": ["vite/client", "element-plus/global"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3.4 Vite 配置

vite.config.ts 配置檔案定義了構建工具的行為設定。

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
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
  
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks: {
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
          'vendor': ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
  
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus', 'echarts'],
  },
})
```

---

## 第四章：通用元件層

### 4.1 基礎按鈕元件

BaseButton.vue 是自定義的按鈕元件，封裝了 Element Plus 按鈕並提供一致的樣式與行為。

```vue
<!-- src/components/Base/BaseButton.vue -->
<template>
  <el-button
    :type="buttonType"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :round="round"
    :circle="circle"
    :plain="plain"
    :text="text"
    :bg="bg"
    @click="handleClick"
  >
    <el-icon v-if="icon && !loading">
      <component :is="icon" />
    </el-icon>
    <span v-if="$slots.default">
      <slot />
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElButton } from 'element-plus'

interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
  loading?: boolean
  disabled?: boolean
  round?: boolean
  circle?: boolean
  plain?: boolean
  text?: boolean
  bg?: boolean
  icon?: string
  variant?: 'solid' | 'outlined' | 'text'
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'default',
  loading: false,
  disabled: false,
  round: false,
  circle: false,
  plain: false,
  text: false,
  bg: false,
  variant: 'solid',
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const buttonType = computed(() => {
  if (props.type !== 'primary') return props.type
  return props.color ? getColorType(props.color) : 'primary'
})

const getColorType = (color: string): 'success' | 'warning' | 'danger' | 'info' => {
  const colorMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    blue: 'primary',
    green: 'success',
    red: 'danger',
    orange: 'warning',
    purple: 'info',
  }
  return colorMap[color] || 'primary'
}

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
.el-button {
  --el-button-bg-color: var(--btn-bg-color);
  --el-button-border-color: var(--btn-border-color);
  --el-button-hover-bg-color: var(--btn-hover-bg-color);
  --el-button-hover-border-color: var(--btn-hover-border-color);
  --el-button-active-bg-color: var(--btn-active-bg-color);
  --el-button-active-border-color: var(--btn-active-border-color);
  --el-button-disabled-bg-color: var(--btn-disabled-bg-color);
  --el-button-disabled-border-color: var(--btn-disabled-border-color);
}
</style>
```

### 4.2 數據表格元件

DataTable.vue 是通用的數據表格元件，支援排序、篩選、匯出等功能。

```vue
<!-- src/components/Table/DataTable.vue -->
<template>
  <div class="data-table-container">
    <!-- 工具欄 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <el-input
          v-if="searchable"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          prefix-icon="Search"
          clearable
          :disabled="loading"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          class="search-input"
        />
      </div>
      <div class="toolbar-right">
        <el-button-group v-if="showRefresh">
          <BaseButton icon="Refresh" @click="handleRefresh" :loading="loading">
            重新整理
          </BaseButton>
        </el-button-group>
        <el-button-group v-if="showExport">
          <BaseButton icon="Download" @click="handleExport('csv')">
            匯出 CSV
          </BaseButton>
          <BaseButton icon="Download" @click="handleExport('xlsx')">
            匯出 Excel
          </BaseButton>
        </el-button-group>
        <el-button-group v-if="showColumnToggle">
          <BaseButton icon="Grid" @click="showColumnDialog = true">
            欄位
          </BaseButton>
        </el-button-group>
      </div>
    </div>
    
    <!-- 表格本體 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      :columns="visibleColumns"
      :stripe="stripe"
      :border="border"
      :size="tableSize"
      :height="tableHeight"
      :max-height="tableMaxHeight"
      :row-key="rowKey"
      :default-sort="defaultSort"
      :sortable="sortable"
      :loading="loading"
      :element-loading-text="loadingText"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @cell-click="handleCellClick"
      class="data-table"
      :class="{ 'small-table': tableSize === 'small' }"
    >
      <!-- 展開列 -->
      <el-table-column
        v-if="expandable"
        type="expand"
        width="48"
      >
        <template #default="{ row }">
          <div class="expand-content">
            <slot name="expand" :row="row" />
          </div>
        </template>
      </el-table-column>
      
      <!-- 多選列 -->
      <el-table-column
        v-if="selectable"
        type="selection"
        width="48"
      />
      
      <!-- 序號列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        :index="indexMethod"
        width="60"
        label="#"
      />
      
      <!-- 數據列 -->
      <template v-for="column in visibleColumns" :key="column.prop">
        <el-table-column
          v-if="!column.hidden"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :sortable="column.sortable || false"
          :align="column.align || 'left'"
          :header-align="column.headerAlign || 'left'"
          :show-overflow-tooltip="column.showOverflowTooltip !== false"
        >
          <template #header>
            <div class="column-header">
              <span>{{ column.label }}</span>
              <el-tooltip
                v-if="column.tooltip"
                :content="column.tooltip"
                placement="top"
              >
                <el-icon class="header-tooltip"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <slot
              :name="`column-${column.prop}`"
              :row="row"
              :value="row[column.prop]"
              :column="column"
            >
              <component
                :is="getCellComponent(column)"
                :value="row[column.prop]"
                :row="row"
                :column="column"
              />
            </slot>
          </template>
        </el-table-column>
      </template>
      
      <!-- 操作列 -->
      <el-table-column
        v-if="actions.length > 0"
        :width="actionWidth"
        fixed="right"
        label="操作"
        align="center"
      >
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button
              v-for="(action, index) in actions"
              :key="index"
              :type="action.type || 'text'"
              :size="tableSize === 'small' ? 'small' : 'default'"
              :disabled="action.disabled?.(row)"
              @click.stop="action.handler(row)"
            >
              <el-icon v-if="action.icon">
                <component :is="action.icon" />
              </el-icon>
              {{ action.label }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分頁 -->
    <div class="table-pagination" v-if="paginated">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="pageSizes"
        :total="pagination.total"
        :layout="paginationLayout"
        :small="tableSize === 'small'"
        background
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 欄位顯示對話框 -->
    <el-dialog
      v-model="showColumnDialog"
      title="選擇顯示欄位"
      width="400px"
    >
      <el-checkbox-group v-model="selectedColumns">
        <el-checkbox
          v-for="col in allColumns"
          :key="col.prop"
          :label="col.prop"
          :value="col.prop"
        >
          {{ col.label }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="showColumnDialog = false">取消</el-button>
        <el-button type="primary" @click="handleColumnToggle">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElTable, ElTableColumn, ElPagination, ElInput, ElButton, ElCheckbox, ElDialog, ElTooltip } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import BaseButton from '@/components/Base/BaseButton.vue'
import { exportToCsv, exportToXlsx } from '@/utils/export'
import NumberCell from './cells/NumberCell.vue'
import PercentCell from './cells/PercentCell.vue'
import CurrencyCell from './cells/CurrencyCell.vue'
import DateTimeCell from './cells/DateTimeCell.vue'
import TrendCell from './cells/TrendCell.vue'

interface Column {
  prop: string
  label: string
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  hidden?: boolean
  tooltip?: string
  type?: 'number' | 'percent' | 'currency' | 'date' | 'datetime' | 'trend' | 'custom'
  format?: string | ((value: any) => string)
  color?: 'positive' | 'negative' | 'neutral'
}

interface Action {
  label: string
  icon?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  handler: (row: any) => void
  disabled?: (row: any) => boolean
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  rowKey?: string
  selectable?: boolean
  expandable?: boolean
  showIndex?: boolean
  sortable?: boolean | 'custom'
  stripe?: boolean
  border?: boolean
  tableSize?: 'large' | 'default' | 'small'
  tableHeight?: string | number
  tableMaxHeight?: string | number
  paginated?: boolean
  pageSizes?: number[]
  total?: number
  currentPage?: number
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  showToolbar?: boolean
  showRefresh?: boolean
  showExport?: boolean
  showColumnToggle?: boolean
  actions?: Action[]
  actionWidth?: number
  loadingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowKey: 'id',
  selectable: false,
  expandable: false,
  showIndex: false,
  sortable: false,
  stripe: true,
  border: false,
  tableSize: 'default',
  paginated: false,
  pageSizes: () => [10, 20, 50, 100],
  total: 0,
  currentPage: 1,
  pageSize: 20,
  searchable: false,
  searchPlaceholder: '搜尋...',
  showToolbar: true,
  showRefresh: true,
  showExport: true,
  showColumnToggle: true,
  actions: () => [],
  actionWidth: 150,
  loadingText: '載入中...',
})

const emit = defineEmits<{
  (e: 'update:search', query: string): void
  (e: 'update:sort', sort: { prop: string; order: string }): void
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'refresh'): void
  (e: 'selection-change', rows: any[]): void
  (e: 'row-click', row: any): void
  (e: 'cell-click', row: any, column: any): void
  (e: 'export', type: 'csv' | 'xlsx'): void
}>()

// 表格參考
const tableRef = ref<InstanceType<typeof ElTable>>()

// 搜尋與分頁
const searchQuery = ref('')
const pagination = ref({
  currentPage: props.currentPage,
  pageSize: props.pageSize,
  total: props.total,
})
const paginationLayout = computed(() => 
  'total, sizes, prev, pager, next, jumper'
)

// 欄位顯示控制
const allColumns = ref<Column[]>([])
const selectedColumns = ref<string[]>([])
const showColumnDialog = ref(false)

// 初始化
onMounted(() => {
  allColumns.value = props.columns
  selectedColumns.value = props.columns
    .filter(col => !col.hidden)
    .map(col => col.prop)
})

// 監聽 props 變化
watch(() => props.data, () => {
  // 數據更新時的處理
}, { deep: true })

watch(() => props.total, (val) => {
  pagination.value.total = val
})

// 可見欄位
const visibleColumns = computed(() => {
  return props.columns.filter(col => 
    selectedColumns.value.includes(col.prop)
  )
})

// 表格數據
const tableData = computed(() => {
  if (props.paginated) return props.data
  return props.data
})

// 索引計算
const indexMethod = (index: number) => {
  const { currentPage, pageSize } = pagination.value
  return (currentPage - 1) * pageSize + index + 1
}

// 獲取單元格元件
const getCellComponent = (column: Column) => {
  if (column.type === 'custom') return 'slot'
  const componentMap: Record<string, any> = {
    number: NumberCell,
    percent: PercentCell,
    currency: CurrencyCell,
    date: DateTimeCell,
    datetime: DateTimeCell,
    trend: TrendCell,
  }
  return componentMap[column.type || 'string'] || NumberCell
}

// 搜尋處理
const handleSearch = () => {
  emit('update:search', searchQuery.value)
}

// 重新整理
const handleRefresh = () => {
  emit('refresh')
}

// 排序變化
const handleSortChange = (sort: { prop: string; order: string }) => {
  emit('update:sort', sort)
}

// 分頁變化
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  emit('update:page', page)
}

const handlePageSizeChange = (size: number) => {
  pagination.value.pageSize = size
  emit('update:pageSize', size)
}

// 選擇變化
const handleSelectionChange = (rows: any[]) => {
  emit('selection-change', rows)
}

// 行點擊
const handleRowClick = (row: any) => {
  emit('row-click', row)
}

// 單元格點擊
const handleCellClick = (row: any, column: any) => {
  emit('cell-click', row, column)
}

// 匯出處理
const handleExport = (type: 'csv' | 'xlsx') => {
  const data = props.data.map(item => {
    const row: Record<string, any> = {}
    props.columns.forEach(col => {
      row[col.label] = item[col.prop]
    })
    return row
  })
  
  if (type === 'csv') {
    exportToCsv(data, 'data-export.csv')
  } else {
    exportToXlsx(data, 'data-export')
  }
  emit('export', type)
}

// 欄位切換
const handleColumnToggle = () => {
  showColumnDialog.value = false
}
</script>

<style lang="scss" scoped>
.data-table-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-color-card);
  border-radius: 8px;
  
  .toolbar-left {
    .search-input {
      width: 280px;
    }
  }
  
  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.data-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  
  &.small-table {
    --el-table-border-color: var(--border-color-light);
  }
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

.expand-content {
  padding: 16px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .header-tooltip {
    font-size: 12px;
    color: var(--text-color-secondary);
  }
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}
</style>
```

### 4.3 K線圖表元件

CandlestickChart.vue 是專門用於顯示股票 K 線圖的元件，支援多種技術指標疊加。

```vue
<!-- src/components/Chart/CandlestickChart.vue -->
<template>
  <div class="candlestick-chart" ref="chartContainer">
    <div class="chart-header" v-if="showHeader">
      <div class="stock-info">
        <span class="stock-name">{{ stockName }}</span>
        <span class="stock-code">{{ stockCode }}</span>
      </div>
      <div class="price-info">
        <span class="current-price" :class="priceClass">{{ formatPrice(currentPrice) }}</span>
        <span class="price-change" :class="changeClass">{{ formatChange(priceChange) }}</span>
      </div>
      <div class="chart-controls">
        <el-radio-group v-model="chartType" size="small">
          <el-radio-button label="K">K線</el-radio-button>
          <el-radio-button label="Line">線圖</el-radio-button>
        </el-radio-group>
        <el-select v-model="timeUnit" size="small" class="time-select">
          <el-option label="日K" value="D" />
          <el-option label="週K" value="W" />
          <el-option label="月K" value="M" />
        </el-select>
        <el-button-group size="small">
          <el-button @click="zoomIn">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button @click="zoomOut">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-button @click="resetZoom">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 主圖表區域 -->
    <div class="chart-main" ref="mainChartRef"></div>
    
    <!-- 技術指標區域 -->
    <div class="chart-indicator" ref="indicatorChartRef" v-if="showIndicator"></div>
    
    <!-- 圖例 -->
    <div class="chart-legend" v-if="showLegend">
      <span class="legend-item" v-for="indicator in activeIndicators" :key="indicator.key">
        <span class="legend-color" :style="{ backgroundColor: indicator.color }"></span>
        {{ indicator.name }}
      </span>
    </div>
    
    <!-- 載入狀態 -->
    <div class="chart-loading" v-if="loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>載入中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Loading, ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'
import { useResizeObserver } from '@vueuse/core'

interface KLineData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount?: number
}

interface Indicator {
  key: string
  name: string
  color: string
}

interface Props {
  data: KLineData[]
  stockCode?: string
  stockName?: string
  loading?: boolean
  chartType?: 'K' | 'Line'
  timeUnit?: 'D' | 'W' | 'M'
  showHeader?: boolean
  showIndicator?: boolean
  showLegend?: boolean
  showVolume?: boolean
  indicators?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  chartType: 'K',
  timeUnit: 'D',
  showHeader: true,
  showIndicator: true,
  showLegend: true,
  showVolume: true,
  indicators: () => ['MA5', 'MA10', 'MA20'],
})

const emit = defineEmits<{
  (e: 'click', params: any): void
  (e: 'range-change', range: { start: string; end: string }): void
}>()

// DOM 參考
const chartContainer = ref<HTMLElement>()
const mainChartRef = ref<HTMLElement>()
const indicatorChartRef = ref<HTMLElement>()

// 圖表實例
let mainChart: echarts.ECharts | null = null
let indicatorChart: echarts.ECharts | null = null

// 計算屬性
const currentPrice = computed(() => {
  if (props.data.length === 0) return 0
  return props.data[props.data.length - 1].close
})

const priceChange = computed(() => {
  if (props.data.length < 2) return 0
  const prev = props.data[props.data.length - 2].close
  const curr = props.data[props.data.length - 1].close
  return ((curr - prev) / prev) * 100
})

const priceClass = computed(() => ({
  'price-up': currentPrice.value > 0,
  'price-down': currentPrice.value < 0,
}))

const changeClass = computed(() => ({
  'change-up': priceChange.value > 0,
  'change-down': priceChange.value < 0,
}))

const activeIndicators = computed(() => {
  const indicatorConfig: Record<string, { name: string; color: string }> = {
    MA5: { name: 'MA5', color: '#f56c6c' },
    MA10: { name: 'MA10', color: '#e6a23c' },
    MA20: { name: 'MA20', color: '#409eff' },
    MA60: { name: 'MA60', color: '#67c23a' },
    MA120: { name: 'MA120', color: '#909399' },
    VOL5: { name: '5日均量', color: '#f56c6c' },
    VOL10: { name: '10日均量', color: '#e6a23c' },
  }
  return props.indicators
    .filter(key => indicatorConfig[key])
    .map(key => indicatorConfig[key])
})

// 格式化工具
const formatPrice = (price: number) => {
  return price.toFixed(2)
}

const formatChange = (change: number) => {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

// 移動平均計算
const calculateMA = (days: number, data: KLineData[]): (number | null)[] => {
  const result: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < days - 1) {
      result.push(null)
    } else {
      let sum = 0
      for (let j = 0; j < days; j++) {
        sum += data[i - j].close
      }
      result.push(sum / days)
    }
  }
  return result
}

// 數據轉換
const transformData = (data: KLineData[]) => {
  const dates = data.map(d => d.date)
  const values = data.map(d => [d.open, d.close, d.low, d.high])
  const volumes = data.map((d, index) => {
    const color = d.close >= d.open ? 1 : -1
    return [index, d.volume, color]
  })
  
  // 計算移動平均線
  const ma5 = calculateMA(5, data)
  const ma10 = calculateMA(10, data)
  const ma20 = calculateMA(20, data)
  const ma60 = calculateMA(60, data)
  
  return { dates, values, volumes, ma5, ma10, ma20, ma60 }
}

// 初始化圖表
const initChart = () => {
  if (!mainChartRef.value || !indicatorChartRef.value) return
  
  // 主圖表
  mainChart = echarts.init(mainChartRef.value)
  mainChart.on('click', (params) => emit('click', params))
  mainChart.on('datazoom', (params) => {
    if (params.batch && params.batch[0]) {
      const start = params.batch[0].start
      const end = params.batch[0].end
      const startIndex = Math.floor(start / 100 * props.data.length)
      const endIndex = Math.floor(end / 100 * props.data.length)
      if (props.data[startIndex] && props.data[endIndex]) {
        emit('range-change', {
          start: props.data[startIndex].date,
          end: props.data[endIndex].date,
        })
      }
    }
  })
  
  // 技術指標圖表
  indicatorChart = echarts.init(indicatorChartRef.value)
  
  updateChart()
}

// 更新圖表
const updateChart = () => {
  if (!mainChart || !indicatorChart || props.data.length === 0) return
  
  const { dates, values, volumes, ma5, ma10, ma20, ma60 } = transformData(props.data)
  
  // 主圖表配置
  const mainOption: echarts.Option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
      },
      formatter: (params: any) => {
        const dataIndex = params[0]?.dataIndex || 0
        const item = props.data[dataIndex]
        if (!item) return ''
        
        return `
          <div class="kline-tooltip">
            <div class="tooltip-header">${item.date}</div>
            <div class="tooltip-row">
              <span>開盤:</span>
              <span class="${item.open > values[dataIndex][1] ? 'down' : 'up'}">${item.open.toFixed(2)}</span>
            </div>
            <div class="tooltip-row">
              <span>最高:</span>
              <span class="up">${item.high.toFixed(2)}</span>
            </div>
            <div class="tooltip-row">
              <span>最低:</span>
              <span class="down">${item.low.toFixed(2)}</span>
            </div>
            <div class="tooltip-row">
              <span>收盤:</span>
              <span class="${item.close > item.open ? 'up' : 'down'}">${item.close.toFixed(2)}</span>
            </div>
            <div class="tooltip-row">
              <span>成交量:</span>
              <span>${(item.volume / 10000).toFixed(2)}萬</span>
            </div>
          </div>
        `
      },
    },
    grid: [
      { left: '60', right: '40', top: '10%', height: props.showVolume ? '55%' : '70%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      {
        scale: true,
        splitArea: { show: true },
        position: 'right',
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 50,
        end: 100,
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        bottom: 0,
        height: 20,
        start: 50,
        end: 100,
      },
    ],
    series: [
      // K線圖
      {
        name: 'K線',
        type: 'candlestick',
        data: values,
        itemStyle: {
          color: '#ef4444',
          color0: '#22c55e',
          borderColor: '#ef4444',
          borderColor0: '#22c55e',
        },
      },
      // 移動平均線
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        lineStyle: { width: 1, color: '#f56c6c' },
        symbol: 'none',
        emphasis: { focus: 'series' },
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        lineStyle: { width: 1, color: '#e6a23c' },
        symbol: 'none',
        emphasis: { focus: 'series' },
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        lineStyle: { width: 1, color: '#409eff' },
        symbol: 'none',
        emphasis: { focus: 'series' },
      },
    ],
  }
  
  // 成交量圖表配置
  const volumeOption: echarts.Option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    grid: [
      { left: '60', right: '40', top: '75%', height: '15%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      {
        scale: true,
        splitNumber: 2,
        position: 'right',
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 50,
        end: 100,
      },
    ],
    series: [
      {
        name: '成交量',
        type: 'bar',
        data: volumes,
        itemStyle: {
          color: (params: any) => {
            return params.data[2] === 1 ? '#ef4444' : '#22c55e'
          },
        },
      },
    ],
  }
  
  mainChart.setOption(mainOption)
  if (props.showVolume) {
    indicatorChart.setOption(volumeOption)
  } else {
    indicatorChart.setOption({
      grid: [],
      xAxis: [],
      yAxis: [],
      series: [],
    })
  }
}

// 縮放控制
const zoomIn = () => {
  mainChart?.dispatchAction({
    type: 'zoom',
    zoomFactor: 1.2,
  })
}

const zoomOut = () => {
  mainChart?.dispatchAction({
    type: 'zoom',
    zoomFactor: 0.8,
  })
}

const resetZoom = () => {
  mainChart?.dispatchAction({
    type: 'restore',
  })
}

// 響應式調整
useResizeObserver(chartContainer, () => {
  mainChart?.resize()
  indicatorChart?.resize()
})

// 監聽 props 變化
watch(() => props.data, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

watch(() => props.chartType, () => {
  updateChart()
})

watch(() => props.indicators, () => {
  updateChart()
})

// 生命週期
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  mainChart?.dispose()
  indicatorChart?.dispose()
})

// 暴露出給父元件的方法
defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  getChart: () => mainChart,
})
</script>

<style lang="scss" scoped>
.candlestick-chart {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-card);
  border-radius: 8px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-light);
  
  .stock-info {
    .stock-name {
      font-size: 18px;
      font-weight: 600;
      margin-right: 8px;
    }
    
    .stock-code {
      font-size: 14px;
      color: var(--text-color-secondary);
    }
  }
  
  .price-info {
    .current-price {
      font-size: 24px;
      font-weight: 600;
      margin-right: 12px;
      
      &.price-up { color: #ef4444; }
      &.price-down { color: #22c55e; }
    }
    
    .price-change {
      font-size: 16px;
      font-weight: 500;
      
      &.change-up { color: #ef4444; }
      &.change-down { color: #22c55e; }
    }
  }
  
  .chart-controls {
    display: flex;
    gap: 12px;
    
    .time-select {
      width: 80px;
    }
  }
}

.chart-main {
  flex: 1;
  min-height: 400px;
  padding: 10px 0;
}

.chart-indicator {
  height: 150px;
  border-top: 1px solid var(--border-color-light);
  padding: 10px 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-color-light);
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-color-secondary);
    
    .legend-color {
      width: 12px;
      height: 2px;
      border-radius: 1px;
    }
  }
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 12px;
  color: var(--text-color-secondary);
  
  .loading-icon {
    font-size: 32px;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.kline-tooltip) {
  padding: 8px 12px;
  font-size: 12px;
  
  .tooltip-header {
    font-weight: 600;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color-light);
  }
  
  .tooltip-row {
    display: flex;
    justify-content: space-between;
    margin: 4px 0;
    
    span:first-child {
      color: var(--text-color-secondary);
    }
    
    .up { color: #ef4444; }
    .down { color: #22c55e; }
  }
}
</style>
```

### 4.4 統計卡片元件

StatsCard.vue 是用於顯示關鍵指標卡片的元件。

```vue
<!-- src/components/Layout/StatsCard.vue -->
<template>
  <div 
    class="stats-card" 
    :class="[`stats-card-${variant}`, { clickable: clickable }]"
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
        <span class="value" :class="valueClass">{{ formattedValue }}</span>
        <span class="unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="card-change" v-if="showChange">
        <span class="change-value" :class="changeClass">
          <el-icon v-if="changeValue !== 0">
            <component :is="changeIcon" />
          </el-icon>
          {{ formattedChange }}
        </span>
        <span class="change-label">較上期</span>
      </div>
    </div>
    
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
    
    <!-- 趨勢圖 -->
    <div class="card-trend" v-if="showTrend && trendData.length > 0">
      <sparkline-chart :data="trendData" :color="trendColor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendCharts, Top, Bottom } from '@element-plus/icons-vue'
import SparklineChart from './SparklineChart.vue'

interface Props {
  title: string
  value: number | string
  unit?: string
  icon: string
  iconBg?: string
  iconSize?: number
  changeValue?: number | null
  showChange?: boolean
  showTrend?: boolean
  trendData?: number[]
  trendColor?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  clickable?: boolean
  valueType?: 'number' | 'currency' | 'percent' | 'string'
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: 'var(--primary-color-light)',
  iconSize: 24,
  changeValue: null,
  showChange: true,
  showTrend: false,
  trendData: () => [],
  trendColor: '#409eff',
  variant: 'default',
  clickable: false,
  valueType: 'number',
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

// 格式化數值
const formattedValue = computed(() => {
  if (props.valueType === 'string') return props.value as string
  if (typeof props.value === 'number') {
    if (props.valueType === 'currency') {
      return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(props.value)
    }
    if (props.valueType === 'percent') {
      return `${props.value.toFixed(2)}%`
    }
    return new Intl.NumberFormat('zh-TW').format(props.value)
  }
  return props.value
})

// 數值類別
const valueClass = computed(() => {
  if (props.variant === 'success') return 'text-success'
  if (props.variant === 'danger') return 'text-danger'
  if (props.variant === 'warning') return 'text-warning'
  return ''
})

// 變化格式化
const formattedChange = computed(() => {
  if (props.changeValue === null) return '-'
  const sign = props.changeValue >= 0 ? '+' : ''
  return `${sign}${props.changeValue.toFixed(2)}%`
})

// 變化類別
const changeClass = computed(() => {
  if (props.changeValue === null) return ''
  return props.changeValue >= 0 ? 'change-up' : 'change-down'
})

// 變化圖示
const changeIcon = computed(() => {
  if (props.changeValue === null) return null
  return props.changeValue >= 0 ? Top : Bottom
})

// 點擊處理
const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
.stats-card {
  background-color: var(--bg-color-card);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  &.stats-card-primary {
    .card-icon {
      background-color: var(--primary-color-light);
      color: var(--primary-color);
    }
  }
  
  &.stats-card-success {
    .card-icon {
      background-color: var(--success-color-light);
      color: var(--success-color);
    }
  }
  
  &.stats-card-warning {
    .card-icon {
      background-color: var(--warning-color-light);
      color: var(--warning-color);
    }
  }
  
  &.stats-card-danger {
    .card-icon {
      background-color: var(--danger-color-light);
      color: var(--danger-color);
    }
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
    color: var(--text-color-secondary);
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
      color: var(--text-color-primary);
      
      &.text-success { color: var(--success-color); }
      &.text-danger { color: var(--danger-color); }
      &.text-warning { color: var(--warning-color); }
    }
    
    .unit {
      font-size: 14px;
      color: var(--text-color-secondary);
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
      
      &.change-up { color: var(--danger-color); }
      &.change-down { color: var(--success-color); }
    }
    
    .change-label {
      font-size: 12px;
      color: var(--text-color-tertiary);
    }
  }
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color-light);
}

.card-trend {
  margin-top: 16px;
}
</style>
```

---

## 第五章：業務元件層

### 5.1 個股搜尋元件

StockSearch.vue 是用於搜尋個股的元件，支援多種搜尋方式。

```vue
<!-- src/components/Form/StockSearch.vue -->
<template>
  <div class="stock-search">
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="市場" class="market-select">
        <el-select v-model="searchForm.market" placeholder="全部" clearable>
          <el-option label="上市" value="上市" />
          <el-option label="上櫃" value="上櫃" />
          <el-option label="ETF" value="ETF" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="產業" class="industry-select">
        <el-select 
          v-model="searchForm.industry" 
          placeholder="全部" 
          clearable
          filterable
          remote
          :remote-method="fetchIndustries"
          :loading="industryLoading"
        >
          <el-option
            v-for="item in industries"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="關鍵字" class="keyword-input">
        <el-input
          v-model="searchForm.keyword"
          placeholder="股票代碼/名稱"
          prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      
      <el-form-item>
        <BaseButton type="primary" icon="Search" @click="handleSearch">
          搜尋
        </BaseButton>
        <BaseButton icon="Refresh" @click="handleReset" style="margin-left: 8px;">
          重置
        </BaseButton>
      </el-form-item>
    </el-form>
    
    <!-- 常用股票快速選擇 -->
    <div class="quick-select" v-if="showQuickSelect">
      <span class="quick-label">常用：</span>
      <el-tag
        v-for="stock in quickStocks"
        :key="stock.code"
        class="quick-tag"
        @click="selectStock(stock)"
      >
        {{ stock.code }} {{ stock.name }}
      </el-tag>
    </div>
    
    <!-- 搜尋結果 -->
    <div class="search-results" v-if="showResults && searchResults.length > 0">
      <div class="results-header">
        <span>搜尋結果 ({{ searchResults.length }})</span>
        <el-button type="text" @click="clearResults">
          <el-icon><Close /></el-icon> 清除
        </el-button>
      </div>
      <div class="results-list">
        <div
          v-for="stock in searchResults"
          :key="stock.code"
          class="result-item"
          @click="selectStock(stock)"
        >
          <div class="item-main">
            <span class="stock-code">{{ stock.code }}</span>
            <span class="stock-name">{{ stock.name }}</span>
          </div>
          <div class="item-sub">
            <el-tag size="small" :type="getMarketType(stock.market)">
              {{ stock.market }}
            </el-tag>
            <span class="stock-industry">{{ stock.industry }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import BaseButton from '@/components/Base/BaseButton.vue'
import { searchStocks, getIndustries } from '@/api/stocks/stock'
import type { StockInfo, Industry } from '@/api/stocks/types'

interface Props {
  showQuickSelect?: boolean
  showResults?: boolean
  maxResults?: number
}

const props = withDefaults(defineProps<Props>(), {
  showQuickSelect: true,
  showResults: true,
  maxResults: 10,
})

const emit = defineEmits<{
  (e: 'search', params: SearchParams): void
  (e: 'select', stock: StockInfo): void
}>()

// 搜尋表單
const searchForm = reactive({
  market: '',
  industry: '',
  keyword: '',
})

// 數據
const industries = ref<Industry[]>([])
const industryLoading = ref(false)
const searchResults = ref<StockInfo[]>([])
const quickStocks = ref<StockInfo[]>([
  { code: '2330', name: '台積電', market: '上市', industry: '半導體' },
  { code: '0050', name: '元大台灣50', market: 'ETF', industry: '指數型' },
  { code: '2317', name: '鴻海', market: '上市', industry: '電子組裝' },
])

// 獲取產業清單
const fetchIndustries = async (query?: string) => {
  industryLoading.value = true
  try {
    industries.value = await getIndustries(query)
  } catch (error) {
    ElMessage.error('獲取產業清單失敗')
  } finally {
    industryLoading.value = false
  }
}

// 搜尋處理
const handleSearch = async () => {
  if (!searchForm.keyword && !searchForm.market && !searchForm.industry) {
    ElMessage.warning('請輸入搜尋條件')
    return
  }
  
  try {
    const results = await searchStocks({
      keyword: searchForm.keyword,
      market: searchForm.market,
      industry: searchForm.industry,
      limit: props.maxResults,
    })
    searchResults.value = results
  } catch (error) {
    ElMessage.error('搜尋失敗')
  }
}

// 重置處理
const handleReset = () => {
  searchForm.market = ''
  searchForm.industry = ''
  searchForm.keyword = ''
  searchResults.value = []
}

// 清除結果
const clearResults = () => {
  searchResults.value = []
}

// 選擇股票
const selectStock = (stock: StockInfo) => {
  emit('select', stock)
  clearResults()
  searchForm.keyword = ''
}

// 取得市場類型
const getMarketType = (market: string) => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info'> = {
    '上市': '',
    '上櫃': 'info',
    'ETF': 'success',
  }
  return typeMap[market] || ''
}

// 初始化
onMounted(() => {
  fetchIndustries()
})
</script>

<style lang="scss" scoped>
.stock-search {
  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px;
    background-color: var(--bg-color-card);
    border-radius: 8px;
    
    .el-form-item {
      margin-bottom: 0;
      margin-right: 0;
    }
    
    .market-select {
      width: 120px;
    }
    
    .industry-select {
      width: 180px;
    }
    
    .keyword-input {
      width: 200px;
    }
  }
  
  .quick-select {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 0 20px;
    
    .quick-label {
      font-size: 14px;
      color: var(--text-color-secondary);
    }
    
    .quick-tag {
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .search-results {
    margin-top: 16px;
    background-color: var(--bg-color-card);
    border-radius: 8px;
    overflow: hidden;
    
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: var(--bg-color-secondary);
      font-size: 14px;
      font-weight: 500;
    }
    
    .results-list {
      max-height: 400px;
      overflow-y: auto;
      
      .result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: var(--hover-color);
        }
        
        .item-main {
          .stock-code {
            font-weight: 600;
            margin-right: 8px;
          }
          
          .stock-name {
            color: var(--text-color-secondary);
          }
        }
        
        .item-sub {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .stock-industry {
            font-size: 12px;
            color: var(--text-color-tertiary);
          }
        }
      }
    }
  }
}
</style>
```

### 5.2 宏觀指標卡片元件

MacroIndicatorCard.vue 是用於顯示宏觀指標卡片的元件。

```vue
<!-- src/components/Form/MacroIndicatorSelector.vue -->
<template>
  <div class="macro-indicator-selector">
    <el-form :model="selectorForm" inline class="selector-form">
      <el-form-item label="國家" class="country-select">
        <el-select v-model="selectorForm.country" placeholder="全部" clearable>
          <el-option label="美國" value="US" />
          <el-option label="台灣" value="TW" />
          <el-option label="中國" value="CN" />
          <el-option label="日本" value="JP" />
          <el-option label="歐元區" value="EU" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="指標類別" class="category-select">
        <el-select 
          v-model="selectorForm.category" 
          placeholder="全部" 
          clearable
          @change="handleCategoryChange"
        >
          <el-option label="利率與貨幣政策" value="利率" />
          <el-option label="通貨膨脹" value="通膨" />
          <el-form-item label="指標搜尋" class="indicator-search">
            <el-input
              v-model="selectorForm.keyword"
              placeholder="指標名稱/代碼"
              prefix-icon="Search"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item>
            <BaseButton type="primary" icon="Search" @click="handleSearch">
              搜尋
            </BaseButton>
          </el-form-item>
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <BaseButton icon="Refresh" @click="handleReset">重置</BaseButton>
      </el-form-item>
    </el-form>
    
    <!-- 指標列表 -->
    <div class="indicator-list" v-loading="loading">
      <div
        v-for="indicator in indicators"
        :key="indicator.code"
        class="indicator-item"
        :class="{ active: selectedCode === indicator.code }"
        @click="selectIndicator(indicator)"
      >
        <div class="indicator-info">
          <span class="indicator-code">{{ indicator.code }}</span>
          <span class="indicator-name">{{ indicator.name }}</span>
        </div>
        <div class="indicator-meta">
          <el-tag size="small">{{ indicator.country }}</el-tag>
          <el-tag size="small" :type="getFrequencyType(indicator.frequency)">
            {{ indicator.frequency }}
          </el-tag>
        </div>
        <div class="indicator-latest" v-if="indicator.latestValue !== null">
          <span class="latest-value">{{ formatValue(indicator.latestValue) }}</span>
          <span class="latest-date">{{ indicator.latestDate }}</span>
        </div>
      </div>
      
      <el-empty v-if="!loading && indicators.length === 0" description="沒有找到指標" />
    </div>
    
    <!-- 分頁 -->
    <div class="pagination-wrapper" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        small
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseButton from '@/components/Base/BaseButton.vue'
import { searchIndicators, getIndicatorDetail } from '@/api/macro/macro'
import type { MacroIndicator, MacroIndicatorInfo } from '@/api/macro/types'

interface Props {
  selectedCode?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', indicator: MacroIndicatorInfo): void
  (e: 'search', params: SearchParams): void
}>()

// 選擇器表單
const selectorForm = reactive({
  country: '',
  category: '',
  keyword: '',
})

// 狀態
const loading = ref(false)
const indicators = ref<MacroIndicatorInfo[]>([])
const selectedCode = ref(props.selectedCode || '')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 搜尋處理
const handleSearch = async () => {
  loading.value = true
  try {
    const result = await searchIndicators({
      country: selectorForm.country,
      category: selectorForm.category,
      keyword: selectorForm.keyword,
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    indicators.value = result.list
    total.value = result.total
  } catch (error) {
    ElMessage.error('搜尋失敗')
  } finally {
    loading.value = false
  }
}

// 重置處理
const handleReset = () => {
  selectorForm.country = ''
  selectorForm.category = ''
  selectorForm.keyword = ''
  currentPage.value = 1
  handleSearch()
}

// 類別變化
const handleCategoryChange = (value: string) => {
  handleSearch()
}

// 分頁變化
const handlePageChange = (page: number) => {
  currentPage.value = page
  handleSearch()
}

// 選擇指標
const selectIndicator = async (indicator: MacroIndicatorInfo) => {
  selectedCode.value = indicator.code
  emit('select', indicator)
}

// 格式化數值
const formatValue = (value: number) => {
  return value.toFixed(2)
}

// 取得頻率類型
const getFrequencyType = (frequency: string) => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info'> = {
    'D': 'info',
    'W': '',
    'M': 'success',
    'Q': 'warning',
  }
  return typeMap[frequency] || ''
}

// 監聽
watch(() => props.selectedCode, (val) => {
  selectedCode.value = val || ''
})

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.macro-indicator-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .selector-form {
    padding: 16px 20px;
    background-color: var(--bg-color-card);
    border-radius: 8px;
    margin-bottom: 16px;
    
    .el-form-item {
      margin-bottom: 0;
      margin-right: 16px;
    }
    
    .country-select {
      width: 120px;
    }
    
    .category-select {
      width: 160px;
    }
    
    .indicator-search {
      width: 200px;
    }
  }
  
  .indicator-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
    
    .indicator-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin: 4px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: var(--hover-color);
      }
      
      &.active {
        background-color: var(--primary-color-light);
        border-left: 3px solid var(--primary-color);
      }
      
      .indicator-info {
        .indicator-code {
          font-weight: 600;
          margin-right: 8px;
          font-family: monospace;
        }
        
        .indicator-name {
          color: var(--text-color-secondary);
        }
      }
      
      .indicator-meta {
        display: flex;
        gap: 8px;
      }
      
      .indicator-latest {
        text-align: right;
        
        .latest-value {
          display: block;
          font-size: 16px;
          font-weight: 600;
        }
        
        .latest-date {
          font-size: 12px;
          color: var(--text-color-tertiary);
        }
      }
    }
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    border-top: 1px solid var(--border-color-light);
  }
}
</style>
```

### 5.3 AI評分雷達圖元件

AIScoreRadar.vue 是用於顯示 AI 多維度評分的雷達圖元件。

```vue
<!-- src/components/Chart/AIScoreRadar.vue -->
<template>
  <div class="ai-score-radar" ref="chartContainer">
    <div class="radar-header" v-if="showHeader">
      <h3 class="radar-title">{{ title }}</h3>
      <div class="radar-legend">
        <span class="legend-item">
          <span class="legend-dot current"></span>
          當前評分
        </span>
        <span class="legend-item" v-if="showBenchmark">
          <span class="legend-dot benchmark"></span>
          平均水平
        </span>
      </div>
    </div>
    <div class="radar-chart" ref="chartRef"></div>
    
    <!-- 分數詳情 -->
    <div class="score-details" v-if="showDetails">
      <div class="detail-item" v-for="(item, index) in scoreDetails" :key="index">
        <div class="detail-label">{{ item.name }}</div>
        <div class="detail-bar">
          <div 
            class="bar-fill current"
            :style="{ width: `${item.current}%` }"
          ></div>
          <div 
            class="bar-fill benchmark"
            :style="{ width: `${item.benchmark}%` }"
            v-if="showBenchmark"
          ></div>
        </div>
        <div class="detail-value">
          <span class="current">{{ item.current.toFixed(1) }}</span>
          <span class="benchmark" v-if="showBenchmark">{{ item.benchmark.toFixed(1) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useResizeObserver } from '@vueuse/core'

interface ScoreData {
  name: string
  value: number
  benchmark?: number
}

interface Props {
  title?: string
  data: ScoreData[]
  showHeader?: boolean
  showDetails?: boolean
  showBenchmark?: boolean
  maxScore?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI 投資評分',
  showHeader: true,
  showDetails: true,
  showBenchmark: true,
  maxScore: 100,
})

// DOM 參考
const chartContainer = ref<HTMLElement>()
const chartRef = ref<HTMLElement>()

// 圖表實例
let chart: echarts.ECharts | null = null

// 分數詳情
const scoreDetails = computed(() => {
  return props.data.map(item => ({
    name: item.name,
    current: (item.value / props.maxScore) * 100,
    benchmark: item.benchmark ? (item.benchmark / props.maxScore) * 100 : 50,
  }))
})

// 初始化圖表
const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
}

// 更新圖表
const updateChart = () => {
  if (!chart) return
  
  const option: echarts.Option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesType === 'radar') {
          const data = params.data
          let html = `<div class="radar-tooltip">
            <div class="tooltip-title">${data.name}</div>
            <div class="tooltip-item">
              <span>評分:</span>
              <span class="value">${data.value.toFixed(1)}</span>
            </div>
            ${data.benchmark !== undefined ? `
              <div class="tooltip-item">
                <span>平均:</span>
                <span class="benchmark">${data.benchmark.toFixed(1)}</span>
              </div>
            ` : ''}
          </div>`
          return html
        }
        return ''
      },
    },
    legend: {
      show: false,
    },
    radar: {
      indicator: props.data.map(item => ({
        name: item.name,
        max: props.maxScore,
      })),
      center: ['50%', '50%'],
      radius: '65%',
      startAngle: 90,
      splitNumber: 5,
      shape: 'polygon',
      axisName: {
        color: 'rgb(238, 197, 102)',
        fontSize: 12,
      },
      splitArea: {
        areaStyle: {
          color: ['#f8f8f8', '#f0f0f0', '#e8e8e8', '#e0e0e0', '#d8d8d8'],
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10,
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(238, 197, 102, 0.5)',
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(238, 197, 102, 0.5)',
        },
      },
    },
    series: [
      {
        name: props.title,
        type: 'radar',
        data: [
          {
            value: props.data.map(d => d.value),
            name: '當前評分',
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#409eff',
              width: 2,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.8)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.3)' },
              ]),
            },
            itemStyle: {
              color: '#409eff',
            },
          },
          ...(props.showBenchmark ? [{
            value: props.data.map(d => d.benchmark || 50),
            name: '平均水平',
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: {
              color: '#909399',
              width: 2,
              type: 'dashed',
            },
            areaStyle: {
              color: 'rgba(144, 147, 153, 0.1)',
            },
            itemStyle: {
              color: '#909399',
            },
          }] : []),
        ],
      },
    ],
  }
  
  chart.setOption(option)
}

// 響應式調整
useResizeObserver(chartContainer, () => {
  chart?.resize()
})

// 監聽 props 變化
watch(() => props.data, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 生命週期
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style lang="scss" scoped>
.ai-score-radar {
  background-color: var(--bg-color-card);
  border-radius: 8px;
  padding: 20px;
}

.radar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .radar-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
  
  .radar-legend {
    display: flex;
    gap: 16px;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-color-secondary);
      
      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        
        &.current {
          background-color: #409eff;
        }
        
        &.benchmark {
          background-color: #909399;
        }
      }
    }
  }
}

.radar-chart {
  width: 100%;
  height: 350px;
}

.score-details {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color-light);
  
  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .detail-label {
      width: 80px;
      font-size: 13px;
      color: var(--text-color-secondary);
    }
    
    .detail-bar {
      flex: 1;
      height: 8px;
      background-color: var(--bg-color-secondary);
      border-radius: 4px;
      position: relative;
      margin: 0 12px;
      overflow: hidden;
      
      .bar-fill {
        height: 100%;
        border-radius: 4px;
        position: absolute;
        top: 0;
        left: 0;
        
        &.current {
          background-color: #409eff;
          z-index: 2;
        }
        
        &.benchmark {
          background-color: #909399;
          opacity: 0.5;
          z-index: 1;
        }
      }
    }
    
    .detail-value {
      width: 80px;
      text-align: right;
      font-size: 14px;
      font-weight: 600;
      
      .current {
        color: #409eff;
      }
      
      .benchmark {
        color: #909399;
        margin-left: 8px;
      }
    }
  }
}

:deep(.radar-tooltip) {
  padding: 8px 12px;
  font-size: 12px;
  
  .tooltip-title {
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .tooltip-item {
    display: flex;
    justify-content: space-between;
    margin: 4px 0;
    
    .value {
      color: #409eff;
      font-weight: 600;
    }
    
    .benchmark {
      color: #909399;
    }
  }
}
</style>
```

---

## 第六章：頁面視圖層

### 6.1 儀表板頁面

Dashboard.vue 是系統的首頁，匯集投資組合總覽、關鍵指標、市場動態等資訊。

```vue
<!-- src/pages/index.vue -->
<template>
  <div class="dashboard-page">
    <!-- 歡迎區塊 -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h1>歡迎回來，{{ userName }}</h1>
        <p class="date">{{ currentDate }}</p>
      </div>
      <div class="market-status">
        <el-tag :type="marketStatus.type" size="large">
          <el-icon><component :is="marketStatus.icon" /></el-icon>
          {{ marketStatus.text }}
        </el-tag>
      </div>
    </div>
    
    <!-- 關鍵指標卡片 -->
    <div class="stats-grid">
      <StatsCard
        title="投資組合總值"
        :value="portfolioValue"
        unit="TWD"
        icon="Money"
        icon-bg="var(--primary-color-light)"
        :change-value="portfolioChange"
        :show-trend="true"
        :trend-data="portfolioTrend"
        variant="primary"
      />
      <StatsCard
        title="今日損益"
        :value="dailyPnL"
        unit="TWD"
        icon="TrendCharts"
        icon-bg="var(--success-color-light)"
        :change-value="dailyPnLPercent"
        variant="success"
      />
      <StatsCard
        title="持仓數量"
        :value="positionCount"
        unit="檔"
        icon="Box"
        icon-bg="var(--warning-color-light)"
        variant="warning"
      />
      <StatsCard
        title="AI 建議買入"
        :value="aiBuySignals"
        unit="檔"
        icon="Cpu"
        icon-bg="var(--danger-color-light)"
        variant="danger"
        clickable
        @click="goToAIRanking"
      />
    </div>
    
    <!-- 主要內容區 -->
    <div class="main-content">
      <!-- 左側：市場概覽 -->
      <div class="market-overview">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>市場概覽</span>
              <el-radio-group v-model="marketPeriod" size="small">
                <el-radio-button label="1D">日</el-radio-button>
                <el-radio-button label="1W">週</el-radio-button>
                <el-radio-button label="1M">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="market-indices">
            <div 
              v-for="index in marketIndices" 
              :key="index.code"
              class="index-item"
              @click="goToIndex(index)"
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
              <span>近期強勢股</span>
              <el-button type="text" @click="goToStocks">看更多</el-button>
            </div>
          </template>
          <div class="strong-stocks">
            <div 
              v-for="stock in strongStocks" 
              :key="stock.code"
              class="stock-item"
              @click="goToStock(stock.code)"
            >
              <div class="stock-main">
                <span class="stock-code">{{ stock.code }}</span>
                <span class="stock-name">{{ stock.name }}</span>
              </div>
              <div class="stock-change">
                <span class="change-value" :class="stock.change >= 0 ? 'up' : 'down'">
                  {{ formatPercent(stock.change) }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 右側：AI 分析摘要 -->
      <div class="ai-summary">
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <span>AI 投資評分排行</span>
              <el-button type="text" @click="goToAIRanking">看更多</el-button>
            </div>
          </template>
          <div class="ai-ranking-list">
            <div 
              v-for="(stock, index) in topAIRanking" 
              :key="stock.code"
              class="ranking-item"
              @click="goToAIScore(stock.code)"
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
              <el-button type="text" @click="goToCalendar">看日曆</el-button>
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
                <span class="time">{{ event.time }}</span>
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
      </div>
    </div>
    
    <!-- 技術分析捷徑 -->
    <el-card class="quick-chart-card">
      <template #header>
        <div class="card-header">
          <span>技術分析</span>
          <el-select v-model="selectedStock" placeholder="選擇股票" size="small" @change="updateChart">
            <el-option
              v-for="stock in quickStocks"
              :key="stock.code"
              :label="`${stock.code} ${stock.name}`"
              :value="stock.code"
            />
          </el-select>
        </div>
      </template>
      <CandlestickChart
        v-if="selectedStock"
        :data="stockChartData"
        :stock-code="selectedStock"
        :stock-name="getStockName(selectedStock)"
        :loading="chartLoading"
        :show-indicator="true"
        :show-volume="true"
      />
      <div class="chart-placeholder" v-else>
        <el-empty description="請選擇一檔股票查看技術圖表" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import StatsCard from '@/components/Layout/StatsCard.vue'
import CandlestickChart from '@/components/Chart/CandlestickChart.vue'

const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// 當前用戶名稱
const userName = computed(() => user.value?.name || '用戶')

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

// 市場狀態
const marketStatus = computed(() => {
  const hour = new Date().getHours()
  const minute = new Date().getMinutes()
  const now = hour * 60 + minute
  
  // 台股交易時間 9:00-13:30
  const twOpen = 9 * 60
  const twClose = 13.5 * 60
  
  // 美股交易時間 21:30-4:00 (次日)
  const usOpen = 21.5 * 60
  const usClose = 24 * 60
  
  if (now >= twOpen && now <= twClose) {
    return { type: 'success', icon: 'CircleCheck', text: '台股交易中' }
  } else if (now >= usOpen || now <= 4 * 60) {
    return { type: 'warning', icon: 'Clock', text: '美股交易中' }
  }
  return { type: 'info', icon: 'Moon', text: '盤後' }
})

// 統計數據
const portfolioValue = ref(12500000)
const portfolioChange = ref(2.35)
const dailyPnL = ref(156000)
const dailyPnLPercent = ref(1.27)
const positionCount = ref(15)
const aiBuySignals = ref(5)
const portfolioTrend = ref([1.2, 1.5, 1.3, 1.8, 2.0, 1.9, 2.3])

// 市場區間
const marketPeriod = ref('1D')

// 市場指數
const marketIndices = ref([
  { code: 'TAIEX', name: '台股指數', price: 23456.78, change: 1.23 },
  { code: '0050', name: '元大台灣50', price: 178.5, change: 1.45 },
  { code: 'SPX', name: 'S&P 500', price: 5234.18, change: -0.32 },
  { code: 'NDX', name: '那斯達克', price: 16428.82, change: -0.58 },
])

// 強勢股
const strongStocks = ref([
  { code: '2376', name: '瑞昱', change: 7.85 },
  { code: '3443', name: '創意', change: 6.54 },
  { code: '2454', name: '聯發科', change: 5.21 },
  { code: '2379', name: '迪睿', change: 4.89 },
  { code: '3443', name: '創意', change: 4.56 },
])

// AI 排行
const topAIRanking = ref([
  { code: '2330', name: '台積電', score: 92.5 },
  { code: '2454', name: '聯發科', score: 88.3 },
  { code: '2303', name: '聯電', score: 85.7 },
  { code: '2376', name: '瑞昱', score: 83.2 },
  { code: '2308', name: '華碩', score: 81.9 },
])

// 即將發布的經濟事件
const upcomingEvents = ref([
  { id: 1, date: '02/17', time: '21:30', name: '美國 CPI 月增率', country: 'US', impact: '高' },
  { id: 2, date: '02/20', time: '08:30', name: '台灣 GDP 年增率', country: 'TW', impact: '高' },
  { id: 3, date:02/21', time: '03:00', name: 'FOMC 會議記錄', country: 'US', impact: '高' },
])

// 技術分析
const selectedStock = ref('')
const quickStocks = ref([
  { code: '2330', name: '台積電' },
  { code: '0050', name: '元大台灣50' },
  { code: '2454', name: '聯發科' },
  { code: '2317', name: '鴻海' },
])
const stockChartData = ref<any[]>([])
const chartLoading = ref(false)

// 格式化工具
const formatNumber = (value: number) => {
  return value.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatPercent = (value: number) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// 排名類別
const getRankClass = (index: number) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

// 分數顏色
const getScoreColor = (score: number) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  if (score >= 40) return '#f56c6c'
  return '#909399'
}

// 事件影響類型
const getImpactType = (impact: string) => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'danger'> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success',
  }
  return typeMap[impact] || ''
}

// 獲取股票名稱
const getStockName = (code: string) => {
  return quickStocks.value.find(s => s.code === code)?.name || ''
}

// 更新圖表
const updateChart = async (code: string) => {
  if (!code) return
  
  chartLoading.value = true
  try {
    // 模擬獲取 K 線數據
    // 實際應調用 API: await getStockKLine(code)
    stockChartData.value = generateMockKLineData()
  } catch (error) {
    ElMessage.error('載入圖表失敗')
  } finally {
    chartLoading.value = false
  }
}

// 生成模擬 K 線數據
const generateMockKLineData = () => {
  const data = []
  let basePrice = 1000
  const now = new Date()
  
  for (let i = 120; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const open = basePrice + (Math.random() - 0.5) * 20
    const close = open + (Math.random() - 0.5) * 20
    const high = Math.max(open, close) + Math.random() * 10
    const low = Math.min(open, close) - Math.random() * 10
    const volume = Math.floor(1000000 + Math.random() * 500000)
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    })
    
    basePrice = close
  }
  
  return data
}

// 導航函式
const goToStocks = () => router.push('/stocks/list')
const goToAIRanking = () => router.push('/ai/ranking')
const goToCalendar = () => router.push('/macro/calendar')
const goToIndex = (index: any) => router.push(`/stocks/list?code=${index.code}`)
const goToStock = (code: string) => router.push(`/stocks/detail/${code}`)
const goToAIScore = (code: string) => router.push(`/ai/score/${code}`)

// 初始化
onMounted(() => {
  // 預設選擇第一檔股票
  if (quickStocks.value.length > 0) {
    selectedStock.value = quickStocks.value[0].code
    updateChart(selectedStock.value)
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
  background: linear-gradient(135deg, var(--primary-color) 0%, #6b8dd6 100%);
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
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.overview-card,
.summary-card,
.quick-chart-card {
  :deep(.el-card__header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color-light);
  }
  
  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.card-header {
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
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--hover-color);
    }
    
    .index-info {
      .index-name {
        display: block;
        font-weight: 600;
      }
      
      .index-code {
        font-size: 12px;
        color: var(--text-color-secondary);
      }
    }
    
    .index-price {
      text-align: right;
      
      .price {
        display: block;
        font-weight: 600;
      }
      
      .change {
        font-size: 14px;
        font-weight: 500;
        
        &.up { color: var(--danger-color); }
        &.down { color: var(--success-color); }
      }
    }
  }
}

.strong-stocks,
.ai-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stock-item,
.ranking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  .stock-main,
  .stock-info {
    .stock-code {
      font-weight: 600;
      margin-right: 8px;
    }
    
    .stock-name {
      color: var(--text-color-secondary);
      font-size: 13px;
    }
  }
  
  .stock-change .change-value {
    font-weight: 600;
    
    &.up { color: var(--danger-color); }
    &.down { color: var(--success-color); }
  }
}

.ranking-item {
  .rank-number {
    width: 28px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    border-radius: 50%;
    background-color: var(--bg-color-tertiary);
    margin-right: 12px;
    font-weight: 600;
    font-size: 14px;
    
    &.rank-gold {
      background: linear-gradient(135deg, #ffd700, #ffb347);
      color: white;
    }
    
    &.rank-silver {
      background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
      color: white;
    }
    
    &.rank-bronze {
      background: linear-gradient(135deg, #cd7f32, #b87333);
      color: white;
    }
  }
  
  .stock-info {
    flex: 1;
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
      width: 36px;
      text-align: right;
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
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    
    .event-date {
      text-align: center;
      width: 60px;
      
      .date {
        display: block;
        font-weight: 600;
      }
      
      .time {
        font-size: 12px;
        color: var(--text-color-secondary);
      }
    }
    
    .event-info {
      flex: 1;
      
      .event-name {
        display: block;
        font-weight: 500;
      }
      
      .event-country {
        font-size: 12px;
        color: var(--text-color-secondary);
      }
    }
  }
}

.chart-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

### 6.2 AI評分排行頁面

AIRanking.vue 是顯示 AI 投資評分排行的頁面。

```vue
<!-- src/pages/ai/ranking.vue -->
<template>
  <div class="ai-ranking-page">
    <PageHeader title="AI 投資評分排行" subtitle="基於多因子模型的智能評分系統">
      <template #actions>
        <el-radio-group v-model="timeRange" size="default">
          <el-radio-button label="today">今日</el-radio-button>
          <el-radio-button label="1W">一週</el-radio-button>
          <el-radio-button label="1M">一個月</el-radio-button>
        </el-radio-group>
        <BaseButton type="primary" icon="Download" @click="handleExport">
          匯出排行
        </BaseButton>
      </template>
    </PageHeader>
    
    <!-- 篩選區 -->
    <div class="filter-section">
      <StockSearch :show-results="false" @search="handleSearch" />
    </div>
    
    <!-- AI 評分雷達圖摘要 -->
    <el-row :gutter="24" class="summary-section">
      <el-col :span="12">
        <AIScoreRadar
          title="整體市場 AI 評分分布"
          :data="marketScoreData"
          :show-details="true"
        />
      </el-col>
      <el-col :span="12">
        <el-card class="score-distribution-card">
          <template #header>
            <span>評分分布統計</span>
          </template>
          <div class="distribution-chart" ref="distributionChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 評分排行表格 -->
    <el-card class="ranking-table-card">
      <template #header>
        <div class="table-header">
          <span>評分排行 (共 {{ totalCount }} 檔)</span>
          <div class="table-actions">
            <el-select v-model="sortBy" placeholder="排序方式" size="small">
              <el-option label="AI 綜合評分" value="composite" />
              <el-option label="價值評分" value="value" />
              <el-option label="成長評分" value="growth" />
              <el-option label="品質評分" value="quality" />
              <el-option label="動能評分" value="momentum" />
            </el-select>
            <el-select v-model="sectorFilter" placeholder="產業篩選" size="small" clearable>
              <el-option
                v-for="sector in sectors"
                :key="sector"
                :label="sector"
                :value="sector"
              />
            </el-select>
          </div>
        </div>
      </template>
      
      <DataTable
        :data="rankingData"
        :columns="tableColumns"
        :loading="loading"
        :paginated="true"
        :total="totalCount"
        :page-size="50"
        :show-toolbar="true"
        :show-refresh="true"
        :show-export="true"
        :actions="tableActions"
        @refresh="fetchRankingData"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      >
        <template #column-composite_score="{ row }">
          <div class="score-cell">
            <div class="score-bar">
              <div 
                class="score-fill"
                :style="{ width: `${row.composite_score}%`, backgroundColor: getScoreColor(row.composite_score) }"
              ></div>
            </div>
            <span class="score-value" :style="{ color: getScoreColor(row.composite_score) }">
              {{ row.composite_score.toFixed(1) }}
            </span>
          </div>
        </template>
        
        <template #column-value_score="{ row }">
          <ScoreBadge :score="row.value_score" />
        </template>
        
        <template #column-growth_score="{ row }">
          <ScoreBadge :score="row.growth_score" />
        </template>
        
        <template #column-quality_score="{ row }">
          <ScoreBadge :score="row.quality_score" />
        </template>
        
        <template #column-momentum_score="{ row }">
          <ScoreBadge :score="row.momentum_score" />
        </template>
      </DataTable>
    </el-card>
    
    <!-- 已選擇股票操作 -->
    <div class="batch-actions" v-if="selectedRows.length > 0">
      <span>已選擇 {{ selectedRows.length }} 檔</span>
      <BaseButton icon="Star" @click="addToWatchlist">加入自選</BaseButton>
      <BaseButton icon="Document" @click="generateReports">生成報告</BaseButton>
      <el-button @click="clearSelection">清除選擇</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/Layout/PageHeader.vue'
import StockSearch from '@/components/Form/StockSearch.vue'
import AIScoreRadar from '@/components/Chart/AIScoreRadar.vue'
import DataTable from '@/components/Table/DataTable.vue'
import ScoreBadge from '@/components/Base/ScoreBadge.vue'
import BaseButton from '@/components/Base/BaseButton.vue'
import { getAIRanking, exportAIRanking } from '@/api/ai/score'
import type { AIRankingItem, SearchParams } from '@/api/ai/types'

const router = useRouter()

// 狀態
const loading = ref(false)
const timeRange = ref('today')
const sortBy = ref('composite')
const sectorFilter = ref('')
const rankingData = ref<AIRankingItem[]>([])
const totalCount = ref(0)
const selectedRows = ref<AIRankingItem[]>([])
const distributionChartRef = ref<HTMLElement>()
let distributionChart: echarts.ECharts | null = null

// 篩選條件
const filterParams = reactive({
  keyword: '',
  market: '',
  industry: '',
})

// 產業清單
const sectors = ref([
  '半導體', '電子組裝', '電腦及週邊', '光電', '通信網路',
  '電子零組件', '其他電子', '鋼鐵', '橡膠', '紡織',
])

// 表格欄位定義
const tableColumns = [
  { prop: 'rank', label: '排名', width: 60 },
  { prop: 'code', label: '代碼', width: 80 },
  { prop: 'name', label: '名稱', width: 100 },
  { prop: 'sector', label: '產業', width: 100 },
  { prop: 'composite_score', label: 'AI 綜合評分', width: 180, sortable: true },
  { prop: 'value_score', label: '價值評分', width: 100 },
  { prop: 'growth_score', label: '成長評分', width: 100 },
  { prop: 'quality_score', label: '品質評分', width: 100 },
  { prop: 'momentum_score', label: '動能評分', width: 100 },
  { prop: 'close', label: '收盤價', width: 100, type: 'number' },
  { prop: 'change_percent', label: '漲跌幅', width: 100, type: 'percent' },
]

// 表格操作
const tableActions = [
  {
    label: '詳情',
    icon: 'View',
    handler: (row: AIRankingItem) => {
      router.push(`/ai/score/${row.code}`)
    },
  },
  {
    label: '自選',
    icon: 'Star',
    handler: (row: AIRankingItem) => {
      addToWatchlist([row])
    },
  },
]

// 市場評分數據
const marketScoreData = computed(() => [
  { name: '價值', value: 72.5, benchmark: 65 },
  { name: '成長', value: 68.3, benchmark: 60 },
  { name: '品質', value: 75.8, benchmark: 70 },
  { name: '動能', value: 62.1, benchmark: 55 },
  { name: '宏觀', value: 70.2, benchmark: 65 },
])

// 獲取評分顏色
const getScoreColor = (score: number) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  if (score >= 40) return '#f56c6c'
  return '#909399'
}

// 獲取排行數據
const fetchRankingData = async () => {
  loading.value = true
  try {
    const result = await getAIRanking({
      timeRange: timeRange.value,
      sortBy: sortBy.value,
      sector: sectorFilter.value,
      ...filterParams,
    })
    rankingData.value = result.list
    totalCount.value = result.total
  } catch (error) {
    ElMessage.error('獲取排行失敗')
  } finally {
    loading.value = false
  }
}

// 搜尋處理
const handleSearch = (params: SearchParams) => {
  Object.assign(filterParams, params)
  fetchRankingData()
}

// 列點擊
const handleRowClick = (row: AIRankingItem) => {
  router.push(`/ai/score/${row.code}`)
}

// 選擇變化
const handleSelectionChange = (rows: AIRankingItem[]) => {
  selectedRows.value = rows
}

// 清除選擇
const clearSelection = () => {
  selectedRows.value = []
}

// 加入自選
const addToWatchlist = async (rows?: AIRankingItem[]) => {
  const stocks = rows || selectedRows.value
  try {
    // await addToWatchlistAPI(stocks.map(s => s.code))
    ElMessage.success(`已將 ${stocks.length} 檔股票加入自選`)
    clearSelection()
  } catch (error) {
    ElMessage.error('加入自選失敗')
  }
}

// 生成報告
const generateReports = async () => {
  const stocks = selectedRows.value
  if (stocks.length === 0) return
  
  try {
    // await generateReportAPI(stocks.map(s => s.code))
    ElMessage.success(`已提交 ${stocks.length} 份報告生成請求`)
    clearSelection()
  } catch (error) {
    ElMessage.error('報告生成失敗')
  }
}

// 匯出排行
const handleExport = async () => {
  try {
    await exportAIRanking({
      timeRange: timeRange.value,
      sortBy: sortBy.value,
      sector: sectorFilter.value,
      ...filterParams,
    })
    ElMessage.success('匯出成功')
  } catch (error) {
    ElMessage.error('匯出失敗')
  }
}

// 初始化分布圖
const initDistributionChart = () => {
  if (!distributionChartRef.value) return
  
  distributionChart = echarts.init(distributionChartRef.value)
  
  const option: echarts.Option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 檔 ({d}%)',
    },
    series: [
      {
        name: '評分分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}檔',
        },
        data: [
          { value: 45, name: '80-100 分', itemStyle: { color: '#67c23a' } },
          { value: 120, name: '60-80 分', itemStyle: { color: '#e6a23c' } },
          { value: 85, name: '40-60 分', itemStyle: { color: '#f56c6c' } },
          { value: 30, name: '40 分以下', itemStyle: { color: '#909399' } },
        ],
      },
    ],
  }
  
  distributionChart.setOption(option)
}

// 監聽
watch([timeRange, sortBy, sectorFilter], () => {
  fetchRankingData()
})

// 生命週期
onMounted(() => {
  fetchRankingData()
  nextTick(() => {
    initDistributionChart()
  })
})
</script>

<style lang="scss" scoped>
.ai-ranking-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-section {
  background-color: var(--bg-color-card);
  border-radius: 8px;
  padding: 16px;
}

.summary-section {
  margin-bottom: 8px;
}

.score-distribution-card {
  height: 100%;
  
  .distribution-chart {
    height: 300px;
  }
}

.ranking-table-card {
  :deep(.el-card__header) {
    padding: 16px 20px;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .table-actions {
    display: flex;
    gap: 12px;
  }
}

.score-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .score-bar {
    flex: 1;
    height: 8px;
    background-color: var(--bg-color-tertiary);
    border-radius: 4px;
    overflow: hidden;
    
    .score-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
  }
  
  .score-value {
    font-weight: 600;
    width: 48px;
    text-align: right;
  }
}

.batch-actions {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background-color: var(--bg-color-card);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  
  span {
    font-weight: 500;
  }
}
</style>
```

---

## 第七章：API 服務層

### 7.1 Axios 請求封裝

request.ts 封裝了 Axios 實例，提供統一的請求與響應處理邏輯。

```typescript
// src/api/request.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElNotification } from 'element-plus'
import router from '@/router'

// 創建 Axios 實例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 從 localStorage 獲取 API Key
    const apiKey = localStorage.getItem('api_key')
    if (apiKey) {
      config.headers = config.headers || {}
      config.headers['X-API-Key'] = apiKey
    }
    
    // 添加時間戳防止快取
    if (config.method === 'get') {
      config.params = config.params || {}
      config.params._t = Date.now()
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
    const { status, data } = response
    
    // 處理業務響應
    if (status === 200) {
      if (data.status === 'success') {
        return data.data
      } else {
        // 業務錯誤
        ElMessage.error(data.error?.message || '操作失敗')
        return Promise.reject(new Error(data.error?.message || 'Operation failed'))
      }
    }
    
    return Promise.reject(new Error(`HTTP Error: ${status}`))
  },
  (error: AxiosError) => {
    const { response } = error
    
    // 處理 HTTP 錯誤
    if (response) {
      switch (response.status) {
        case 401:
          // 未授權，清除登入狀態並跳轉登入頁
          localStorage.removeItem('api_key')
          localStorage.removeItem('user')
          router.push('/login')
          ElNotification.error({
            title: '登入逾時',
            message: '請重新登入',
          })
          break
        case 403:
          ElMessage.error('沒有權限執行此操作')
          break
        case 404:
          ElMessage.error('請求的資源不存在')
          break
        case 429:
          ElMessage.warning('請求過於頻繁，請稍後再試')
          break
        case 500:
          ElMessage.error('伺服器錯誤，請稍後再試')
          break
        default:
          ElMessage.error(`請求失敗 (${response.status})`)
      }
    } else {
      // 網路錯誤
      if (error.message.includes('Network Error')) {
        ElMessage.error('網路連線異常，請檢查網路連線')
      } else if (error.message.includes('timeout')) {
        ElMessage.error('請求超時，請稍後再試')
      } else {
        ElMessage.error('請求失敗')
      }
    }
    
    return Promise.reject(error)
  }
)

export default service
```

### 7.2 行情 API 模組

stocks/stock.ts 定義了行情相關的 API 端點。

```typescript
// src/api/stocks/stock.ts
import request from '../request'
import type { 
  StockInfo, 
  StockPrice, 
  KLineData, 
  StockIndicator,
  SearchParams,
  PaginatedResponse 
} from './types'

/**
 * 搜尋股票
 */
export const searchStocks = (params: SearchParams): Promise<StockInfo[]> => {
  return request.get('/stocks', { params })
}

/**
 * 取得個股基本資訊
 */
export const getStockInfo = (code: string): Promise<StockInfo> => {
  return request.get(`/stocks/${code}`)
}

/**
 * 取得個股歷史行情
 */
export const getStockPrices = (
  code: string,
  params?: {
    startDate?: string
    endDate?: string
    frequency?: 'D' | 'W' | 'M'
  }
): Promise<StockPrice[]> => {
  return request.get(`/stocks/${code}/prices`, { params })
}

/**
 * 取得個股即時報價
 */
export const getStockQuote = (code: string): Promise<StockPrice> => {
  return request.get(`/stocks/${code}/quote`)
}

/**
 * 取得 K 線數據
 */
export const getStockKLine = (
  code: string,
  params?: {
    startDate?: string
    endDate?: string
    chartType?: 'K' | 'Line'
    timeUnit?: 'D' | 'W' | 'M'
  }
): Promise<KLineData[]> => {
  return request.get(`/stocks/${code}/kline`, { params })
}

/**
 * 取得技術指標
 */
export const getStockIndicators = (
  code: string,
  params?: {
    indicators?: string[]
    period?: number
  }
): Promise<Record<string, StockIndicator>> => {
  return request.get(`/stocks/${code}/indicators`, { params })
}

/**
 * 取得股票清單
 */
export const getStockList = (
  params?: {
    market?: string
    industry?: string
    page?: number
    pageSize?: number
  }
): Promise<PaginatedResponse<StockInfo>> => {
  return request.get('/stocks/list', { params })
}

/**
 * 取得自選股清單
 */
export const getWatchlist = (): Promise<StockInfo[]> => {
  return request.get('/stocks/watcher')
}

/**
 * 新增自選股
 */
export const addToWatchlist = (code: string): Promise<void> => {
  return request.post('/stocks/watcher', { code })
}

/**
 * 移除自選股
 */
export const removeFromWatchlist = (code: string): Promise<void> => {
  return request.delete(`/stocks/watcher/${code}`)
}

/**
 * 搜尋產業清單
 */
export const getIndustries = (query?: string): Promise<{ code: string; name: string }[]> => {
  return request.get('/stocks/industries', { params: { query } })
}
```

### 7.3 宏觀數據 API 模組

macro/macro.ts 定義了宏觀數據相關的 API 端點。

```typescript
// src/api/macro/macro.ts
import request from '../request'
import type {
  MacroIndicator,
  MacroIndicatorInfo,
  MacroFactor,
  EconomicEvent,
  SearchParams,
  PaginatedResponse,
  TimeSeriesResponse
} from './types'

/**
 * 搜尋宏觀指標
 */
export const searchIndicators = (
  params?: SearchParams
): Promise<PaginatedResponse<MacroIndicatorInfo>> => {
  return request.get('/macro/indicators', { params })
}

/**
 * 取得特定指標數據
 */
export const getIndicatorData = (
  code: string,
  params?: {
    startDate?: string
    endDate?: string
    transformation?: '原值' | 'YoY' | 'MoM' | 'QoQ'
  }
): Promise<TimeSeriesResponse<MacroIndicator>> => {
  return request.get(`/macro/indicators/${code}`, { params })
}

/**
 * 取得指標基本資訊
 */
export const getIndicatorInfo = (code: string): Promise<MacroIndicatorInfo> => {
  return request.get(`/macro/indicators/${code}/info`)
}

/**
 * 取得支援的國家清單
 */
export const getCountries = (): Promise<{ code: string; name: string }[]> => {
  return request.get('/macro/countries')
}

/**
 * 取得指標分類清單
 */
export const getCategories = (): Promise<{ code: string; name: string }[]> => {
  return request.get('/macro/categories')
}

/**
 * 取得宏觀因子
 */
export const getMacroFactors = (
  params?: {
    startDate?: string
    endDate?: string
    category?: string
  }
): Promise<MacroFactor[]> => {
  return request.get('/macro/factors', { params })
}

/**
 * 取得經濟日曆
 */
export const getEconomicCalendar = (
  params?: {
    startDate?: string
    endDate?: string
    country?: string
    impact?: string
  }
): Promise<EconomicEvent[]> => {
  return request.get('/macro/calendar', { params })
}

/**
 * 取得國家 GDP 趨勢
 */
export const getGDPTrend = (
  country: string,
  params?: {
    startDate?: string
    endDate?: string
  }
): Promise<TimeSeriesResponse<{ gdp: number; growth: number }>> => {
  return request.get(`/macro/countries/${country}/gdp`, { params })
}

/**
 * 取得利率趨勢
 */
export const getInterestRateTrend = (
  country: string,
  params?: {
    startDate?: string
    endDate?: string
  }
): Promise<TimeSeriesResponse<{ rate: number }>> => {
  return request.get(`/macro/countries/${country}/interest-rate`, { params })
}
```

### 7.4 AI 分析 API 模組

ai/score.ts 定義了 AI 分析相關的 API 端點。

```typescript
// src/api/ai/score.ts
import request from '../request'
import type {
  AIScore,
  AIRankingItem,
  AIReport,
  EvolutionInfo,
  SearchParams,
  PaginatedResponse
} from './types'

/**
 * 取得 AI 評分排行
 */
export const getAIRanking = (
  params?: SearchParams
): Promise<PaginatedResponse<AIRankingItem>> => {
  return request.get('/ai/scores', { params })
}

/**
 * 取得個股 AI 評分
 */
export const getAIScore = (code: string): Promise<AIScore> => {
  return request.get(`/ai/scores/${code}`)
}

/**
 * 取得 AI 評分趨勢
 */
export const getAIScoreTrend = (
  code: string,
  params?: {
    period?: '1W' | '1M' | '3M' | '1Y'
  }
): Promise<{ date: string; score: number }[]> => {
  return request.get(`/ai/scores/${code}/trend`, { params })
}

/**
 * 取得 AI 報告清單
 */
export const getAIReports = (
  params?: {
    page?: number
    pageSize?: number
    type?: string
  }
): Promise<PaginatedResponse<AIReport>> => {
  return request.get('/ai/reports', { params })
}

/**
 * 取得特定 AI 報告
 */
export const getAIReport = (id: string): Promise<AIReport> => {
  return request.get(`/ai/reports/${id}`)
}

/**
 * 生成 AI 報告
 */
export const generateAIReport = (code: string): Promise<{ reportId: string }> => {
  return request.post(`/ai/reports`, { code })
}

/**
 * 語義搜尋 AI 報告
 */
export const semanticSearch = (
  query: string,
  params?: {
    limit?: number
  }
): Promise<{ reports: AIReport[]; similarScore: number[] }> => {
  return request.post('/ai/search', { query, ...params })
}

/**
 * 取得演化策略資訊
 */
export const getEvolutionInfo = (): Promise<EvolutionInfo> => {
  return request.get('/ai/evolution')
}

/**
 * 匯出 AI 排行
 */
export const exportAIRanking = (params?: SearchParams): Promise<Blob> => {
  return request.get('/ai/scores/export', {
    params,
    responseType: 'blob',
  })
}
```

---

## 第八章：狀態管理層

### 8.1 Pinia Store 配置

stores/index.ts 配置 Pinia 存儲並導出各個 Store。

```typescript
// src/stores/index.ts
import { createPinia } from 'pinia'

const pinia = createPinia()

export const setupStore = (app: any) => {
  app.use(pinia)
}

export { useUserStore } from './user'
export { useAppStore } from './app'
export { useStockStore } from './stock'
export { useMacroStore } from './macro'
export { useAIStore } from './ai'
```

### 8.2 用戶 Store

stores/user.ts 管理用戶相關的狀態。

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getProfile, updateProfile } from '@/api/user/auth'
import type { User, LoginParams } from '@/api/user/types'

export const useUserStore = defineStore('user', () => {
  // 狀態
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoggedIn = ref(false)
  const preferences = ref({
    theme: 'light',
    language: 'zh-TW',
    defaultMarket: '上市',
    refreshInterval: 30000,
  })

  // 計算屬性
  const userName = computed(() => user.value?.name || '用戶')
  const userId = computed(() => user.value?.id || '')

  // 方法
  const loginAction = async (params: LoginParams) => {
    try {
      const response = await login(params)
      token.value = response.token
      user.value = response.user
      isLoggedIn.value = true
      
      // 儲存至 localStorage
      localStorage.setItem('api_key', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logoutAction = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 清除本地狀態
      token.value = null
      user.value = null
      isLoggedIn.value = false
      localStorage.removeItem('api_key')
      localStorage.removeItem('user')
    }
  }

  const initUser = async () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('api_key')
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
        isLoggedIn.value = true
        
        // 驗證 token 有效性
        await getProfile()
      } catch (error) {
        // Token 無效，清除狀態
        logoutAction()
      }
    }
  }

  const updatePreferences = (newPreferences: Partial<typeof preferences.value>) => {
    preferences.value = { ...preferences.value, ...newPreferences }
    localStorage.setItem('preferences', JSON.stringify(preferences.value))
  }

  const loadPreferences = () => {
    const saved = localStorage.getItem('preferences')
    if (saved) {
      preferences.value = { ...preferences.value, ...JSON.parse(saved) }
    }
  }

  return {
    // 狀態
    user,
    token,
    isLoggedIn,
    preferences,
    // 計算屬性
    userName,
    userId,
    // 方法
    loginAction,
    logoutAction,
    initUser,
    updatePreferences,
    loadPreferences,
  }
})
```

### 8.3 應用配置 Store

stores/app.ts 管理應用層級的配置與狀態。

```typescript
// src/stores/app.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 狀態
  const sidebarCollapsed = ref(false)
  const isDarkMode = ref(false)
  const cachedViews = ref<string[]>([])
  const globalLoading = ref(false)
  const notificationCount = ref(0)
  
  // 側邊欄
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed.value))
  }
  
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebar_collapsed', String(collapsed))
  }
  
  // 主題
  const setDarkMode = (dark: boolean) => {
    isDarkMode.value = dark
    document.documentElement.classList.toggle('dark-mode', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }
  
  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode.value)
  }
  
  // 缓存视图
  const addCachedView = (viewName: string) => {
    if (!cachedViews.value.includes(viewName)) {
      cachedViews.value.push(viewName)
    }
  }
  
  const removeCachedView = (viewName: string) => {
    const index = cachedViews.value.indexOf(viewName)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }
  
  // 全局加载状态
  const setGlobalLoading = (loading: boolean) => {
    globalLoading.value = loading
  }
  
  // 初始化
  const initAppState = () => {
    // 側邊欄狀態
    const savedSidebar = localStorage.getItem('sidebar_collapsed')
    if (savedSidebar !== null) {
      sidebarCollapsed.value = savedSidebar === 'true'
    }
    
    // 主題狀態
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
      document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
    }
  }
  
  return {
    // 狀態
    sidebarCollapsed,
    isDarkMode,
    cachedViews,
    globalLoading,
    notificationCount,
    // 方法
    toggleSidebar,
    setSidebarCollapsed,
    setDarkMode,
    toggleDarkMode,
    addCachedView,
    removeCachedView,
    setGlobalLoading,
    initAppState,
  }
})
```

---

## 第九章：樣式與主題系統

### 9.1 全域樣式檔案結構

styles 目錄包含全域的樣式定義。

```
src/styles/
├── index.scss                    # 全域樣式入口
├── variables.scss                # CSS 變數定義
├── mixins.scss                   # SCSS 混入
├── reset.scss                    # CSS 重置
├── typography.scss               # 字體與排版
├── layout.scss                   # 布局相關樣式
├── dark-theme.scss               # 暗色主題
└── element-plus-overrides.scss   # Element Plus 客製化
```

### 9.2 CSS 變數定義

variables.scss 定義所有 CSS 變數，支援主題切換。

```scss
// src/styles/variables.scss

// ========== 主題顏色 ==========
$--colors: (
  'primary': (
    'base': #409eff,
    'light-1': #66b1ff,
    'light-2': #8cc5ff,
    'light-3': #a0cfff,
    'light-4': #b3d8ff,
    'light-5': #c6e2ff,
    'light-6': #d9ecff,
    'light-7': #ecf5ff,
  ),
  'success': (
    'base': #67c23a,
    'light-1': #85ce61,
    'light-2': #a3d293,
    'light-3': #b3e19d,
    'light-4': #c2e7b0,
    'light-5': #d1edc8,
    'light-6': #e1f3d8,
    'light-7': #f0f9eb,
  ),
  'warning': (
    'base': #e6a23c,
    'light-1': #ebb563,
    'light-2': #f0c78a,
    'light-3': #f3d19e,
    'light-4': #f5dab1,
    'light-5': #f9e3be,
    'light-6': #fcebcc,
    'light-7': #fdf6ec,
  ),
  'danger': (
    'base': #f56c6c,
    'light-1': #f78989,
    'light-2': #f96c6c,
    'light-3': #f89898,
    'light-4': #f9a8a8,
    'light-5': #fab6b6,
    'light-6': #fbc4c4,
    'light-7': #fde2e2,
  ),
  'info': (
    'base': #909399,
    'light-1': #a6a9ad,
    'light-2': #b3b8c2,
    'light-3': #c0c4cc,
    'light-4': #c8c9cc,
    'light-5': #d3d4d6,
    'light-6': #dcdfe6,
    'light-7': #e4e7ed,
  ),
);

// 生成 CSS 變數
@each $type, $map in $--colors {
  @each $key, $value in $map {
    --#{$type}-color-#{$key}: #{$value};
  }
}

// ========== 背景色 ==========
$--bg-colors: (
  'primary': #f5f7fa,
  'secondary': #ffffff,
  'tertiary': #f0f2f5,
  'card': #ffffff,
  'dark': #141414,
  'dark-secondary': #1d1d1d,
);

// ========== 文字顏色 ==========
$--text-colors: (
  'primary': #303133,
  'secondary': #606266,
  'tertiary': #909399,
  'placeholder': #c0c4cc,
  'light': #ffffff,
);

// ========== 邊框顏色 ==========
$--border-colors: (
  'base': #dcdfe6,
  'light': #e4e7ed,
  'lighter': #ebeef5,
  'extra-light': #f2f6fc,
);

// ========== 字體 ==========
$--font-size-base: 14px;
$--font-size-small: 12px;
$--font-size-medium: 16px;
$--font-size-large: 18px;
$--font-size-extra-large: 20px;

// ========== 圓角 ==========
$--border-radius-base: 4px;
$--border-radius-small: 2px;
$--border-radius-medium: 8px;
$--border-radius-large: 12px;
$--border-radius-extra-large: 16px;

// ========== 陰影 ==========
$--box-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.12);
$--box-shadow-light: 0 2px 12px rgba(0, 0, 0, 0.1);
$--box-shadow-dark: 0 4px 16px rgba(0, 0, 0, 0.2);

// ========== 間距 ==========
$--spacing-xs: 4px;
$--spacing-sm: 8px;
$--spacing-base: 16px;
$--spacing-md: 24px;
$--spacing-lg: 32px;
$--spacing-xl: 40px;
```

### 9.3 暗色主題樣式

dark-theme.scss 定義暗色主題的樣式覆蓋。

```scss
// src/styles/dark-theme.scss

html.dark-mode {
  // ========== 背景色 ==========
  --bg-color-primary: #141414;
  --bg-color-secondary: #1d1d1d;
  --bg-color-tertiary: #262626;
  --bg-color-card: #1d1d1d;
  --bg-color-hover: #262626;
  
  // ========== 文字顏色 ==========
  --text-color-primary: #e0e0e0;
  --text-color-secondary: #a0a0a0;
  --text-color-tertiary: #707070;
  --text-color-placeholder: #505050;
  
  // ========== 邊框顏色 ==========
  --border-color: #333333;
  --border-color-light: #404040;
  --border-color-lighter: #4d4d4d;
  
  // ========== Element Plus 覆寫 ==========
  --el-bg-color: #1d1d1d;
  --el-bg-color-overlay: #262626;
  --el-fill-color-blank: #1d1d1d;
  --el-fill-color-light: #262626;
  --el-fill-color-lighter: #333333;
  --el-text-color-primary: #e0e0e0;
  --el-text-color-regular: #a0a0a0;
  --el-text-color-secondary: #707070;
  --el-border-color: #333333;
  
  // ========== 表格样式 ==========
  .el-table {
    --el-table-bg-color: #1d1d1d;
    --el-table-tr-bg-color: #1d1d1d;
    --el-table-header-bg-color: #262626;
    --el-table-row-hover-bg-color: #262626;
    --el-table-border-color: #333333;
    --el-table-border: 1px solid #333333;
  }
  
  // ========== 表單样式 ==========
  .el-input__wrapper,
  .el-select__wrapper,
  .el-textarea__inner {
    background-color: #262626;
    box-shadow: 0 0 0 1px #404040 inset;
    
    &:hover {
      box-shadow: 0 0 0 1px #505050 inset;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px var(--primary-color) inset;
    }
  }
  
  // ========== 卡片样式 ==========
  .el-card {
    --el-card-bg-color: #1d1d1d;
    background-color: #1d1d1d;
    border: 1px solid #333333;
  }
  
  // ========== 對話框样式 ==========
  .el-dialog {
    --el-dialog-bg-color: #1d1d1d;
    background-color: #1d1d1d;
    border: 1px solid #333333;
  }
  
  .el-drawer {
    background-color: #1d1d1d;
  }
  
  // ========== 消息提示 ==========
  .el-message-box {
    --el-messagebox-bg-color: #1d1d1d;
    background-color: #1d1d1d;
    border: 1px solid #333333;
  }
}
```

---

## 第十章：圖表與數據視覺化

### 10.1 圖表封裝策略

系統的圖表封裝採用以下策略以確保一致的使用體驗與效能。所有圖表元件封裝為 Vue 元件，內部管理 ECharts 實例的生命週期。圖表配置透過 props 傳入，支援響應式更新。圖表透過 useResizeObserver 監聽容器大小變化，自動調整尺寸。大量數據使用 ECharts 的漸進載入與取樣功能優化效能。

### 10.2 常用圖表工具函式

utils/chart.ts 提供圖表相關的工具函式。

```typescript
// src/utils/chart.ts
import * as echarts from 'echarts'

/**
 * 取得評分對應的顏色
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  if (score >= 40) return '#f56c6c'
  return '#909399'
}

/**
 * 取得漲跌對應的顏色
 */
export const getChangeColor = (change: number): string => {
  if (change > 0) return '#ef4444'
  if (change < 0) return '#22c55e'
  return '#909399'
}

/**
 * 格式化 K 線數據
 */
export const formatKLineData = (data: {
  date: string
  open: number
  high: number
  low: number
  close: number
}): any[] => {
  return [
    [data.open, data.close, data.low, data.high]
  ]
}

/**
 * 計算移動平均線
 */
export const calculateMA = (
  data: number[],
  period: number
): (number | null)[] => {
  const result: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
    } else {
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j]
      }
      result.push(sum / period)
    }
  }
  return result
}

/**
 * 取得默認的 ECharts 選項
 */
export const getDefaultOptions = (): echarts.EChartsOption => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      animation: false,
    },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e4e7ed',
    borderWidth: 1,
    textStyle: {
      color: '#303133',
    },
    padding: [10, 15],
    extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;',
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  axisPointer: {
    link: { xAxisIndex: 'all' },
    label: {
      backgroundColor: '#777',
    },
  },
})

/**
 * 取得 K 線圖的默認選項
 */
export const getCandlestickDefaultOptions = (): echarts.EChartsOption => ({
  ...getDefaultOptions(),
  animation: true,
  animationDuration: 300,
  animationEasing: 'cubicOut',
})

/**
 * 釋放 ECharts 實例
 */
export const disposeChart = (chart: echarts.ECharts | null) => {
  if (chart) {
    chart.dispose()
  }
}

/**
 * 調整圖表尺寸
 */
export const resizeChart = (chart: echarts.ECharts | null) => {
  if (chart) {
    chart.resize()
  }
}
```

---

## 第十一章：效能優化策略

### 11.1 載入優化

系統採用以下策略優化初始載入效能。

代碼分割方面，Vite 會自動進行代碼分割，透過分析 import 語句將大型依賴（如 Element Plus、ECharts）分離到獨立的 chunk。按路由分割頁面代碼，使用异步组件實現按需載入。使用 defineAsyncComponent 延遲載入非關鍵元件。

資源優化方面，靜態資源（圖片、字體）進行壓縮與緩存。CSS 與 JavaScript 進行壓縮（使用 terser）。使用 Gzip/Brotli 壓縮（透過伺服器配置）。

### 11.2 渲染優化

虛擬滚动方面，當列表數據量很大時（如股票清單），使用虛擬滾動技術只渲染可見區域的項目。推薦使用 vue-virtual-scroller 庫實現虛擬滾動。

列表優化方面，表格使用 Element Plus 的 Table 虛擬滾動功能。避免在 v-for 中使用複雜的計算屬性。使用 key 優化 Vue 的 Diff 算法。

快取策略方面，計算屬性會自動緩存。使用 keep-alive 緩存已訪問的頁面。善用本地存儲緩存不經常變化的數據。

### 11.3 網路優化

請求優化方面，合併多個小請求。使用 GET 請求的缓存（添加时间戳参数）。实现请求取消机制，避免无用请求。

數據優化方面，後端返回必要的最小數據集。實現分頁載入，避免一次加载所有數據。使用 WebSocket 實現即時數據推送。

---

## 第十二章：測試與品質保證

### 12.1 測試策略

系統的測試策略分為多個層次。

單元測試使用 Vitest 測試框架，針對工具函式、組合式函式、及小型元件進行測試。測試檔案位於 tests/unit 目錄，命名為 *.spec.ts。

元件測試使用 Vue Test Utils 測試 Vue 元件的渲染與互動。測試檔案位於 tests/components 目錄，命名為 *.spec.ts。

端到端測試使用 Playwright 測試完整的用戶流程。測試檔案位於 tests/e2e 目錄，命名為 *.spec.ts。

### 12.2 測試配置

vitest.config.ts 配置 Vitest 測試框架。

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.vue',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

### 12.3 程式碼品質檢查

ESLint 配置確保 JavaScript/TypeScript 程式碼的一致性與品質。

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
```

---

## 第十三章：建置與部署

### 13.1 環境變數配置

.env.development 開發環境變數。

```env
# API
VITE_API_BASE_URL=http://localhost:5000/api

# 應用
VITE_APP_TITLE=AI 投資分析儀 V10.0
VITE_APP_VERSION=10.0.0

# 功能開關
VITE_ENABLE_MOCK=true
VITE_ENABLE_ANALYTICS=false
```

.env.production 生產環境變數。

```env
# API
VITE_API_BASE_URL=/api

# 應用
VITE_APP_TITLE=AI 投資分析儀 V10.0
VITE_APP_VERSION=10.0.0

# 功能開關
VITE_ENABLE_MOCK=false
VITE_ENABLE_ANALYTICS=true
```

### 13.2 Nginx 部署配置

在 NAS 上部署前端時，需要配置 Nginx 作為反向代理。

```nginx
# /etc/nginx/conf.d/ai-invest.conf

server {
    listen 443 ssl http2;
    server_name ai-invest.local;
    
    # SSL 憑證
    ssl_certificate /etc/letsencrypt/live/ai-invest.local/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ai-invest.local/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # 安全頭
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
    
    # 前端靜態文件
    root /usr/share/nginx/html/ai-invest;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-NginX-Proxy true;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    # WebSocket 代理（如果有）
    location /ws/ {
        proxy_pass http://127.0.0.1:5000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
    
    # 靜態資源緩存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康檢查
    location /health {
        access_log off;
        return 200 "OK";
    }
}

# HTTP 重定向
server {
    listen 80;
    server_name ai-invest.local;
    return 301 https://$server_name$request_uri;
}
```

### 13.3 Docker 部署配置

frontend/Dockerfile 定義前端應用程式的 Docker 映像。

```dockerfile
# 建置階段
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 執行階段
FROM nginx:alpine

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 複製建置好的靜態文件
COPY --from=builder /app/dist /usr/share/nginx/html/ai-invest

# 暴露端口
EXPOSE 80 443

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## 結論

本文檔完整描述了 AI 投資分析儀 V10.0 前端應用程式的開發規格，涵蓋專案結構、核心框架配置、通用元件、業務元件、頁面視圖、API 服務、狀態管理、樣式系統、圖表視覺化、效能優化、測試策略、以及建置部署等各個層面。

前端應用程式採用 Vue.js 3 搭配現代化的技術棧，遵循元件化、模組化、可維護的設計原則，為用戶提供專業的投資分析介面。透過完善的前端架構設計與品質保證機制，確保系統能夠穩定、高效地運行，滿足專業投資人對數據分析與投資決策支援的需求。

---

**文件結束**

*本文檔為 AI 投資分析儀 V10.0 前端完整開發文件*  
*文件編號：SYS-FRONTEND-001*  
*版本：5.0.0*  
*建立日期：2026年2月15日*  
*文件狀態：正式發布*  

---

**核準簽章**：

| 角色 | 姓名 | 簽章 | 日期 |
|------|------|------|------|
| 撰寫 | 前端架構師 | _____________ | _____________ |
| 審查 | 技術負責人 | _____________ | _____________ |
| 核准 | 專案經理 | _____________ | _____________ |

---

**附錄 A：技術棧摘要**

| 類別 | 技術 | 版本 |
|------|------|------|
| 核心框架 | Vue.js | 3.4.x |
| 構建工具 | Vite | 5.x |
| 狀態管理 | Pinia | 2.x |
| 路由管理 | Vue Router | 4.x |
| UI 框架 | Element Plus | 2.x |
| 圖表庫 | ECharts | 5.x |
| 類型檢查 | TypeScript | 5.x |
| 測試框架 | Vitest | 1.x |
| 代碼規範 | ESLint + Prettier | 最新版 |

**附錄 B：瀏覽器相容性**

| 瀏覽器 | 版本 | 支援狀態 |
|--------|------|----------|
| Chrome | 最新版 + 前2版 | 完全支援 |
| Firefox | 最新版 + 前2版 | 完全支援 |
| Edge | 最新版 + 前2版 | 完全支援 |
| Safari | 最新版 + 前2版 | 基本支援 |

**附錄 C：依賴套件清單**

| 套件名稱 | 用途 | 許可證 |
|----------|------|--------|
| vue | 核心框架 | MIT |
| pinia | 狀態管理 | MIT |
| vue-router | 路由管理 | MIT |
| element-plus | UI 元件庫 | MIT |
| echarts | 圖表庫 | Apache 2.0 |
| axios | HTTP 客戶端 | MIT |
| dayjs | 日期處理 | MIT |
| @vueuse/core | Vue 組合式工具 | MIT |