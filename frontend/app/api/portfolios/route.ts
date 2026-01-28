import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Portfolio {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    currency: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

interface Holding {
    id: string;
    portfolio_id: string;
    stock_code: string;
    stock_name: string | null;
    buy_date: string;
    buy_price: number;
    shares: number;
    commission: number;
    tax: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// GET /api/portfolios - 取得用戶所有投資組合
export async function GET(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('user_portfolios')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}

// POST /api/portfolios - 建立新投資組合
export async function POST(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, currency, is_default } = body;

        if (!name) {
            return NextResponse.json({ error: 'name is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_portfolios')
            .insert({
                user_id: user.id,
                name,
                description: description || null,
                currency: currency || 'TWD',
                is_default: is_default || false,
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
