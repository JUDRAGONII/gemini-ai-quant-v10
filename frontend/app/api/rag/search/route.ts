import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface SearchResult {
    id: string;
    stock_code: string;
    stock_name: string | null;
    title: string;
    content: string;
    similarity: number;
    report_date: string;
    report_type: string;
}

async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('No embedding API key configured');
    }

    const endpoint = apiKey.includes('gemini')
        ? `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`
        : 'https://api.openai.com/v1/embeddings';

    try {
        if (apiKey.includes('gemini')) {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'text-embedding-004',
                    content: { parts: [{ text }] },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate embedding');
            }

            const data = await response.json();
            return data.embedding?.values || [];
        } else {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'text-embedding-3-small',
                    input: text,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate embedding');
            }

            const data = await response.json();
            return data.data?.[0]?.embedding || [];
        }
    } catch (error) {
        console.error('Embedding error:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { query, limit = 10 } = body;

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const embedding = await generateEmbedding(query);

        const { data: results, error } = await supabase.rpc('match_reports', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: limit,
        });

        if (error) {
            console.error('Supabase RPC error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const searchResults: SearchResult[] = (results || []).map((row: any) => ({
            id: row.id || row.chunk_id,
            stock_code: row.stock_code,
            stock_name: row.stock_name,
            title: row.title || row.chunk_title || `${row.stock_code} 分析報告`,
            content: row.content || row.chunk_text || '',
            similarity: row.similarity || row.score || 0,
            report_date: row.report_date || row.created_at,
            report_type: row.report_type || 'AI Report',
        }));

        return NextResponse.json({
            query,
            count: searchResults.length,
            results: searchResults,
        });
    } catch (err: any) {
        console.error('Search error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
