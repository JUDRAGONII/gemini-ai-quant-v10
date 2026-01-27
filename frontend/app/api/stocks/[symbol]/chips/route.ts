import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * [GET] /api/stocks/[symbol]/chips
 * 獲取個股籌碼分析數據：三大法人買賣超 + 收盤價
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    const symbol = params.symbol;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('days') || '90'); // 預設 90 天

    try {
        // 1. 防止 SQL Injection (雖然 Supabase client 有處理，但基本驗證是好的)
        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        // 2. 平行請求：收盤價 (Price) 與 法人數據 (Chips)
        // 注意：這裡我們分開抓取再 Memory Join，因為 Supabase Join 語法有時較複雜，且兩表都可能有缺漏
        // 若資料量大建議改用 Database View 或 Join Query，但 90 筆 records 在應可接受

        const [priceRes, chipsRes] = await Promise.all([
            supabase
                .from('daily_price')
                .select('trade_date, close_price')
                .eq('stock_code', symbol)
                .order('trade_date', { ascending: false })
                .limit(limit),
            supabase
                .from('institutional_investors')
                .select('trade_date, foreign_inv_net_buy_sell, investment_trust_net_buy_sell, dealer_net_buy_sell')
                .eq('stock_code', symbol)
                .order('trade_date', { ascending: false })
                .limit(limit)
        ]);

        if (priceRes.error) {
            console.error('Price fetch error:', priceRes.error);
            throw priceRes.error;
        }

        if (chipsRes.error) {
            console.error('Chips fetch error:', chipsRes.error);
            // Non-critical: 若無籌碼數據，可能該股無法人進出，仍可回傳價格
        }

        // 3. Data Merging Strategy
        // 以 Price 為基準 (因為一定要有交易日才有意義)，將 Chips 併入
        const prices = priceRes.data || [];
        const chipsMap = new Map();

        (chipsRes.data || []).forEach((c: any) => {
            chipsMap.set(c.trade_date, c);
        });

        // 4. Transform & Format
        const resultData = prices.map((p: any) => {
            const date = p.trade_date;
            const chipData = chipsMap.get(date) || {};

            // 單位轉換：股 -> 張 (若 DB 存的是股數)
            // 假設 DB 存的是股數 (Shares)，除以 1000 轉為張數 (Lots)
            const foreign = (Number(chipData.foreign_inv_net_buy_sell) || 0) / 1000;
            const trust = (Number(chipData.investment_trust_net_buy_sell) || 0) / 1000;
            const dealer = (Number(chipData.dealer_net_buy_sell) || 0) / 1000;

            return {
                date: date,
                // UNIX Timestamp for Charting
                time: Math.floor(new Date(date).getTime() / 1000),
                price: Number(p.close_price) || 0,

                // Chips Data (Lots)
                foreign_inv: foreign,
                investment_trust: trust,
                dealer: dealer,
                total: foreign + trust + dealer
            };
        }).sort((a, b) => a.time - b.time); // 確保時序由舊到新 (Chart 需要)

        return NextResponse.json({
            symbol: symbol,
            data: resultData
        });

    } catch (error) {
        console.error('Chips API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
