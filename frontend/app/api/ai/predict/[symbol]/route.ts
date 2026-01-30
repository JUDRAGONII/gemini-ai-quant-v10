import { NextRequest, NextResponse } from 'next/server';

const AI_API_URL = process.env.AI_API_URL || 'http://ai-api:8001';

export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    const { symbol } = params;

    try {
        const response = await fetch(`${AI_API_URL}/api/v1/ai/predict/${symbol}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Backend returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('AI Proxy Error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to AI service' },
            { status: 500 }
        );
    }
}
