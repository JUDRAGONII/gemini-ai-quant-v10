import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import CommandCenterPage from '../../app/monitor/command-center/page';
import { MonitorRepository } from '../../lib/monitorRepository';
import { MonitorDashboardResponse } from '../../types/api';

// Mock MonitorRepository
jest.mock('../../lib/monitorRepository');
const mockGetDashboardSummary = MonitorRepository.getDashboardSummary as jest.MockedFunction<typeof MonitorRepository.getDashboardSummary>;

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
    supabase: {
        channel: () => ({
            on: () => ({
                subscribe: () => { },
            }),
        }),
        removeChannel: () => { },
    },
}));

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock Data
const mockData: MonitorDashboardResponse = {
    timestamp: new Date().toISOString(),
    system: {
        cpu_usage: 45,
        ram_usage: 60,
        ram_total_gb: 32,
        uptime_seconds: 36000,
    },
    quota: {
        fugle: 800,
        tiingo: 4000,
        gemini: 14000,
        status: 'Healthy',
    },
    alerts: [
        {
            id: 1,
            created_at: new Date().toISOString(),
            alert_type: 'PRICE',
            stock_code: '2330',
            message: 'Price surge detected',
            severity: 'HIGH',
            is_active: true,
        },
    ],
    risk: {
        high_risk_count: 3,
        tickers: ['2330', '2454', '2317'],
    },
    evolution: [
        { generation: 1, avg_fitness: 0.5, max_fitness: 0.8 },
        { generation: 2, avg_fitness: 0.6, max_fitness: 0.85 },
    ],
};

describe('CommandCenterPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('TC-1001: renders loading state initially', async () => {
        // Delay resolution of the promise
        mockGetDashboardSummary.mockReturnValue(new Promise(() => { }));

        render(<CommandCenterPage />);
        expect(screen.getByText(/INITIALIZING AI COMMAND CENTER/i)).toBeInTheDocument();
    });

    it('TC-4001: renders dashboard widgets after data fetch with bilingual text', async () => {
        mockGetDashboardSummary.mockResolvedValue(mockData);

        await act(async () => {
            render(<CommandCenterPage />);
        });

        // Wait for loading to vanish and content to appear
        await waitFor(() => {
            expect(screen.getByText(/AI 監控中心/i)).toBeInTheDocument();
        });

        // Check Widgets (Bilingual Checks)
        expect(screen.getByText(/系統健康度/i)).toBeInTheDocument();
        expect(screen.getByText(/SYSTEM HEALTH/i)).toBeInTheDocument();

        expect(screen.getByText(/風險雷達/i)).toBeInTheDocument();
        expect(screen.getByText(/RISK RADAR/i)).toBeInTheDocument();

        expect(screen.getByText(/演化趨勢/i)).toBeInTheDocument();
        expect(screen.getByText(/EVOLUTION TREND/i)).toBeInTheDocument();

        expect(screen.getByText(/即時警示流/i)).toBeInTheDocument();
        expect(screen.getByText(/LIVE ALERTS/i)).toBeInTheDocument();

        // Check Data Content
        expect(screen.getByText('45%')).toBeInTheDocument(); // CPU
        expect(screen.getByText('3')).toBeInTheDocument(); // Risk Count

        // Check Tickers (Use getAllByText since it appears in both Risk and Alerts)
        expect(screen.getAllByText('2330').length).toBeGreaterThanOrEqual(1);
    });
});
