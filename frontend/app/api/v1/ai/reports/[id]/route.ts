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
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({
            status: 'error',
            error: { code: '40001', message: '報告 ID 不可為空' }
        }, { status: 400 });
    }

    if (!supabase) {
        return NextResponse.json({
            status: 'error',
            error: { code: '50002', message: 'Supabase 未配置' }
        }, { status: 500 });
    }

    try {
        const { data: report, error } = await supabase
            .from('ai_reports')
            .select(`
                id,
                stock_code,
                stock_name,
                report_type,
                report_date,
                title,
                content,
                summary,
                version,
                context_snapshot,
                composite_score,
                scores,
                created_at,
                updated_at
            `)
            .eq('id', id)
            .single();

        if (error || !report) {
            return NextResponse.json({
                status: 'error',
                error: { code: '40401', message: '找不到該報告' }
            }, { status: 404 });
        }

        const responseData = {
            id: report.id,
            stock_code: report.stock_code,
            stock_name: report.stock_name,
            report_type: report.report_type,
            report_date: report.report_date,
            title: report.title || `${report.stock_name} AI 投資分析報告`,
            content: report.content,
            summary: report.summary,
            version: report.version || 'v1.0',
            context_snapshot: report.context_snapshot,
            composite_score: report.composite_score,
            scores: report.scores ? (
                typeof report.scores === 'string' ? JSON.parse(report.scores) : report.scores
            ) : null,
            created_at: report.created_at,
            updated_at: report.updated_at
        };

        return NextResponse.json({
            status: 'success',
            data: responseData,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] ai/reports/{id}:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}
