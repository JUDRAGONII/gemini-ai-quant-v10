import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/holdings - 新增持股部位
export async function POST(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { portfolio_id, stock_code, stock_name, buy_date, buy_price, shares, commission, tax, notes } = body;

        if (!portfolio_id || !stock_code || !buy_date || !buy_price || !shares) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: portfolio, error: portfolioError } = await supabase
            .from('user_portfolios')
            .select('user_id')
            .eq('id', portfolio_id)
            .single();

        if (portfolioError || portfolio.user_id !== user.id) {
            return NextResponse.json({ error: 'Portfolio not found or access denied' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('user_holdings')
            .insert({
                portfolio_id,
                stock_code,
                stock_name: stock_name || null,
                buy_date,
                buy_price,
                shares,
                commission: commission || 0,
                tax: tax || 0,
                notes: notes || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/holdings/[id] - 更新持股部位
export async function PUT(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, stock_code, stock_name, buy_date, buy_price, shares, commission, tax, notes } = body;

        const { data: holding, error: holdingError } = await supabase
            .from('user_holdings')
            .select('portfolio_id')
            .eq('id', id)
            .single();

        if (holdingError) {
            return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
        }

        const { data: portfolio, error: portfolioError } = await supabase
            .from('user_portfolios')
            .select('user_id')
            .eq('id', holding.portfolio_id)
            .single();

        if (portfolioError || portfolio.user_id !== user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('user_holdings')
            .update({
                stock_code,
                stock_name,
                buy_date,
                buy_price,
                shares,
                commission,
                tax,
                notes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/holdings/[id] - 刪除持股部位
export async function DELETE(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const { data: holding, error: holdingError } = await supabase
            .from('user_holdings')
            .select('portfolio_id')
            .eq('id', id)
            .single();

        if (holdingError) {
            return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
        }

        const { data: portfolio, error: portfolioError } = await supabase
            .from('user_portfolios')
            .select('user_id')
            .eq('id', holding.portfolio_id)
            .single();

        if (portfolioError || portfolio.user_id !== user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { error } = await supabase
            .from('user_holdings')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
