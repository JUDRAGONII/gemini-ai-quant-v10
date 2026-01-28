import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/portfolios/[id] - 取得單一投資組合詳情
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
            console.error('Portfolio error:', portfolioError);
            return NextResponse.json({ error: portfolioError.message }, { status: 500 });
        }

        const { data: holdings, error: holdingsError } = await supabase
            .from('user_holdings')
            .select('*')
            .eq('portfolio_id', id)
            .order('created_at', { ascending: false });

        if (holdingsError) {
            console.error('Holdings error:', holdingsError);
            return NextResponse.json({ error: holdingsError.message }, { status: 500 });
        }

        return NextResponse.json({
            ...portfolio,
            holdings: holdings || [],
        });
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/portfolios/[id] - 更新投資組合
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { name, description, is_default } = body;

        const { data, error } = await supabase
            .from('user_portfolios')
            .update({
                name,
                description,
                is_default,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id)
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

// DELETE /api/portfolios/[id] - 刪除投資組合
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        const { error } = await supabase
            .from('user_portfolios')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

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
