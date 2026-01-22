/**
 * 融資融券模擬數據
 * 30 日歷史數據，包含融資餘額、融券餘額、券資比
 */

// 生成模擬融資融券數據 (30 天)
const generateMarginData = () => {
    const data = [];
    const today = new Date();
    let marginBalance = 180000; // 融資餘額 (百萬)
    let shortBalance = 12000;   // 融券餘額 (張)
    let price = 580;

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // 模擬波動
        marginBalance = Math.round(marginBalance * (1 + (Math.random() - 0.48) * 0.02));
        shortBalance = Math.round(shortBalance * (1 + (Math.random() - 0.52) * 0.03));
        price = Math.round(price * (1 + (Math.random() - 0.48) * 0.015) * 10) / 10;

        // 計算券資比 (Short Ratio)
        const shortRatio = (shortBalance / (marginBalance / 10)).toFixed(2);

        data.push({
            date: date.toISOString().split("T")[0],
            marginBalance,  // 融資餘額 (百萬)
            shortBalance,   // 融券餘額 (張)
            shortRatio: parseFloat(shortRatio), // 券資比 (%)
            marginChange: Math.round((Math.random() - 0.5) * 3000), // 融資增減 (百萬)
            shortChange: Math.round((Math.random() - 0.5) * 800),   // 融券增減 (張)
            price,
        });
    }

    return data;
};

export const MOCK_MARGIN_DATA = generateMarginData();

// 生成模擬三大法人數據 (30 天)
const generateInstitutionalData = () => {
    const data = [];
    const today = new Date();
    let price = 580;

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // 模擬法人買賣超 (億元)
        const foreign = Math.round((Math.random() - 0.45) * 100);   // 外資
        const trust = Math.round((Math.random() - 0.5) * 30);        // 投信
        const dealer = Math.round((Math.random() - 0.5) * 20);       // 自營商
        const total = foreign + trust + dealer;

        // 價格波動
        price = Math.round(price * (1 + (Math.random() - 0.48) * 0.012) * 10) / 10;

        data.push({
            date: date.toISOString().split("T")[0],
            foreign,
            trust,
            dealer,
            total,
            price,
        });
    }

    return data;
};

export const MOCK_INSTITUTIONAL_DATA = generateInstitutionalData();

// 法人持股比例 (靜態)
export const MOCK_OWNERSHIP_DATA = [
    { name: "外資", value: 45.2, color: "#06B6D4" },  // Cyan
    { name: "投信", value: 8.5, color: "#EC4899" },   // Pink
    { name: "自營商", value: 3.8, color: "#F59E0B" }, // Amber
    { name: "一般股東", value: 42.5, color: "#6B7280" }, // Gray
];
