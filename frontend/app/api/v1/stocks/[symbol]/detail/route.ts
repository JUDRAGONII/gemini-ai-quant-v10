import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
        const result: Record<string, unknown> = { stock_code: symbol };
        let stockInfo: Record<string, unknown> | null = null;

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

        stockInfo = stockData;
        result.stock = {
            stock_code: stockData.stock_code,
            stock_name: stockData.stock_name,
            market_type: stockData.market_type,
            industry: stockData.industry,
            sector: stockData.sector,
            list_date: stockData.list_date,
            currency: stockData.currency,
            is_active: stockData.is_active
        };

        const { data: priceData, error: priceError } = await supabase
            .from('daily_price')
            .select('trade_date, open_price, high_price, low_price, close_price, volume, change_percent, adjusted_close, market_type')
            .eq('stock_code', symbol)
            .order('trade_date', { ascending: false })
            .limit(1)
            .single();

        if (!priceError && priceData) {
            result.quote = {
                trade_date: priceData.trade_date,
                open: priceData.open_price,
                high: priceData.high_price,
                low: priceData.low_price,
                close: priceData.close_price,
                volume: priceData.volume,
                change_percent: priceData.change_percent,
                adjusted_close: priceData.adjusted_close,
                market_type: priceData.market_type
            };
        }

        const { data: financialData, error: financialError } = await supabase
            .from('stock_financials')
            .select('*')
            .eq('stock_code', symbol)
            .order('report_date', { ascending: false })
            .limit(1)
            .single();

        if (!financialError && financialData) {
            result.financials = {
                report_type: financialData.report_type,
                report_date: financialData.report_date,
                fiscal_year: financialData.fiscal_year,
                revenue: financialData.revenue,
                net_income: financialData.net_income,
                eps: financialData.eps,
                pe_ratio: financialData.pe_ratio,
                pb_ratio: financialData.pb_ratio,
                roe: financialData.roe,
                gross_margin: financialData.gross_margin,
                net_margin: financialData.net_margin
            };
        }

        const { data: factorData, error: factorError } = await supabase
            .from('stock_factors')
            .select('stock_code, trade_date, pe_ratio, pb_ratio, revenue_growth, eps_growth, momentum_1m, roe, gross_margin, dividend_yield, composite_score, value_score, growth_score, quality_score, momentum_score')
            .eq('stock_code', symbol)
            .order('trade_date', { ascending: false })
            .limit(1)
            .single();

        if (!factorError && factorData) {
            result.ai_score = {
                stock_code: factorData.stock_code,
                composite_score: factorData.composite_score,
                scores: {
                    value: factorData.value_score ?? Math.round((factorData.pe_ratio ? Math.min(100, Math.max(0, 100 - factorData.pe_ratio / 2)) : 50) * 10) / 10,
                    growth: factorData.growth_score ?? Math.round(((factorData.revenue_growth || 0) * 50 + 50) * 10) / 10,
                    quality: factorData.quality_score ?? Math.round((factorData.roe || 50) * 10) / 10,
                    momentum: factorData.momentum_score ?? Math.round((factorData.momentum_1m || 50) * 10) / 10,
                    macro: 65.0
                },
                last_updated: factorData.trade_date
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
                const reversedData = technicalData.reverse();
                result.technical_indicators = {
                    period: {
                        start_date: reversedData[0]?.trade_date,
                        end_date: reversedData[reversedData.length - 1]?.trade_date
                    },
                    ma: {
                        ma5: reversedData.map((d: Record<string, unknown>) => ({ date: d.trade_date, value: d.ma5 })),
                        ma10: reversedData.map((d: Record<string, unknown>) => ({ date: d.trade_date, value: d.ma10 })),
                        ma20: reversedData.map((d: Record<string, unknown>) => ({ date: d.trade_date, value: d.ma20 })),
                        ma60: reversedData.map((d: Record<string, unknown>) => ({ date: d.trade_date, value: d.ma60 })),
                        ma120: reversedData.map((d: Record<string, unknown>) => ({ date: d.trade_date, value: d.ma120 }))
                    },
                    rsi: {
                        values: reversedData.map((d: Record<string, unknown>) => ({ date: d.trade_date, value: d.rsi_14 }))
                    },
                    macd: {
                        values: reversedData.map((d: Record<string, unknown>) => ({
                            date: d.trade_date,
                            macd: d.macd_line,
                            signal: d.signal_line,
                            histogram: d.macd_histogram
                        }))
                    },
                    bollinger: {
                        values: reversedData.map((d: Record<string, unknown>) => ({
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
            data: result,
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
