import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * [GET] /api/stocks/[symbol]
 * 獲取個股詳情：含基本面 (stocks)、行情 (daily_price) 與因子 (stock_factors)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    const symbol = params.symbol;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    try {
        // 1. 抓取標的基本資料
        const { data: stockInfo, error: infoError } = await supabase
            .from('stocks')
            .select('*')
            .eq('stock_code', symbol)
            .single();

        if (infoError || !stockInfo) {
            console.error(`[API] Stock fetch error for ${symbol}:`, infoError?.message || 'Stock not found');
            return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
        }

        // 2. 抓取歷史 K 線數據 (依據規格，time 需轉換為 UNIX timestamp)
        // 注意：資料庫欄位為 open_price, close_price, high_price, low_price
        const { data: priceSeries, error: priceError } = await supabase
            .from('daily_price')
            .select('trade_date, open_price, high_price, low_price, close_price, volume')
            .eq('stock_code', symbol)
            .order('trade_date', { ascending: false })
            .limit(limit);

        if (priceError) {
            console.error('Price fetch error:', priceError);
        }

        // 3. 抓取最新財務因子 (PE/PB/ROE)
        const { data: factors, error: factorError } = await supabase
            .from('stock_factors')
            .select('*')
            .eq('stock_code', symbol)
            .order('trade_date', { ascending: false })
            .limit(1)
            .single();

        // 4. 數據轉換處理：確保時間唯一性且排序
        const seenTimes = new Set<number>();
        const formattedSeries = (priceSeries || [])
            .map((p: Record<string, unknown>) => ({
                time: Math.floor(new Date(p.trade_date as string).getTime() / 1000),
                open: Number(p.open_price) || 0,
                high: Number(p.high_price) || Number(p.open_price) || 0,
                low: Number(p.low_price) || Number(p.open_price) || 0,
                close: Number(p.close_price) || 0,
                volume: Number(p.volume) || 0,
            }))
            .filter(p => {
                if (seenTimes.has(p.time)) return false;
                seenTimes.add(p.time);
                return true;
            })
            .sort((a, b) => a.time - b.time);

        return NextResponse.json({
            metadata: {
                stock_code: stockInfo.stock_code,
                stock_name: stockInfo.stock_name,
                market_type: stockInfo.market_type,
                is_active: stockInfo.is_active,
                // 為了前端兼容性暫時保留舊欄位名稱
                symbol: stockInfo.stock_code,
                name: stockInfo.stock_name,
                market: stockInfo.market_type,
            },
            summary_stats: {
                pe_ratio: factors?.pe_ratio || null,
                pb_ratio: factors?.pb_ratio || null,
                dividend_yield: factors?.dividend_yield || null,
                roe: factors?.roe || null,
                last_price: formattedSeries.length > 0 ? formattedSeries[formattedSeries.length - 1].close : null,
            },
            price_series: formattedSeries,
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
