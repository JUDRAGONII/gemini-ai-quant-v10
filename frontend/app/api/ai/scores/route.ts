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
        const market = searchParams.get('market') || 'TW';
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '50');
        const sortBy = searchParams.get('sort_by') || 'composite_score';
        const sortOrder = searchParams.get('sort_order') || 'desc';

        if (!supabase) {
            return NextResponse.json({
                status: 'error',
                error: {
                    code: '50002',
                    message: 'Supabase 未配置'
                }
            }, { status: 500 });
        }

        const offset = (page - 1) * perPage;

        const marketFilter = market === 'TW' ? 'LIKE \'%.TW\'' : 'NOT LIKE \'%.TW\'';

        const { data: factorsData, error: factorsError } = await supabase
            .from('stock_factors')
            .select('stock_code, trade_date, pe_ratio, pb_ratio, revenue_growth, eps_growth, momentum_1m, roe, gross_margin, composite_score')
            .ilike('stock_code', market === 'TW' ? '%TW' : '%')
            .not('stock_code', 'like', market === 'TW' ? '%:%' : null)
            .order('trade_date', { ascending: false });

        if (factorsError || !factorsData || factorsData.length === 0) {
            return NextResponse.json({
                status: 'error',
                error: {
                    code: '40401',
                    message: '找不到評分數據'
                }
            }, { status: 404 });
        }

        const latestFactors = new Map();
        factorsData.forEach((row: any) => {
            if (!latestFactors.has(row.stock_code)) {
                latestFactors.set(row.stock_code, row);
            }
        });

        const scores = Array.from(latestFactors.values())
            .slice(0, perPage)
            .map((factor: any) => ({
                stock_code: factor.stock_code,
                stock_name: factor.stock_code.split('.')[0],
                market: market,
                industry: '科技',
                composite_score: Math.round((factor.composite_score || 0) * 100) / 100,
                scores: {
                    value: Math.round((factor.pe_ratio ? Math.min(100, Math.max(0, 100 - factor.pe_ratio / 2)) : 50) * 10) / 10,
                    growth: Math.round(((factor.revenue_growth || 0) * 50 + 50) * 10) / 10,
                    quality: Math.round((factor.roe || 50) * 10) / 10,
                    momentum: Math.round((factor.momentum_1m || 50) * 10) / 10,
                    macro: 65.0
                },
                last_updated: factor.trade_date
            }))
            .sort((a: any, b: any) => {
                const aVal = a.composite_score;
                const bVal = b.composite_score;
                return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
            });

        const totalCount = latestFactors.size;
        const totalPages = Math.ceil(totalCount / perPage);

        const avgComposite = scores.reduce((sum: number, s: any) => sum + s.composite_score, 0) / scores.length;
        const highestComposite = Math.max(...scores.map((s: any) => s.composite_score));
        const lowestComposite = Math.min(...scores.map((s: any) => s.composite_score));

        return NextResponse.json({
            status: 'success',
            data: {
                scores,
                statistics: {
                    avg_composite: Math.round(avgComposite * 100) / 100,
                    highest_composite: Math.round(highestComposite * 100) / 100,
                    lowest_composite: Math.round(lowestComposite * 100) / 100,
                    total_count: totalCount
                }
            },
            meta: {
                page,
                per_page: perPage,
                total: totalCount,
                total_pages: totalPages,
                has_more: page < totalPages
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] ai/scores:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}
