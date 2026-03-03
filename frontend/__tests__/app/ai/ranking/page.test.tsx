import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RankingPage from '@/app/ai/ranking/page';

// Mock Fetch
global.fetch = jest.fn();

// Mock Bilingual
jest.mock('@/components/ui/Bilingual', () => ({
    __esModule: true,
    Bilingual: ({ zh, en }: any) => <span data-testid="mock-bilingual">{zh} | {en}</span>,
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// Mock ScoreRadarChart (Recharts 在 Jest 環境中不可靠)
jest.mock('@/components/ScoreRadarChart', () => ({
    __esModule: true,
    default: ({ symbol, data, customScore }: any) => (
        <div data-testid="mock-radar-chart">
            {symbol} - {customScore}
        </div>
    ),
}));

// Mock GlassCard
jest.mock('@/components/ui/GlassCard', () => ({
    __esModule: true,
    GlassCard: ({ children, className }: any) => (
        <div data-testid="mock-glass-card" className={className}>{children}</div>
    ),
}));

// Mock RankingTable (避免 Link 與 Sorting 邏輯干擾)
jest.mock('@/components/RankingTable', () => ({
    __esModule: true,
    default: ({ data, onRowClick }: any) => (
        <div data-testid="mock-ranking-table">
            {data.map((item: any) => (
                <div key={item.symbol} data-testid={`row-${item.symbol}`} onClick={() => onRowClick?.(item)}>
                    <span>{item.name}</span>
                    <span>{item.compositeScore}</span>
                </div>
            ))}
        </div>
    ),
}));

describe('RankingPage (Phase 14.11 - 智慧排名雙語化)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockRankingResponse = {
        count: 3,
        dimension: 'composite',
        data: [
            {
                rank: 1,
                symbol: '2330',
                name: '台積電',
                composite_score: 82.5,
                value_score: 78,
                growth_score: 72,
                quality_score: 85,
                momentum_score: 68,
                change_percent: 1.25,
                trade_date: '2026-03-03',
            },
            {
                rank: 2,
                symbol: 'NVDA',
                name: 'NVIDIA',
                composite_score: 79.0,
                value_score: 55,
                growth_score: 95,
                quality_score: 78,
                momentum_score: 92,
                change_percent: -0.85,
                trade_date: '2026-03-03',
            },
            {
                rank: 3,
                symbol: '2317',
                name: '鴻海',
                composite_score: 65.0,
                value_score: 65,
                growth_score: 58,
                quality_score: 70,
                momentum_score: 52,
                change_percent: 0.32,
                trade_date: '2026-03-03',
            },
        ],
    };

    it('TC-141101: 確認 Loading 狀態正確渲染', () => {
        // 模擬永遠不 resolve 的 fetch
        (global.fetch as jest.Mock).mockReturnValue(new Promise(() => { }));

        render(<RankingPage />);
        // 驗證 Loading 文字
        expect(screen.getByText('正在載入排行榜... | Loading rankings...')).toBeInTheDocument();
    });

    it('TC-141102: API 成功回傳後，排行榜與統計卡片正確渲染', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockRankingResponse,
        });

        render(<RankingPage />);

        // 等待資料渲染 (台積電會同時出現在表格和側邊詳情面板)
        await waitFor(() => {
            expect(screen.getAllByText('台積電').length).toBeGreaterThanOrEqual(1);
        });

        // 驗證頁面標題雙語化
        expect(screen.getByText('智慧排名決策 | AI Quantitative Ranking')).toBeInTheDocument();

        // 驗證排行榜渲染 (標的名稱)
        expect(screen.getByText('NVIDIA')).toBeInTheDocument();
        expect(screen.getByText('鴻海')).toBeInTheDocument();

        // 驗證 fetch 被正確呼叫
        expect(global.fetch).toHaveBeenCalledWith('/api/v1/analysis/top-scores?limit=50&dimension=composite');
    });

    it('TC-141103: API 錯誤時顯示錯誤訊息', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'Database connection failed' }),
        });

        render(<RankingPage />);

        await waitFor(() => {
            expect(screen.getByText('Database connection failed')).toBeInTheDocument();
        });
    });

    it('TC-141104: 空資料狀態的顯示', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ count: 0, dimension: 'composite', data: [] }),
        });

        render(<RankingPage />);

        await waitFor(() => {
            expect(screen.getByText('尚無排行資料 | No ranking data available')).toBeInTheDocument();
        });
    });
});
