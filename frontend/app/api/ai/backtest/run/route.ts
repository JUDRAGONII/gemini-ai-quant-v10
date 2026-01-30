import { NextRequest, NextResponse } from 'next/server';

const AI_API_URL = process.env.AI_API_URL || 'http://ai-api:8001';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${AI_API_URL}/api/v1/backtest/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
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
        console.error('Backtest Proxy Error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to Backtest service' },
            { status: 500 }
        );
    }
}
