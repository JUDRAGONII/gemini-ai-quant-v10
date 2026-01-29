import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    try {
        const symbol = params.symbol;
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        if (!symbol) {
            return NextResponse.json({
                status: 'error',
                error: {
                    code: '40001',
                    message: '股票代碼不可為空'
                }
            }, { status: 400 });
        }

        // 嘗試從 stocks 表獲取股票名稱
        const { data: stockInfo } = await supabase
            .from('stocks')
            .select('stock_name, stock_code')
            .eq('stock_code', symbol)
            .single();

        // 由於目前沒有 stock_institutional 表，使用模擬數據
        // 未來接入真實數據源後替換
        const mockData = generateMockInstitutionalData(symbol, startDate, endDate);

        return NextResponse.json({
            status: 'success',
            data: {
                stock_code: symbol,
                stock_name: stockInfo?.stock_name || symbol,
                period: {
                    start_date: startDate || '2026-01-15',
                    end_date: endDate || '2026-01-28'
                },
                institutions: mockData.institutions,
                summary: mockData.summary
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] stocks/institutional:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}

function generateMockInstitutionalData(symbol: string, startDate?: string | null, endDate?: string | null) {
    // 模擬三大法人數據
    // 未來應替換為真實數據查詢
    return {
        institutions: [
            {
                name: '外資',
                code: 'FOREIGN',
                buy: 1250000000 + Math.random() * 100000000,
                sell: 980000000 + Math.random() * 100000000,
                net_buy: 270000000 + Math.random() * 50000000,
                buy_volume: 280000 + Math.floor(Math.random() * 10000),
                sell_volume: 210000 + Math.floor(Math.random() * 10000),
                net_volume: 70000 + Math.floor(Math.random() * 5000)
            },
            {
                name: '投信',
                code: 'TRUST',
                buy: 350000000 + Math.random() * 50000000,
                sell: 420000000 + Math.random() * 50000000,
                net_buy: -70000000 + Math.random() * 20000000,
                buy_volume: 75000 + Math.floor(Math.random() * 5000),
                sell_volume: 90000 + Math.floor(Math.random() * 5000),
                net_volume: -15000 + Math.floor(Math.random() * 2000)
            },
            {
                name: '自營商',
                code: 'DEALER',
                buy: 180000000 + Math.random() * 30000000,
                sell: 220000000 + Math.random() * 30000000,
                net_buy: -40000000 + Math.random() * 10000000,
                buy_volume: 38000 + Math.floor(Math.random() * 2000),
                sell_volume: 46000 + Math.floor(Math.random() * 2000),
                net_volume: -8000 + Math.floor(Math.random() * 1000)
            }
        ],
        summary: {
            total_buy: 1780000000,
            total_sell: 1620000000,
            total_net_buy: 160000000
        }
    };
}
