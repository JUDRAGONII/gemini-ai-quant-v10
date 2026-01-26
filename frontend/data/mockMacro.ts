/**
 * 宏觀指標模擬數據 (Mock Data)
 * Phase 4.5 專業版：支援區域分區、類別分組與歷史走勢數據
 */

// 定義歷史數據格式
export interface HistoryPoint {
    date: string;
    value: number;
}

// 指標介面
export interface MacroIndicator {
    code: string;
    name: string;
    fullName: string;
    country: string;
    category: string;
    description: string;
    unit: string;
    color: string;
    latestValue: number;
    changePercent: number;
    frequency: string;
    source: string;
    historyData: HistoryPoint[];
}

// 生成模擬歷史數據 (History + Sparkline)
// 為了滿足詳情頁需求，生成 30 天數據
const generateHistory = (baseValue: number, volatility: number = 0.02, days: number = 60): HistoryPoint[] => {
    const data: HistoryPoint[] = [];
    let value = baseValue;
    const today = new Date();

    // 生成過去 N 天的數據 (倒序生成)
    // 我們先生成一個數列，然後反轉日期賦值，確保今天是 latestValue
    const values: number[] = [baseValue];

    // 隨機漫步生成過去的值
    let currentValue = baseValue;
    for (let i = 0; i < days; i++) {
        // 逆向推導：昨天的值 = 今天的值 / (1 + 變化率)
        // 簡化：直接隨機波動
        currentValue = currentValue * (1 + (Math.random() - 0.5) * volatility);
        values.push(Math.round(currentValue * 1000) / 1000);
    }

    // values[0] 是最新值 (Today)
    // values[days] 是最舊值

    // 賦予日期 (最新的在最後) - 對應 AreaChart 通常從左(舊)到右(新)
    // 但 page.tsx 表格是 slice().reverse()，所以原始數據應該是 時間正序 (舊 -> 新)

    const sortedValues = values.reverse(); // 變成 舊 -> 新 (大概)

    for (let i = 0; i < sortedValues.length; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (sortedValues.length - 1 - i));
        const dateStr = date.toISOString().split('T')[0];

        data.push({
            date: dateStr,
            value: sortedValues[i]
        });
    }

    return data;
};


// 指標配置
export const MACRO_INDICATORS: MacroIndicator[] = [
    // --- 美國 (US) ---
    {
        code: "FEDFUNDS",
        name: "聯邦基金利率",
        fullName: "Federal Funds Rate",
        country: "US",
        category: "金融與利率",
        description: "美國銀行之間隔夜貸款的利率，是美聯儲控制貨幣政策的主要工具。",
        unit: "%",
        color: "#10B981", // Emerald
        latestValue: 5.33,
        changePercent: 0.0,
        frequency: "FOMC",
        source: "FRED",
        historyData: generateHistory(5.33, 0.005),
    },
    {
        code: "DGS10",
        name: "10年期公債殖利率",
        fullName: "10-Year Treasury Constant Maturity Rate",
        country: "US",
        category: "金融與利率",
        description: "衡量長期借貸成本的核心指標，也是市場風險定價的基準。",
        unit: "%",
        color: "#06B6D4", // Cyan
        latestValue: 4.12,
        changePercent: 1.2,
        frequency: "日度",
        source: "FRED",
        historyData: generateHistory(4.12, 0.02),
    },
    {
        code: "CPI",
        name: "消費者物價指數",
        fullName: "Consumer Price Index",
        country: "US",
        category: "通貨膨脹",
        description: "追蹤消費者購買一籃子商品和服務的價格變化，是衡量通膨的主要指標。",
        unit: "指數",
        color: "#EC4899", // Pink
        latestValue: 314.54,
        changePercent: 3.2,
        frequency: "月度",
        source: "FRED",
        historyData: generateHistory(314.54, 0.005),
    },
    {
        code: "UNRATE",
        name: "失業率",
        fullName: "Unemployment Rate",
        country: "US",
        category: "勞動市場",
        description: "勞動力中正在尋找工作但未找到工作的人的百分比。",
        unit: "%",
        color: "#8B5CF6", // Violet
        latestValue: 3.7,
        changePercent: -0.1,
        frequency: "月度",
        source: "FRED",
        historyData: generateHistory(3.7, 0.03),
    },
    {
        code: "GDP_US",
        name: "美國實質 GDP (QoQ)",
        fullName: "Real Gross Domestic Product (QoQ)",
        country: "US",
        category: "經濟成長",
        description: "衡量美國境內生產的所有商品和服務的總市場價值。",
        unit: "%",
        color: "#3B82F6", // Blue
        latestValue: 3.1,
        changePercent: 0.5,
        frequency: "季度",
        source: "FRED",
        historyData: generateHistory(3.1, 0.05),
    },

    // --- 台灣 (TW) ---
    {
        code: "TW_SIGNAL",
        name: "景氣對策信號",
        fullName: "Taiwan Monitoring Indicator",
        country: "TW",
        category: "經濟成長",
        description: "國發會發布之衡量台灣經濟熱度的景氣燈號分數。",
        unit: "分",
        color: "#F59E0B", // Amber
        latestValue: 27,
        changePercent: 3.8,
        frequency: "月度",
        source: "國發會",
        historyData: generateHistory(27, 0.08),
    },
    {
        code: "TW_GDP",
        name: "台灣 GDP 年增率",
        fullName: "Taiwan GDP Growth Rate (YoY)",
        country: "TW",
        category: "經濟成長",
        description: "衡量台灣國內生產總值相對於去年同期的增長速度。",
        unit: "%",
        color: "#10B981",
        latestValue: 3.98,
        changePercent: 0.15,
        frequency: "季度",
        source: "主計總處",
        historyData: generateHistory(3.98, 0.04),
    },
    {
        code: "USD_TWD",
        name: "美元/台幣匯率",
        fullName: "USD/TWD Exchange Rate",
        country: "TW",
        category: "金融與利率",
        description: "一美元可兌換之新台幣金額。",
        unit: "TWD",
        color: "#06B6D4",
        latestValue: 31.25,
        changePercent: -0.2,
        frequency: "日度",
        source: "央行",
        historyData: generateHistory(31.25, 0.015),
    },

    // --- 全球 (Global) ---
    {
        code: "WTI_OIL",
        name: "WTI 原油價格",
        fullName: "Crude Oil Prices: West Texas Intermediate (WTI)",
        country: "Global",
        category: "大宗商品",
        description: "西德州中級原油每桶價格，反映全球能源需求與通膨壓力。",
        unit: "USD/桶",
        color: "#EF4444", // Red
        latestValue: 76.45,
        changePercent: -1.5,
        frequency: "日度",
        source: "NYMEX",
        historyData: generateHistory(76.45, 0.05),
    },
    {
        code: "XAU_USD",
        name: "黃金現貨價格",
        fullName: "Gold Spot Price",
        country: "Global",
        category: "大宗商品",
        description: "全球避險情緒的重要指標。",
        unit: "USD/盎司",
        color: "#EAB308", // Yellow
        latestValue: 2024.15,
        changePercent: 0.4,
        frequency: "日度",
        source: "LBMA",
        historyData: generateHistory(2024.15, 0.01),
    },
    {
        code: "VIX",
        name: "恐慌指數 (VIX)",
        fullName: "CBOE Volatility Index",
        country: "Global",
        category: "市場情緒",
        description: "反映市場對未來 30 天 S&P 500 指數波動率的預期。",
        unit: "點",
        color: "#F59E0B",
        latestValue: 14.85,
        changePercent: 2.3,
        frequency: "即時",
        source: "CBOE",
        historyData: generateHistory(14.85, 0.1),
    },
    {
        code: "DXY",
        name: "美元指數",
        fullName: "US Dollar Index",
        country: "Global",
        category: "金融與利率",
        description: "衡量美元對於一籃子主要外幣的匯率變化。",
        unit: "點",
        color: "#6366F1", // Indigo
        latestValue: 104.22,
        changePercent: 0.1,
        frequency: "日度",
        source: "ICE",
        historyData: generateHistory(104.22, 0.01),
    }
];

// 根據代碼查找指標
export const findIndicatorByCode = (code: string): MacroIndicator | undefined => {
    if (!code) return undefined;
    return MACRO_INDICATORS.find(
        (i) => i.code.toLowerCase() === code.toLowerCase()
    );
};
