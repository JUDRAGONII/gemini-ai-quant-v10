import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface MarginDataPoint {
    date: string;
    margin_balance: number;
    margin_buy: number;
    margin_sell: number;
    margin_net: number;
    short_balance: number;
    short_buy: number;
    short_sell: number;
    short_net: number;
    margin_utilization: number;
    short_utilization: number;
    price: number;
}

export interface MarginResponse {
    symbol: string;
    data: MarginDataPoint[];
    statistics?: {
        avg_margin_balance: number;
        avg_margin_utilization: number;
        margin_change_5d: number;
        short_change_5d: number;
    };
    error?: string;
}

/**
 * [GET] /api/stocks/[symbol]/margin
 * 獲取個股融資融券數據
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    const symbol = params.symbol;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    try {
        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        const [priceRes, marginRes] = await Promise.all([
            supabase
                .from('daily_price')
                .select('trade_date, close_price')
                .eq('stock_code', symbol)
                .order('trade_date', { ascending: false })
                .limit(days),
            supabase
                .from('margin_short')
                .select('trade_date, margin_balance, margin_buy, margin_sell, short_balance, short_buy, short_sell, margin_utilization, short_utilization')
                .eq('stock_code', symbol)
                .order('trade_date', { ascending: false })
                .limit(days)
        ]);

        if (priceRes.error) {
            console.error('Price fetch error:', priceRes.error);
            throw priceRes.error;
        }

        const prices = priceRes.data || [];
        const marginMap = new Map();

        (marginRes.data || []).forEach((m: any) => {
            marginMap.set(m.trade_date, m);
        });

        const resultData: MarginDataPoint[] = prices.map((p: any) => {
            const date = p.trade_date;
            const marginData = marginMap.get(date) || {};

            return {
                date: date,
                margin_balance: Number(marginData.margin_balance) || 0,
                margin_buy: Number(marginData.margin_buy) || 0,
                margin_sell: Number(marginData.margin_sell) || 0,
                margin_net: Number(marginData.margin_buy || 0) - Number(marginData.margin_sell || 0),
                short_balance: Number(marginData.short_balance) || 0,
                short_buy: Number(marginData.short_buy) || 0,
                short_sell: Number(marginData.short_sell) || 0,
                short_net: Number(marginData.short_buy || 0) - Number(marginData.short_sell || 0),
                margin_utilization: Number(marginData.margin_utilization) || 0,
                short_utilization: Number(marginData.short_utilization) || 0,
                price: Number(p.close_price) || 0,
            };
        }).sort((a, b) => a.date.localeCompare(b.date));

        const statistics = calculateStatistics(resultData);

        return NextResponse.json({
            symbol,
            data: resultData,
            statistics
        });

    } catch (error) {
        console.error('Margin API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function calculateStatistics(data: MarginDataPoint[]) {
    if (data.length === 0) return null;

    const totalMargin = data.reduce((sum, d) => sum + d.margin_balance, 0);
    const totalUtil = data.reduce((sum, d) => sum + d.margin_utilization, 0);

    const margin5d = data.slice(-5);
    const margin5dChange = margin5d.length >= 2
        ? ((margin5d[margin5d.length - 1].margin_balance - margin5d[0].margin_balance) / margin5d[0].margin_balance) * 100
        : 0;

    const short5d = data.slice(-5);
    const short5dChange = short5d.length >= 2
        ? ((short5d[short5d.length - 1].short_balance - short5d[0].short_balance) / short5d[0].short_balance) * 100
        : 0;

    return {
        avg_margin_balance: Math.round(totalMargin / data.length),
        avg_margin_utilization: Number((totalUtil / data.length).toFixed(2)),
        margin_change_5d: Number(margin5dChange.toFixed(2)),
        short_change_5d: Number(short5dChange.toFixed(2)),
    };
}
