import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

interface GenerateReportRequest {
    stock_code: string;
    report_type?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    force_regenerate?: boolean;
}

async function generateAIContent(stockCode: string, context: Record<string, unknown>): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('No AI API key configured');
    }

    const prompt = `請生成一份關於 ${stockCode} 的投資分析報告，基於以下數據：
${JSON.stringify(context, null, 2)}

報告應包含：
1. 投資摘要
2. 財務分析
3. 技術面分析
4. 風險評估
5. 投資建議

請用繁體中文撰寫，專業且客觀。`;

    const endpoint = apiKey.includes('gemini')
        ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
        : 'https://api.openai.com/v1/chat/completions';

    try {
        if (apiKey.includes('gemini')) {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate AI content');
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '生成失敗';
        } else {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 2048,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate AI content');
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || '生成失敗';
        }
    } catch (error) {
        console.error('AI generation error:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    if (!supabase) {
        return NextResponse.json({
            status: 'error',
            error: { code: '50002', message: 'Supabase 未配置' }
        }, { status: 500 });
    }

    try {
        const body: GenerateReportRequest = await request.json();
        const { stock_code, report_type = 'daily', force_regenerate = false } = body;

        if (!stock_code) {
            return NextResponse.json({
                status: 'error',
                error: { code: '40001', message: '股票代碼不可為空' }
            }, { status: 400 });
        }

        const { data: stockInfo, error: stockError } = await supabase
            .from('stocks')
            .select('stock_code, stock_name, market_type, industry, sector')
            .eq('stock_code', stock_code)
            .single();

        if (stockError || !stockInfo) {
            return NextResponse.json({
                status: 'error',
                error: { code: '40401', message: '股票不存在' }
            }, { status: 404 });
        }

        if (!force_regenerate) {
            const { data: existingReport } = await supabase
                .from('ai_reports')
                .select('id, created_at')
                .eq('stock_code', stock_code)
                .eq('report_type', report_type)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (existingReport) {
                const createdDate = new Date(existingReport.created_at);
                const now = new Date();
                const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

                if (hoursDiff < 6) {
                    return NextResponse.json({
                        status: 'success',
                        data: {
                            report_id: existingReport.id,
                            message: '已有近期報告，使用現有報告',
                            is_cached: true
                        },
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }

        const { data: latestPrice } = await supabase
            .from('daily_price')
            .select('trade_date, close_price, change_percent, volume')
            .eq('stock_code', stock_code)
            .order('trade_date', { ascending: false })
            .limit(1)
            .single();

        const { data: factors } = await supabase
            .from('stock_factors')
            .select('*')
            .eq('stock_code', stock_code)
            .order('trade_date', { ascending: false })
            .limit(1)
            .single();

        const { data: financials } = await supabase
            .from('stock_financials')
            .select('*')
            .eq('stock_code', stock_code)
            .order('report_date', { ascending: false })
            .limit(1)
            .single();

        const context = {
            stock: stockInfo,
            price: latestPrice,
            factors: factors,
            financials: financials
        };

        const content = await generateAIContent(stock_code, context);

        const { data: newReport, error: insertError } = await supabase
            .from('ai_reports')
            .insert({
                stock_code: stock_code,
                stock_name: stockInfo.stock_name,
                report_type: report_type,
                title: `${stockInfo.stock_name} AI 投資分析報告`,
                content: content,
                summary: content.substring(0, 200) + '...',
                composite_score: factors?.composite_score || null,
                scores: factors ? JSON.stringify({
                    value: factors.value_score,
                    growth: factors.growth_score,
                    quality: factors.quality_score,
                    momentum: factors.momentum_score,
                    macro: factors.macro_score
                }) : null,
                context_snapshot: JSON.stringify(context),
                version: 'v1.0',
                report_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({
            status: 'success',
            data: {
                report_id: newReport.id,
                stock_code: stock_code,
                report_type: report_type,
                generated: true,
                is_cached: false
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('[API Error] ai/generate-report:', err);
        return NextResponse.json({
            status: 'error',
            error: {
                code: '50001',
                message: err instanceof Error ? err.message : '伺服器內部錯誤'
            }
        }, { status: 500 });
    }
}
