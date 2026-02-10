# 050_Phase13_3_Evolutionary_Genome_Visualizer.md

# 🧬 Phase 13.3: 演化策略基因組視覺化 (Evolutionary Visualizer)

## 1. 需求解構 (Thinking Phase)
依照 V10.0 憲級 Chapter 9.1，演化算法 (GA) 優化了 26 個基因，但目前對使用者而言是黑盒子。我們需要將這些基因位點「地圖化」，展示系統如何自我進化。
- **核心目標**：視覺化 26 基因位點及其對適應度 (Sharpe Ratio) 的貢獻。

---

## 2. 架構設計審核 (/architect)

### 2.1 基因組地圖配置 (26 Genes)
- **G0-G13 (核心基因)**: 權重、閾值、持有天數。
- **G14-G25 (調控基因)**: 突變率、族群規模、演化速率。
- **動態展示**：當最佳個體發生突變時，UI 應呈現脈衝波紋效果。

---

## 3. UI/UX 視覺標準 (/ui-ux-pro-max)
- **組件名**：`EvolutionVisualizer.tsx`.
- **圖表類型**：雙層環狀圖 (Sunburst) 或 弦圖 (Chord Diagram) 展示基因與報酬的相關性。
- **調色盤**：基因位點使用活性漸變色 (例如從紫色到金色的適應度映射)。

---

## 4. 任務清單 (Tasks)
- [ ] **DB-01**: 補齊 `evolution_history` 表，記錄每一代 (Generation) 的中位數基因組。
- [ ] **API-01**: 實作 `/evolution/best-individual` 與 `/evolution/history` 端點。
- [ ] **UI-01**: 開發 `GenomeMap.tsx` 展示 26 個位點的數值分布。
- [ ] **UI-02**: 實作 `FitnessHeatmap.tsx` 展示穿越牛熊週期的適應度遷移。

---
**日期**：2026-02-10
