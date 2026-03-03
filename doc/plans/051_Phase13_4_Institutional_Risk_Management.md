# 051_Phase13_4_Institutional_Risk_Management.md

# 🛡️ Phase 13.4: 法人級風險矩陣與行為監控 (Institutional Risk)

## 1. 需求解構 (Thinking Phase)
依照 V10.0 憲級 Chapter 5.6，除了分數，投資人更需要知道標的在極端環境下的「敏感度」。例如當 VIX 翻倍時，持倉的回撤風險是多少 (Stress Test)。
- **核心目標**：實作 Greeks 模擬矩陣與 Barra 因子歸因。

---

## 2. 核心技術規格 (/architect)

### 2.1 風險維度
- **Delta/Gamma (模擬)**：標的價格波動對評分的敏感度。
- **Barra 風險分解**：將報酬拆解為「規模、價值、動能、波動」等因子貢獻度。
- **Stress Test**：模擬 2008 金融海嘯、2020 熔斷情境下的預期跌幅。

---

## 3. UI/UX 設計規範 (/ui-ux-pro-max)

### 3.1 專業視覺終端
- **組件名**：`GreeksMonitor.tsx`.
- **視覺效果**：熱圖矩陣 (Heatmap Matrix)，使用紅綠對比展示曝險級別。
- **行為教練**：`PsychologyHub.tsx` 整合偏誤偵測 (例如：損失厭惡、過度自信報告)。

---

## 4. 任務清單 (Tasks)
- [ ] **QUANT-01**: 實作 Python 風險計算模組，產出 Greeks 模擬數據。
- [ ] **API-01**: 實作 `/professional/risk-matrix` 端點。
- [ ] **UI-01**: 開發 `GreeksMonitor.tsx` 熱圖矩陣組件。
- [ ] **UI-02**: 強化 `PsychologyHub.tsx`，記錄並分析用戶「計畫 vs 執行」的偏差。

---
**日期**：2026-02-10
