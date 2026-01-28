import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface EconomicEvent {
    id: string;
    country: string;
    event_name: string;
    event_date: string;
    importance: 'high' | 'medium' | 'low';
    previous_value: string | null;
    forecast_value: string | null;
    actual_value: string | null;
    unit: string | null;
}

export async function GET(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
        const endDate = searchParams.get('end_date') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const country = searchParams.get('country');
        const importance = searchParams.get('importance');

        let query = supabase
            .from('economic_calendar')
            .select('*')
            .gte('event_date', startDate)
            .lte('event_date', endDate)
            .order('event_date', { ascending: true });

        if (country) {
            query = query.eq('country', country);
        }

        if (importance) {
            query = query.eq('importance', importance);
        }

        const { data: events, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const formattedEvents: EconomicEvent[] = (events || []).map(event => ({
            id: event.id,
            country: event.country,
            event_name: event.event_name,
            event_date: event.event_date,
            importance: event.importance || 'medium',
            previous_value: event.previous_value,
            forecast_value: event.forecast_value,
            actual_value: event.actual_value,
            unit: event.unit,
        }));

        const summary = {
            total: formattedEvents.length,
            highImportance: formattedEvents.filter(e => e.importance === 'high').length,
            countries: Array.from(new Set(formattedEvents.map(e => e.country))),
        };

        return NextResponse.json({
            start_date: startDate,
            end_date: endDate,
            count: formattedEvents.length,
            summary,
            events: formattedEvents,
        });
    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
