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
        const indicators = searchParams.get('indicators') || 'ma5,ma20,rsi,macd';
        const limit = parseInt(searchParams.get('limit') || '120');

        if (!symbol) {
            return NextResponse.json({
                status: 'error',
                error: {
                    code: '40001',
                    message: '股票代碼不可為空'
                }
            }, { status: 400 });
        }

        if (!supabase) {
            return NextResponse.json({
                status: 'error',
                error: {
                    code: '50002',
                    message: 'Supabase 未配置'
                }
            }, { status: 500 });
        }

        let dateFilter = '';
        const queryParams: any = { symbol, limit };

        if (startDate) {
            dateFilter += ' AND trade_date >= :startDate';
            queryParams.startDate = startDate;
        }
        if (endDate) {
            dateFilter += ' AND trade_date <= :endDate';
            queryParams.endDate = endDate;
        }

        const { data, error } = await supabase
            .from('v_stock_technical_indicators')
            .select('*')
            .eq('stock_code', symbol)
            .order('trade_date', { ascending: false })
            .limit(limit);

        if (error || !data || data.length === 0) {
            return NextResponse.json({
                status: 'error',
                error: {
                    code: '40401',
                    message: '找不到技術指標數據'
                }
            }, { status: 404 });
        }

        const technicalIndicators = indicators.split(',');
        const reversedData = data.reverse();

        const result: any = {
            stock_code: symbol,
            period: {
                start_date: reversedData[0]?.trade_date,
                end_date: reversedData[reversedData.length - 1]?.trade_date
            },
            indicators: {},
            record_count: data.length
        };

        if (technicalIndicators.includes('ma5') || technicalIndicators.includes('ma10') ||
            technicalIndicators.includes('ma20') || technicalIndicators.includes('ma60') ||
            technicalIndicators.includes('ma120')) {
            result.indicators.ma = {
                name: '移動平均線',
                ma5: reversedData.map(d => ({ date: d.trade_date, value: d.ma5 })),
                ma10: reversedData.map(d => ({ date: d.trade_date, value: d.ma10 })),
                ma20: reversedData.map(d => ({ date: d.trade_date, value: d.ma20 })),
                ma60: reversedData.map(d => ({ date: d.trade_date, value: d.ma60 })),
                ma120: reversedData.map(d => ({ date: d.trade_date, value: d.ma120 }))
            };
        }

        if (technicalIndicators.includes('rsi')) {
            result.indicators.rsi = {
                name: '相對強弱指數 (14)',
                values: reversedData.map(d => ({ date: d.trade_date, value: d.rsi_14 }))
            };
        }

        if (technicalIndicators.includes('macd')) {
            result.indicators.macd = {
                name: '平滑異同移動平均線 (12, 26, 9)',
                values: reversedData.map(d => ({
                    date: d.trade_date,
                    macd: d.macd_line,
                    signal: d.signal_line,
                    histogram: d.macd_histogram
                }))
            };
        }

        if (technicalIndicators.includes('bollinger')) {
            result.indicators.bollinger = {
                name: '布林通道 (20, 2)',
                values: reversedData.map(d => ({
                    date: d.trade_date,
                    upper: d.bb_upper,
                    middle: d.bb_middle,
                    lower: d.bb_lower
                }))
            };
        }

        return NextResponse.json({
            status: 'success',
            data: result,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] stocks/technical:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}
