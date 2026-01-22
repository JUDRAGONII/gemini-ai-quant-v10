/**
 * 股票模擬數據
 * Phase 4.2 使用，未來將替換為 Supabase 真實數據
 */

// 生成迷你走勢數據 (7天)
const generateSparkline = (basePrice: number, volatility: number = 0.02) => {
    const data = [];
    let price = basePrice * (1 - volatility * 3); // 從稍低的價格開始
    for (let i = 0; i < 7; i++) {
        price = price * (1 + (Math.random() - 0.45) * volatility);
        data.push({ value: price });
    }
    return data;
};

// 生成歷史價格數據 (30天)
const generatePriceHistory = (
    basePrice: number,
    volatility: number = 0.015
) => {
    const data = [];
    let price = basePrice * 0.95;
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const open = price;
        const change = (Math.random() - 0.48) * volatility;
        const close = price * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.floor(Math.random() * 50000) + 10000;

        data.push({
            date: date.toISOString().split("T")[0],
            open: Math.round(open * 100) / 100,
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            close: Math.round(close * 100) / 100,
            volume,
        });

        price = close;
    }

    return data;
};

// 台股模擬數據
export const mockTWStocks = [
    {
        symbol: "2330",
        name: "台積電",
        price: 598,
        changePercent: 1.52,
        market: "TW" as const,
        sparklineData: generateSparkline(598, 0.015),
        priceHistory: generatePriceHistory(598, 0.012),
        info: {
            industry: "半導體",
            marketCap: "15.5兆",
            pe: 18.5,
            eps: 32.3,
            dividend: 2.75,
        },
    },
    {
        symbol: "2317",
        name: "鴻海",
        price: 108.5,
        changePercent: -0.46,
        market: "TW" as const,
        sparklineData: generateSparkline(108.5, 0.02),
        priceHistory: generatePriceHistory(108.5, 0.018),
        info: {
            industry: "電子代工",
            marketCap: "1.5兆",
            pe: 10.2,
            eps: 10.6,
            dividend: 5.3,
        },
    },
    {
        symbol: "2454",
        name: "聯發科",
        price: 1125,
        changePercent: 2.18,
        market: "TW" as const,
        sparklineData: generateSparkline(1125, 0.025),
        priceHistory: generatePriceHistory(1125, 0.02),
        info: {
            industry: "IC設計",
            marketCap: "1.8兆",
            pe: 15.3,
            eps: 73.5,
            dividend: 4.2,
        },
    },
    {
        symbol: "2881",
        name: "富邦金",
        price: 72.3,
        changePercent: 0.84,
        market: "TW" as const,
        sparklineData: generateSparkline(72.3, 0.012),
        priceHistory: generatePriceHistory(72.3, 0.01),
        info: {
            industry: "金融",
            marketCap: "7,800億",
            pe: 9.8,
            eps: 7.4,
            dividend: 3.8,
        },
    },
    {
        symbol: "2412",
        name: "中華電",
        price: 126.5,
        changePercent: 0.0,
        market: "TW" as const,
        sparklineData: generateSparkline(126.5, 0.005),
        priceHistory: generatePriceHistory(126.5, 0.005),
        info: {
            industry: "電信",
            marketCap: "9,800億",
            pe: 22.1,
            eps: 5.7,
            dividend: 4.1,
        },
    },
    {
        symbol: "2308",
        name: "台達電",
        price: 385,
        changePercent: 1.05,
        market: "TW" as const,
        sparklineData: generateSparkline(385, 0.018),
        priceHistory: generatePriceHistory(385, 0.015),
        info: {
            industry: "電源供應器",
            marketCap: "9,900億",
            pe: 20.5,
            eps: 18.8,
            dividend: 3.5,
        },
    },
];

// 美股模擬數據
export const mockUSStocks = [
    {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 185.92,
        changePercent: 0.85,
        market: "US" as const,
        sparklineData: generateSparkline(185.92, 0.012),
        priceHistory: generatePriceHistory(185.92, 0.01),
        info: {
            industry: "Technology",
            marketCap: "$2.9T",
            pe: 28.5,
            eps: 6.52,
            dividend: 0.5,
        },
    },
    {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 875.35,
        changePercent: 3.24,
        market: "US" as const,
        sparklineData: generateSparkline(875.35, 0.035),
        priceHistory: generatePriceHistory(875.35, 0.03),
        info: {
            industry: "Semiconductors",
            marketCap: "$2.2T",
            pe: 65.2,
            eps: 13.42,
            dividend: 0.04,
        },
    },
    {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 415.28,
        changePercent: 1.12,
        market: "US" as const,
        sparklineData: generateSparkline(415.28, 0.015),
        priceHistory: generatePriceHistory(415.28, 0.012),
        info: {
            industry: "Technology",
            marketCap: "$3.1T",
            pe: 35.8,
            eps: 11.6,
            dividend: 0.8,
        },
    },
    {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 152.18,
        changePercent: -0.32,
        market: "US" as const,
        sparklineData: generateSparkline(152.18, 0.018),
        priceHistory: generatePriceHistory(152.18, 0.015),
        info: {
            industry: "Technology",
            marketCap: "$1.9T",
            pe: 24.5,
            eps: 6.21,
            dividend: 0,
        },
    },
];

// 合併所有股票
export const mockAllStocks = [...mockTWStocks, ...mockUSStocks];

// 根據代碼查找股票
export const findStockBySymbol = (symbol: string) => {
    return mockAllStocks.find(
        (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
    );
};
