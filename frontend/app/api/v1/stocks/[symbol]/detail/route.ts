import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { StockDetailResponse } from '@/types/api';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    const symbol = params.symbol;
    const { searchParams } = new URL(request.url);
    const include_technical = searchParams.get('include_technical') !== 'false';
    const technical_limit = parseInt(searchParams.get('technical_limit') || '120');

    if (!symbol) {
        return NextResponse.json({
            status: 'error',
            error: { code: '40001', message: '股票代碼不可為空' }
        }, { status: 400 });
    }

    if (!supabase) {
        return NextResponse.json({
            status: 'error',
            error: { code: '50002', message: 'Supabase 未配置' }
        }, { status: 500 });
    }

    try {
        const result: Partial<StockDetailResponse> = {};

        const { data: stockData, error: stockError } = await supabase
            .from('stocks')
            .select('stock_code, stock_name, market_type, industry, sector, list_date, currency, is_active')
            .eq('stock_code', symbol)
            .single();

        if (stockError || !stockData) {
            return NextResponse.json({
                status: 'error',
                error: { code: '40401', message: '股票不存在' }
            }, { status: 404 });
        }

        const sd = stockData as any;
        result.stock = {
            stock_code: sd.stock_code,
            stock_name: sd.stock_name,
            market_type: sd.market_type,
            industry: sd.industry,
            sector: sd.sector,
            list_date: sd.list_date,
            currency: sd.currency,
            is_active: sd.is_active
        };

        const { data: priceData, error: priceError } = await supabase
            .from('daily_price')
            .select('trade_date, open_price, high_price, low_price, close_price, volume, change_percent, adjusted_close, market_type')
            .eq('stock_code', symbol)
            .order('trade_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!priceError && priceData) {
            const d = priceData as any;
            result.quote = {
                stock_code: symbol,
                trade_date: d.trade_date,
                open: d.open_price,
                high: d.high_price,
                low: d.low_price,
                close: d.close_price,
                volume: d.volume,
                change_percent: d.change_percent,
                adjusted_close: d.adjusted_close,
                market_type: d.market_type
            };
        }

        const { data: financialData, error: financialError } = await supabase
            .from('stock_financials')
            .select('*')
            .eq('stock_code', symbol)
            .order('report_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!financialError && financialData) {
            const d = financialData as any;
            result.financials = {
                stock_code: symbol,
                report_type: d.report_type,
                report_date: d.report_date,
                fiscal_year: d.fiscal_year,
                revenue: d.revenue,
                net_income: d.net_income,
                eps: d.eps,
                pe_ratio: d.pe_ratio,
                pb_ratio: d.pb_ratio,
                roe: d.roe,
                gross_margin: d.gross_margin,
                net_margin: d.net_margin
            };
        }

        const { data: factorData, error: factorError } = await supabase
            .from('stock_factors')
            .select('stock_code, trade_date, pe_ratio, pb_ratio, revenue_growth, eps_growth, momentum_1m, roe, gross_margin, dividend_yield, composite_score, value_score, growth_score, quality_score, momentum_score')
            .eq('stock_code', symbol)
            .order('trade_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!factorError && factorData) {
            const d = factorData as any;
            result.ai_score = {
                stock_code: d.stock_code,
                composite_score: d.composite_score,
                scores: {
                    value: d.value_score ?? 50,
                    growth: d.growth_score ?? 50,
                    quality: d.quality_score ?? 50,
                    momentum: d.momentum_score ?? 50,
                    macro: 65.0
                },
                last_updated: d.trade_date
            };
        }

        if (include_technical) {
            const { data: technicalData, error: technicalError } = await supabase
                .from('v_stock_technical_indicators')
                .select('*')
                .eq('stock_code', symbol)
                .order('trade_date', { ascending: false })
                .limit(technical_limit);

            if (!technicalError && technicalData && technicalData.length > 0) {
                const reversedData = [...technicalData].reverse() as any[];
                result.technical_indicators = {
                    period: {
                        start_date: reversedData[0]?.trade_date,
                        end_date: reversedData[reversedData.length - 1]?.trade_date
                    },
                    ma: {
                        ma5: reversedData.map((d: any) => ({ date: d.trade_date, value: d.ma5 })),
                        ma10: reversedData.map((d: any) => ({ date: d.trade_date, value: d.ma10 })),
                        ma20: reversedData.map((d: any) => ({ date: d.trade_date, value: d.ma20 })),
                        ma60: reversedData.map((d: any) => ({ date: d.trade_date, value: d.ma60 })),
                        ma120: reversedData.map((d: any) => ({ date: d.trade_date, value: d.ma120 }))
                    },
                    rsi: {
                        values: reversedData.map((d: any) => ({ date: d.trade_date, value: d.rsi_14 }))
                    },
                    macd: {
                        values: reversedData.map((d: any) => ({
                            date: d.trade_date,
                            macd: d.macd_line,
                            signal: d.signal_line,
                            histogram: d.macd_histogram
                        }))
                    },
                    bollinger: {
                        values: reversedData.map((d: any) => ({
                            date: d.trade_date,
                            upper: d.bb_upper,
                            middle: d.bb_middle,
                            lower: d.bb_lower
                        }))
                    },
                    record_count: technicalData.length
                };
            }
        }

        return NextResponse.json({
            status: 'success',
            data: result as StockDetailResponse,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] v1/stocks/detail:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}
