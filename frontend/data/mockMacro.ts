/**
 * 宏觀指標模擬數據
 * Phase 4.5 專業版：支援區域分區與類別分組
 */

// 生成模擬走勢數據
const generateSparkline = (baseValue: number, volatility: number = 0.02) => {
    const data = [];
    let value = baseValue * (1 - volatility * 3);
    for (let i = 12; i > 0; i--) {
        value = value * (1 + (Math.random() - 0.45) * volatility);
        data.push({ value: Math.round(value * 100) / 100 });
    }
    return data;
};

// 指標配置
export const MACRO_INDICATORS = [
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
        sparklineData: generateSparkline(5.33, 0.01),
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
        sparklineData: generateSparkline(4.12, 0.02),
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
        sparklineData: generateSparkline(314.54, 0.005),
    },
    {
        code: "UNRATE",
        name: "失業率",
        country: "US",
        category: "勞動市場",
        description: "勞動力中正在尋找工作但未找到工作的人的百分比。",
        unit: "%",
        color: "#8B5CF6", // Violet
        latestValue: 3.7,
        changePercent: -0.1,
        frequency: "月度",
        source: "FRED",
        sparklineData: generateSparkline(3.7, 0.03),
    },
    {
        code: "GDP_US",
        name: "美國實質 GDP (QoQ)",
        country: "US",
        category: "經濟成長",
        description: "衡量美國境內生產的所有商品和服務的總市場價值。",
        unit: "%",
        color: "#3B82F6", // Blue
        latestValue: 3.1,
        changePercent: 0.5,
        frequency: "季度",
        source: "FRED",
        sparklineData: generateSparkline(3.1, 0.05),
    },

    // --- 台灣 (TW) ---
    {
        code: "TW_SIGNAL",
        name: "景氣對策信號",
        country: "TW",
        category: "經濟成長",
        description: "國發會發布之衡量台灣經濟熱度的景氣燈號分數。",
        unit: "分",
        color: "#F59E0B", // Amber
        latestValue: 27,
        changePercent: 3.8,
        frequency: "月度",
        source: "國發會",
        sparklineData: generateSparkline(27, 0.08),
    },
    {
        code: "TW_GDP",
        name: "台灣 GDP 年增率",
        country: "TW",
        category: "經濟成長",
        description: "衡量台灣國內生產總值相對於去年同期的增長速度。",
        unit: "%",
        color: "#10B981",
        latestValue: 3.98,
        changePercent: 0.15,
        frequency: "季度",
        source: "主計總處",
        sparklineData: generateSparkline(3.98, 0.04),
    },
    {
        code: "USD_TWD",
        name: "美元/台幣匯率",
        country: "TW",
        category: "金融與利率",
        description: "一美元可兌換之新台幣金額。",
        unit: "TWD",
        color: "#06B6D4",
        latestValue: 31.25,
        changePercent: -0.2,
        frequency: "日度",
        source: "央行",
        sparklineData: generateSparkline(31.25, 0.015),
    },

    // --- 全球 (Global) ---
    {
        code: "WTI_OIL",
        name: "WTI 原油價格",
        country: "Global",
        category: "大宗商品",
        description: "西德州中級原油每桶價格，反映全球能源需求與通膨壓力。",
        unit: "USD/桶",
        color: "#EF4444", // Red
        latestValue: 76.45,
        changePercent: -1.5,
        frequency: "日度",
        source: "NYMEX",
        sparklineData: generateSparkline(76.45, 0.05),
    },
    {
        code: "XAU_USD",
        name: "黃金現貨價格",
        country: "Global",
        category: "大宗商品",
        description: "全球避險情緒的重要指標。",
        unit: "USD/盎司",
        color: "#EAB308", // Yellow
        latestValue: 2024.15,
        changePercent: 0.4,
        frequency: "日度",
        source: "LBMA",
        sparklineData: generateSparkline(2024.15, 0.01),
    },
    {
        code: "VIX",
        name: "恐慌指數 (VIX)",
        country: "Global",
        category: "市場情緒",
        description: "反映市場對未來 30 天 S&P 500 指數波動率的預期。",
        unit: "點",
        color: "#F59E0B",
        latestValue: 14.85,
        changePercent: 2.3,
        frequency: "即時",
        source: "CBOE",
        sparklineData: generateSparkline(14.85, 0.1),
    },
    {
        code: "DXY",
        name: "美元指數",
        country: "Global",
        category: "金融與利率",
        description: "衡量美元對於一籃子主要外幣的匯率變化。",
        unit: "點",
        color: "#6366F1", // Indigo
        latestValue: 104.22,
        changePercent: 0.1,
        frequency: "日度",
        source: "ICE",
        sparklineData: generateSparkline(104.22, 0.01),
    }
];

// 根據代碼查找指標
export const findIndicatorByCode = (code: string) => {
    return MACRO_INDICATORS.find(
        (i) => i.code.toLowerCase() === code.toLowerCase()
    );
};
