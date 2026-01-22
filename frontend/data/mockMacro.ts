/**
 * 宏觀指標模擬數據
 * Phase 4.3 使用，整合六大經濟指標
 * 未來將替換為 Supabase 真實數據
 */

// 生成模擬走勢數據
const generateSparkline = (baseValue: number, volatility: number = 0.02) => {
    const data = [];
    let value = baseValue * (1 - volatility * 3);
    for (let i = 0; i < 12; i++) {
        value = value * (1 + (Math.random() - 0.45) * volatility);
        data.push({ value: Math.round(value * 100) / 100 });
    }
    return data;
};

// 生成歷史數據 (30 日)
const generateHistory = (
    baseValue: number,
    volatility: number = 0.015,
    unit: string = ""
) => {
    const data = [];
    let value = baseValue * 0.95;
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        value = value * (1 + (Math.random() - 0.48) * volatility);

        data.push({
            date: date.toISOString().split("T")[0],
            value: Math.round(value * 100) / 100,
        });
    }

    return data;
};

// 指標配置
export const MACRO_INDICATORS = [
    {
        code: "GDP",
        name: "國內生產總值",
        fullName: "Gross Domestic Product",
        description:
            "衡量一個國家在特定時期內生產的所有商品和服務的總市場價值，是衡量經濟健康狀況的重要指標。",
        unit: "兆美元",
        color: "#06B6D4", // Cyan
        latestValue: 27.36,
        changePercent: 2.8,
        frequency: "季度",
        source: "FRED",
        sparklineData: generateSparkline(27.36, 0.01),
        historyData: generateHistory(27.36, 0.008),
    },
    {
        code: "CPI",
        name: "消費者物價指數",
        fullName: "Consumer Price Index",
        description:
            "追蹤消費者購買一籃子商品和服務的價格變化，是衡量通貨膨脹的主要指標。",
        unit: "指數",
        color: "#EC4899", // Pink
        latestValue: 314.54,
        changePercent: 3.2,
        frequency: "月度",
        source: "FRED",
        sparklineData: generateSparkline(314.54, 0.005),
        historyData: generateHistory(314.54, 0.003),
    },
    {
        code: "VIX",
        name: "恐慌指數",
        fullName: "CBOE Volatility Index",
        description:
            "反映市場對未來 30 天 S&P 500 指數波動率的預期，常被稱為「恐慌指數」。",
        unit: "點",
        color: "#F59E0B", // Amber
        latestValue: 18.42,
        changePercent: -5.3,
        frequency: "即時",
        source: "CBOE",
        sparklineData: generateSparkline(18.42, 0.08),
        historyData: generateHistory(18.42, 0.05),
    },
    {
        code: "UNRATE",
        name: "失業率",
        fullName: "Unemployment Rate",
        description:
            "勞動力中正在尋找工作但未找到工作的人的百分比，是衡量勞動市場健康狀況的關鍵指標。",
        unit: "%",
        color: "#8B5CF6", // Violet
        latestValue: 3.7,
        changePercent: -0.1,
        frequency: "月度",
        source: "FRED",
        sparklineData: generateSparkline(3.7, 0.03),
        historyData: generateHistory(3.7, 0.02),
    },
    {
        code: "FEDFUNDS",
        name: "聯邦基金利率",
        fullName: "Federal Funds Rate",
        description:
            "美國銀行之間隔夜貸款的利率，是美聯儲控制貨幣政策的主要工具。",
        unit: "%",
        color: "#10B981", // Emerald
        latestValue: 5.33,
        changePercent: 0.0,
        frequency: "FOMC 會議",
        source: "FRED",
        sparklineData: generateSparkline(5.33, 0.01),
        historyData: generateHistory(5.33, 0.005),
    },
    {
        code: "M2",
        name: "M2 貨幣供應量",
        fullName: "M2 Money Supply",
        description:
            "包括現金、支票存款和易轉換為現金的近現金資產，衡量經濟中流通的貨幣總量。",
        unit: "兆美元",
        color: "#EF4444", // Red
        latestValue: 20.87,
        changePercent: 1.2,
        frequency: "月度",
        source: "FRED",
        sparklineData: generateSparkline(20.87, 0.008),
        historyData: generateHistory(20.87, 0.006),
    },
];

// 根據代碼查找指標
export const findIndicatorByCode = (code: string) => {
    return MACRO_INDICATORS.find(
        (i) => i.code.toLowerCase() === code.toLowerCase()
    );
};
