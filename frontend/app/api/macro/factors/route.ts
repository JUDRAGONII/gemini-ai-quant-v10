import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        const macroFactors = [
            {
                factor_code: 'YIELD_CURVE_SLOPE',
                factor_name: '殖利率曲線斜率',
                factor_category: 'interest',
                value: 0.35 + Math.random() * 0.1,
                unit: 'percent',
                calculation_date: endDate || '2026-01-28'
            },
            {
                factor_code: 'INFLATION_EXPECTATION',
                factor_name: '通膨預期',
                factor_category: 'inflation',
                value: 2.8 + Math.random() * 0.5,
                unit: 'percent',
                calculation_date: endDate || '2026-01-28'
            },
            {
                factor_code: 'CREDIT_SPREAD',
                factor_name: '信用利差',
                factor_category: 'interest',
                value: 1.2 + Math.random() * 0.3,
                unit: 'percent',
                calculation_date: endDate || '2026-01-28'
            },
            {
                factor_code: 'PMI_MOMENTUM',
                factor_name: 'PMI 動能',
                factor_category: 'growth',
                value: 52 + Math.random() * 5,
                unit: 'index',
                calculation_date: endDate || '2026-01-28'
            },
            {
                factor_code: 'VIX_LEVEL',
                factor_name: '波動率指數',
                factor_category: 'market',
                value: 12 + Math.random() * 5,
                unit: 'index',
                calculation_date: endDate || '2026-01-28'
            },
            {
                factor_code: 'USD_STRENGTH',
                factor_name: '美元指數',
                factor_category: 'currency',
                value: 103 + Math.random() * 3,
                unit: 'index',
                calculation_date: endDate || '2026-01-28'
            }
        ];

        return NextResponse.json({
            status: 'success',
            data: {
                factors: macroFactors,
                calculation_date: endDate || '2026-01-28'
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] macro/factors:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}
