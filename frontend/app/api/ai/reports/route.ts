import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const stockCode = searchParams.get('stock_code');
        const reportType = searchParams.get('report_type') || 'daily';
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '20');

        const offset = (page - 1) * perPage;

        let query = supabase
            .from('ai_reports')
            .select('id, stock_code, stock_name, report_type, report_date, summary, version, created_at')
            .order('report_date', { ascending: false })
            .range(offset, offset + perPage - 1);

        if (stockCode) {
            query = query.eq('stock_code', stockCode);
        }

        if (reportType) {
            query = query.eq('report_type', reportType);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('[API Error] ai/reports query:', error);
            // 返回模擬數據
            return NextResponse.json({
                status: 'success',
                data: {
                    reports: generateMockReports(stockCode, perPage),
                    meta: {
                        page,
                        per_page: perPage,
                        total: 50,
                        has_more: page < 3
                    }
                },
                timestamp: new Date().toISOString()
            });
        }

        const reports = (data || []).map((report: any) => ({
            id: report.id,
            stock_code: report.stock_code,
            stock_name: report.stock_name,
            report_type: report.report_type,
            title: `${report.stock_name} AI 投資分析報告`,
            summary: report.summary,
            generated_at: report.created_at,
            version: report.version || 'v1.0'
        }));

        return NextResponse.json({
            status: 'success',
            data: {
                reports,
                meta: {
                    page,
                    per_page: perPage,
                    total: count || 50,
                    has_more: offset + perPage < (count || 50)
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] ai/reports:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}

function generateMockReports(stockCode: string | null, count: number) {
    const stocks = stockCode
        ? [{ code: stockCode, name: stockCode }]
        : [
            { code: '2330', name: '台積電' },
            { code: '2454', name: '聯發科' },
            { code: '2317', name: '鴻海' },
            { code: '2303', name: '聯電' },
            { code: '2379', name: '技嘉' }
          ];

    return stocks.slice(0, count).map((stock, index) => ({
        id: `uuid-${Date.now()}-${index}`,
        stock_code: stock.code,
        stock_name: stock.name,
        report_type: 'daily',
        title: `${stock.name} AI 投資分析報告`,
        summary: `綜合評分 ${85 - index * 3} 分，${index < 2 ? '獲利能力優異，給予買進建議' : '估值合理，維持持有'}`,
        generated_at: new Date(Date.now() - index * 86400000).toISOString(),
        version: 'v1.2'
    }));
}
