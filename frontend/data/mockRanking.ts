/**
 * AI 評分模擬數據 (固定種子版本)
 * Phase 4.2 使用，未來將替換為 Supabase stock_factors 表真實數據
 * 
 * 注意：使用固定數據避免 SSR/CSR Hydration Mismatch 錯誤
 */

import { mockTWStocks, mockUSStocks } from "./mockStocks";

interface StockRankingItem {
    rank: number;
    symbol: string;
    name: string;
    compositeScore: number;
    valueScore: number;
    growthScore: number;
    momentumScore: number;
    qualityScore: number;
    chipScore: number;
    changePercent: number;
}

/**
 * 固定的評分數據 (避免 Hydration Error)
 * 伺服器與客戶端必須產生相同的數據
 */
const FIXED_SCORES: Record<string, {
    valueScore: number;
    growthScore: number;
    momentumScore: number;
    qualityScore: number;
    chipScore: number;
}> = {
    "2330": { valueScore: 78, growthScore: 72, momentumScore: 68, qualityScore: 82, chipScore: 65 },
    "2317": { valueScore: 65, growthScore: 58, momentumScore: 52, qualityScore: 70, chipScore: 55 },
    "2454": { valueScore: 70, growthScore: 85, momentumScore: 78, qualityScore: 75, chipScore: 72 },
    "2881": { valueScore: 72, growthScore: 55, momentumScore: 48, qualityScore: 78, chipScore: 62 },
    "2412": { valueScore: 68, growthScore: 45, momentumScore: 42, qualityScore: 85, chipScore: 58 },
    "2308": { valueScore: 75, growthScore: 68, momentumScore: 62, qualityScore: 80, chipScore: 68 },
    "AAPL": { valueScore: 72, growthScore: 65, momentumScore: 70, qualityScore: 88, chipScore: 75 },
    "NVDA": { valueScore: 55, growthScore: 95, momentumScore: 92, qualityScore: 78, chipScore: 85 },
    "MSFT": { valueScore: 68, growthScore: 75, momentumScore: 72, qualityScore: 90, chipScore: 78 },
    "GOOGL": { valueScore: 70, growthScore: 68, momentumScore: 58, qualityScore: 85, chipScore: 70 },
};

// 生成 AI 評分數據 (使用固定分數)
const generateRankingData = (): StockRankingItem[] => {
    const allStocks = [...mockTWStocks, ...mockUSStocks];

    const rankedStocks = allStocks.map((stock) => {
        // 使用固定分數或預設值
        const scores = FIXED_SCORES[stock.symbol] || {
            valueScore: 60,
            growthScore: 60,
            momentumScore: 60,
            qualityScore: 60,
            chipScore: 60,
        };

        // 綜合評分 (加權平均)
        const compositeScore = Math.round(
            scores.valueScore * 0.25 +
            scores.growthScore * 0.2 +
            scores.momentumScore * 0.2 +
            scores.qualityScore * 0.2 +
            scores.chipScore * 0.15
        );

        return {
            rank: 0, // 稍後計算
            symbol: stock.symbol,
            name: stock.name,
            compositeScore,
            valueScore: scores.valueScore,
            growthScore: scores.growthScore,
            momentumScore: scores.momentumScore,
            qualityScore: scores.qualityScore,
            chipScore: scores.chipScore,
            changePercent: stock.changePercent,
        };
    });

    // 依綜合評分排序並賦予排名
    rankedStocks.sort((a, b) => b.compositeScore - a.compositeScore);
    rankedStocks.forEach((stock, index) => {
        stock.rank = index + 1;
    });

    return rankedStocks;
};

// 導出模擬數據 (固定數據確保 SSR/CSR 一致)
export const mockRankingData = generateRankingData();

// 也提供一個生成函數供需要時調用
export { generateRankingData };
