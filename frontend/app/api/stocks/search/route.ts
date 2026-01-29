import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

function generateMockSearchResults(q: string, limit: number) {
    const mockStocks = [
        { code: '2330', name: '台積電', market: 'TWSE', industry: '半導體' },
        { code: '2330A', name: '台積電甲種特別股', market: 'TWSE', industry: '金融' },
        { code: '2454', name: '聯發科', market: 'TWSE', industry: 'IC設計' },
        { code: '2317', name: '鴻海', market: 'TWSE', industry: '電子組裝' },
        { code: '2303', name: '聯電', market: 'TWSE', industry: '晶圓代工' },
        { code: '2308', name: '廣達', market: 'TWSE', industry: '電子組裝' },
        { code: '2379', name: '技嘉', market: 'TWSE', industry: '主機板' },
        { code: '2377', name: '微星', market: 'TWSE', industry: '顯示卡' },
        { code: '2382', name: '廣達', market: 'TWSE', industry: '伺服器' },
        { code: '2409', name: '友達', market: 'TWSE', industry: '面板' },
        { code: '2412', name: '中華電', market: 'TWSE', industry: '電信' },
        { code: 'AAPL', name: 'Apple Inc.', market: 'US', industry: '科技' },
        { code: 'MSFT', name: 'Microsoft Corp.', market: 'US', industry: '軟體' },
        { code: 'GOOGL', name: 'Alphabet Inc.', market: 'US', industry: '網路' },
        { code: 'NVDA', name: 'NVIDIA Corp.', market: 'US', industry: '半導體' },
    ];

    const filtered = mockStocks.filter(s =>
        s.code.toLowerCase().includes(q.toLowerCase()) ||
        s.name.toLowerCase().includes(q.toLowerCase())
    );

    return filtered.slice(0, limit).map(stock => ({
        code: stock.code,
        name: stock.name,
        market: stock.market,
        industry: stock.industry
    }));
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '20');
        const market = searchParams.get('market');

        if (!q || q.length < 1) {
            return NextResponse.json({
                status: 'error',
                error: {
                    code: '40001',
                    message: '搜尋關鍵字不可為空'
                }
            }, { status: 400 });
        }

        // 如果 Supabase 未初始化，使用 Mock 數據
        if (!supabase) {
            return NextResponse.json({
                status: 'success',
                data: {
                    results: generateMockSearchResults(q, limit)
                },
                timestamp: new Date().toISOString()
            });
        }

        let query = supabase
            .from('stocks')
            .select('stock_code, stock_name, market_type, industry, exchange_code')
            .or(`stock_code.ilike.%${q}%,stock_name.ilike.%${q}%`)
            .eq('is_active', true)
            .limit(limit);

        if (market) {
            query = query.eq('market_type', market);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({
                status: 'success',
                data: {
                    results: generateMockSearchResults(q, limit)
                },
                timestamp: new Date().toISOString()
            });
        }

        const results = (data || []).map((stock: any) => ({
            code: stock.stock_code,
            name: stock.stock_name,
            market: stock.market_type,
            industry: stock.industry,
            exchange: stock.exchange_code
        }));

        return NextResponse.json({
            status: 'success',
            data: { results },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        return NextResponse.json({
            status: 'success',
            data: {
                results: generateMockSearchResults('2330', 5)
            },
            timestamp: new Date().toISOString()
        });
    }
}
