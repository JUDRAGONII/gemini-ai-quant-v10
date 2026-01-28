import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PerformanceDataPoint {
    date: string;
    total_value: number;
    total_cost: number;
    return_amount: number;
    return_rate: number;
}

interface PortfolioSummary {
    total_cost: number;
    total_value: number;
    return_amount: number;
    return_rate: number;
    holdings_count: number;
}

async function getStockPrice(stockCode: string): Promise<number | null> {
    try {
        const { data } = await supabase
            .from('stocks')
            .select('close_price')
            .eq('symbol', stockCode)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        return data?.close_price || null;
    } catch {
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') || '1M';

        const { data: portfolio, error: portfolioError } = await supabase
            .from('user_portfolios')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (portfolioError) {
            if (portfolioError.code === 'PGRST116') {
                return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
            }
            return NextResponse.json({ error: portfolioError.message }, { status: 500 });
        }

        const { data: holdings, error: holdingsError } = await supabase
            .from('user_holdings')
            .select('*')
            .eq('portfolio_id', id);

        if (holdingsError) {
            return NextResponse.json({ error: holdingsError.message }, { status: 500 });
        }

        let totalCost = 0;
        let totalValue = 0;
        const holdingsWithCurrentPrice = await Promise.all(
            (holdings || []).map(async (holding) => {
                const currentPrice = await getStockPrice(holding.stock_code);
                const cost = holding.buy_price * holding.shares + (holding.commission || 0) + (holding.tax || 0);
                const value = (currentPrice || holding.buy_price) * holding.shares;
                totalCost += cost;
                totalValue += value;

                return {
                    ...holding,
                    current_price: currentPrice || holding.buy_price,
                    cost,
                    value,
                    return_amount: value - cost,
                    return_rate: cost > 0 ? ((value - cost) / cost) * 100 : 0,
                };
            })
        );

        const returnAmount = totalValue - totalCost;
        const returnRate = totalCost > 0 ? (returnAmount / totalCost) * 100 : 0;

        const summary: PortfolioSummary = {
            total_cost: totalCost,
            total_value: totalValue,
            return_amount: returnAmount,
            return_rate: returnRate,
            holdings_count: holdings?.length || 0,
        };

        const now = new Date();
        let startDate = new Date();
        
        switch (period) {
            case '1W':
                startDate.setDate(now.getDate() - 7);
                break;
            case '1M':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3M':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '6M':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case '1Y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }

        const performanceData: PerformanceDataPoint[] = [];
        const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const progressRatio = i / Math.max(daysDiff, 1);
            const simulatedValue = totalCost + (totalValue - totalCost) * progressRatio;
            const simulatedReturn = simulatedValue - totalCost;
            const simulatedRate = totalCost > 0 ? (simulatedReturn / totalCost) * 100 : 0;

            performanceData.push({
                date: dateStr,
                total_value: Math.round(simulatedValue * 100) / 100,
                total_cost: totalCost,
                return_amount: Math.round(simulatedReturn * 100) / 100,
                return_rate: Math.round(simulatedRate * 100) / 100,
            });
        }

        const topHoldings = holdingsWithCurrentPrice
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map(h => ({
                stock_code: h.stock_code,
                stock_name: h.stock_name,
                value: h.value,
                return_amount: h.return_amount,
                return_rate: h.return_rate,
                weight: totalValue > 0 ? (h.value / totalValue) * 100 : 0,
            }));

        return NextResponse.json({
            summary,
            performance_data: performanceData,
            top_holdings: topHoldings,
            holdings_details: holdingsWithCurrentPrice,
            period,
        });
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
