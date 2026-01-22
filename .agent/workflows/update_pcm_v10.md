---
description: 更新階段控制矩陣 (Phase Control Matrix)
---

# 🚦 更新 PCM (Update Phase Control Matrix) - V10.0

用於維護專案進度與里程碑狀態。

1. **讀取 PCM (Read Matrix)**
   - 開啟 `doc/PCM/0-0_V10.0_Phase_Control_Matrix.md`。

2. **狀態評估 (Assess Status)**
   - 檢視當前 Phase 的 Checkbox 項目 (`[ ]`).
   - 若某 Phase 之所有關鍵項目已完成，將其狀態由 `進行中 🟢` 更新為 `已完成 ✅`。
   - 若啟動新 Phase，將其狀態更新為 `進行中 🟢`。

3. **同步開發摘要 (Sync Summary)**
   - 更新 `doc/PCM/0-1_DEV_SUMMARY.md` 中的「當前里程碑」與 PCM 保持一致。

4. **人工確認 (Review)**
   - 請求使用者確認更新後的狀態是否準確。
