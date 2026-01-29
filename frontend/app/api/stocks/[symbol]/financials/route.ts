/**
 * @file route.ts
 * @description 美股財務報表 API 端點
 * @endpoint GET /api/stocks/[symbol]/financials
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 財報數據類型
interface FinancialRecord {
    report_date: string;
    report_type: string;
    revenue: number | null;
    gross_profit: number | null;
    operating_income: number | null;
    net_income: number | null;
    eps: number | null;
    total_assets: number | null;
    total_liabilities: number | null;
    total_equity: number | null;
    operating_cash_flow: number | null;
    free_cash_flow: number | null;
    // 兼容舊版命名 (選配)
    fiscal_date?: string;
}

// 計算毛利率與淨利率
function calculateMargins(record: FinancialRecord) {
    const grossMargin = record.revenue && record.gross_profit
        ? (record.gross_profit / record.revenue * 100)
        : null;
    const netMargin = record.revenue && record.net_income
        ? (record.net_income / record.revenue * 100)
        : null;
    return { grossMargin, netMargin };
}

export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    const symbol = params.symbol?.toUpperCase();

    if (!symbol) {
        return NextResponse.json(
            { error: 'Symbol is required' },
            { status: 400 }
        );
    }

    try {
        // 查詢年報 (最近 5 年)
        const { data: annualData, error: annualError } = await supabase
            .from('stock_financials')
            .select('*')
            .eq('stock_code', symbol)
            .eq('report_type', 'annual')
            .order('report_date', { ascending: false })
            .limit(5);

        if (annualError) {
            console.error('Financials Annual Query Error:', annualError);
        }

        // 查詢季報 (最近 8 季)
        const { data: quarterlyData, error: quarterlyError } = await supabase
            .from('stock_financials')
            .select('*')
            .eq('stock_code', symbol)
            .eq('report_type', 'quarterly')
            .order('report_date', { ascending: false })
            .limit(8);

        if (quarterlyError) {
            console.error('Financials Quarterly Query Error:', quarterlyError);
        }

        // 格式化數據並計算衍生指標
        const formatRecords = (records: FinancialRecord[] | null) => {
            if (!records) return [];
            return records.map(r => {
                const { grossMargin, netMargin } = calculateMargins(r);
                return {
                    ...r,
                    fiscal_date: r.report_date, // 兼容前端
                    gross_margin: grossMargin?.toFixed(2),
                    net_margin: netMargin?.toFixed(2),
                };
            });
        };

        return NextResponse.json({
            symbol,
            annual: formatRecords(annualData),
            quarterly: formatRecords(quarterlyData),
            lastUpdated: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Financials API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
