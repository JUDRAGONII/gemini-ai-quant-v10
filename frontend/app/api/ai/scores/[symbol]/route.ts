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

        if (!symbol) {
            return NextResponse.json({
                status: 'error',
                error: {
                    code: '40001',
                    message: '股票代碼不可為空'
                }
            }, { status: 400 });
        }

        // 查詢最新評分數據
        const { data: factors, error } = await supabase
            .from('stock_factors')
            .select('*')
            .eq('stock_code', symbol)
            .order('trade_date', { ascending: false })
            .limit(1)
            .single();

        // 查詢股票資訊
        const { data: stock } = await supabase
            .from('stocks')
            .select('stock_name, stock_code, industry')
            .eq('stock_code', symbol)
            .single();

        // 計算評分
        const scores = calculateAIScores(factors);
        const scoreChange = calculateScoreChanges(factors);

        const stockName = stock?.stock_name || symbol;
        const industry = stock?.industry || '未分類';

        return NextResponse.json({
            status: 'success',
            data: {
                stock_code: symbol,
                stock_name: stockName,
                industry,
                composite_score: scores.composite,
                score_change: scoreChange,
                scores: scores.factors,
                recommendation: generateRecommendation(scores.composite),
                last_updated: factors?.trade_date || new Date().toISOString().split('T')[0]
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] ai/scores/[symbol]:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}

function calculateAIScores(factors: any) {
    if (!factors) {
        return {
            composite: 65,
            factors: {
                value: { score: 60, change: 0, factors: [] },
                growth: { score: 65, change: 0, factors: [] },
                quality: { score: 70, change: 0, factors: [] },
                momentum: { score: 60, change: 0, factors: [] },
                macro: { score: 70, change: 0, factors: [] }
            }
        };
    }

    const valueScore = factors.pe_ratio
        ? Math.min(100, Math.max(0, 100 - (factors.pe_ratio - 10) * 2))
        : 60;

    const growthScore = factors.revenue_growth
        ? Math.min(100, Math.max(0, 50 + factors.revenue_growth))
        : 60;

    const qualityScore = factors.roe
        ? Math.min(100, factors.roe * 2)
        : 60;

    const momentumScore = factors.momentum_1m
        ? Math.min(100, Math.max(0, 50 + factors.momentum_1m))
        : 60;

    const composite = Math.round(
        (valueScore * 0.2 + growthScore * 0.25 + qualityScore * 0.3 + momentumScore * 0.15 + 75 * 0.1)
    );

    return {
        composite: Math.round(composite * 10) / 10,
        factors: {
            value: {
                score: Math.round(valueScore * 10) / 10,
                change: Math.round((Math.random() - 0.5) * 10 * 10) / 10,
                factors: [
                    { name: '本益比', value: factors.pe_ratio, score: Math.round(valueScore), weight: 0.3 },
                    { name: '殖利率', value: factors.dividend_yield, score: Math.round(valueScore * 0.9), weight: 0.2 }
                ]
            },
            growth: {
                score: Math.round(growthScore * 10) / 10,
                change: Math.round((Math.random() - 0.5) * 10 * 10) / 10,
                factors: [
                    { name: '營收成長率', value: factors.revenue_growth, score: Math.round(growthScore), weight: 0.4 },
                    { name: 'EPS成長', value: factors.eps_growth, score: Math.round(growthScore * 0.95), weight: 0.3 }
                ]
            },
            quality: {
                score: Math.round(qualityScore * 10) / 10,
                change: Math.round((Math.random() - 0.5) * 5 * 10) / 10,
                factors: [
                    { name: 'ROE', value: factors.roe, score: Math.round(qualityScore), weight: 0.4 },
                    { name: '毛利率', value: factors.gross_margin, score: Math.round(qualityScore * 0.9), weight: 0.3 }
                ]
            },
            momentum: {
                score: Math.round(momentumScore * 10) / 10,
                change: Math.round((Math.random() - 0.5) * 15 * 10) / 10,
                factors: [
                    { name: '20日動能', value: factors.momentum_1m, score: Math.round(momentumScore), weight: 0.5 }
                ]
            },
            macro: {
                score: 75 + Math.round((Math.random() - 0.5) * 10),
                change: Math.round((Math.random() - 0.5) * 3 * 10) / 10,
                factors: [
                    { name: '利率環境', value: 5.25, score: 75, weight: 0.4 }
                ]
            }
        }
    };
}

function calculateScoreChanges(latest: any) {
    // 模擬分數變化
    return {
        daily: Math.round((Math.random() - 0.5) * 2 * 10) / 10,
        weekly: Math.round((Math.random() - 0.3) * 5 * 10) / 10,
        monthly: Math.round((Math.random() - 0.2) * 8 * 10) / 10
    };
}

function generateRecommendation(composite: number) {
    if (composite >= 80) {
        return { rating: '強烈買進', confidence: 85 };
    } else if (composite >= 65) {
        return { rating: '買進', confidence: 70 };
    } else if (composite >= 50) {
        return { rating: '持有', confidence: 50 };
    } else {
        return { rating: '賣出', confidence: 60 };
    }
}
