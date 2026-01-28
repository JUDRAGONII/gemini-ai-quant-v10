# 024_Phase4.5_KLine_RuntimeError_Fix (K線圖指標 ID 錯誤修復)

**文件編號**：DEV-LOG-005
**版本**：1.0.0
**建立日期**：2026-01-28
**目的**：修復 K線技術分析面板中與 `priceScale` 相關的執行階段錯誤。

---

## 📅 自動產生日誌：2026-01-28

### 1. 工作項目：T-EMG-003 修復 K線圖 ID 錯誤

**狀態**：✅ 已完成

#### 🛠️ 處理過程

- [x] **故障定位**：根據截圖發現 `TechnicalIndicatorPanel.tsx` 在呼叫 `priceScale('')` 時因 ID 無效導致崩潰。
- [x] **代碼重構**：
    - 將 `RSI` 與 `MACD` 的 `scaleMargins` 配置整合進 `createChart` 的初始化選項。
    - 移除 `useEffect` 中手動調用 `applyOptions` 的代碼。
- [x] **防禦修復**：同步檢查 `KLineChart.tsx` 並將成交量的 `priceScaleId` 從 `''` 改為具備語義的 `'volume'`。

#### 💡 技術決策

1. **優先使用初始化配置**：在 `createChart` 時定義比例尺邊距 (Margins) 比在渲染後動態獲取比例尺更穩定且符合 KISS 原則。
2. **唯一性 ID**：對於非主軸的比例尺 (如成交量)，必須提供明確的 ID 以避免遺失或衝突。

---

*文件編號：DEV-LOG-005*
*維護者：Antigravity Agent*
*最後更新日期：2026-01-28*
*修復狀態：✅ 已驗收代碼邏輯*
