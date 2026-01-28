import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface IndicatorData {
    symbol: string;
    indicator_name: string;
    value: number;
    unit: string;
    date: string;
    period: string;
    yoy_change: number | null;
    mom_change: number | null;
}

export async function GET(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const symbols = searchParams.get('symbols')?.split(',') || ['2330', 'AAPL'];
        const indicators = searchParams.get('indicators')?.split(',') || ['revenue', 'net_income', 'eps'];
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const normalize = searchParams.get('normalize') === 'true';

        let query = supabase
            .from('stock_financials')
            .select('*')
            .in('symbol', symbols);

        if (startDate) {
            query = query.gte('report_date', startDate);
        }

        if (endDate) {
            query = query.lte('report_date', endDate);
        }

        const { data: financials, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: stocks } = await supabase
            .from('stocks')
            .select('symbol, name')
            .in('symbol', symbols);

        const stockNames: Record<string, string> = {};
        (stocks || []).forEach(s => {
            stockNames[s.symbol] = s.name;
        });

        const indicatorMapping: Record<string, string> = {
            'revenue': 'revenue',
            '營收': 'revenue',
            'net_income': 'net_income',
            '淨利': 'net_income',
            'eps': 'eps',
            '每股盈餘': 'eps',
            'roe': 'roe',
            ' ROE': 'roe',
            'gross_margin': 'gross_margin',
            '毛利率': 'gross_margin',
            'operating_margin': 'operating_margin',
            '營業利益率': 'operating_margin',
        };

        const results: Record<string, IndicatorData[]> = {};

        symbols.forEach(symbol => {
            results[symbol] = [];
            
            const symbolData = financials?.filter(f => f.symbol === symbol) || [];
            
            indicators.forEach(indicator => {
                const dbColumn = indicatorMapping[indicator] || indicator;
                
                const indicatorData = symbolData.map(item => ({
                    symbol,
                    indicator_name: indicator,
                    value: item[dbColumn] || 0,
                    unit: item.unit || '',
                    date: item.report_date,
                    period: item.period || 'Q',
                    yoy_change: item.yoy_change || null,
                    mom_change: item.mom_change || null,
                })).filter(d => d.value !== null && d.value !== undefined);

                if (indicatorData.length > 0) {
                    results[symbol].push(...indicatorData);
                }
            });
        });

        const comparisonData = symbols.map(symbol => {
            const latestData = results[symbol]?.[0];
            const latestFinancial = financials?.find(f => f.symbol === symbol);

            let normalizedValue = null;
            if (latestFinancial && normalize) {
                const baseValue = latestFinancial.revenue || latestFinancial.net_income || latestFinancial.eps;
                if (baseValue) {
                    normalizedValue = 100;
                }
            }

            return {
                symbol,
                name: stockNames[symbol] || symbol,
                latest_date: latestFinancial?.report_date || null,
                indicators: latestData ? {
                    [latestData.indicator_name]: {
                        value: latestData.value,
                        unit: latestData.unit,
                        yoy: latestData.yoy_change,
                        mom: latestData.mom_change,
                    }
                } : null,
                normalized_score: normalizedValue,
            };
        });

        return NextResponse.json({
            symbols,
            indicators,
            count: Object.keys(results).length,
            comparison: comparisonData,
            details: results,
        });
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
