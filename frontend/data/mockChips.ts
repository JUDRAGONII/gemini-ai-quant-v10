export interface ChipData {
    date: string;
    price: number;
    foreign_investors: number; // 外資
    investment_trust: number;  // 投信
    dealer: number;            // 自營商
    margin_balance: number;    // 融資餘額
}

export const MOCK_CHIPS_DATA: ChipData[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));

    // Random walk price
    const basePrice = 150;
    const price = basePrice + Math.sin(i * 0.5) * 10 + Math.random() * 5;

    // Correlated chips data
    const trend = Math.sin(i * 0.5);
    const foreign = Math.floor(trend * 1000 + (Math.random() - 0.5) * 500);
    const trust = Math.floor(trend * 300 + (Math.random() - 0.5) * 200);
    const dealer = Math.floor((Math.random() - 0.5) * 200);

    return {
        date: date.toISOString().split('T')[0],
        price: Number(price.toFixed(1)),
        foreign_investors: foreign,
        investment_trust: trust,
        dealer: dealer,
        margin_balance: 5000 + Math.floor(Math.random() * 1000)
    };
});
