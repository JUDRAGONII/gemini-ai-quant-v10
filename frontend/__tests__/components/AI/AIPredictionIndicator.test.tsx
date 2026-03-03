import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIPredictionIndicator } from '@/components/AI/AIPredictionIndicator';

// Mock Bilingual component to render its translations
jest.mock('@/components/ui/Bilingual', () => {
    return {
        Bilingual: ({ zh, en, mode }: any) => (
            <div data-testid="mock-bilingual">
                {zh} | {en}
            </div>
        )
    };
});

describe('AIPredictionIndicator', () => {
    it('TC-7001: 呈現象徵 Loading 狀態的轉圈骨架 (Loading Skeleton)', () => {
        const { container } = render(
            <AIPredictionIndicator alpha={0} winRate={0} loading={true} />
        );
        // Loading mode should display a pulse effect div containing a spinning BrainCircuit icon
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('TC-7002: 呈現看多狀態 (Bullish) - Alpha 大於 0', () => {
        render(<AIPredictionIndicator alpha={0.035} winRate={0.65} loading={false} />);

        // Assert header is bilingual
        expect(screen.getByText('AI 預測核心 (5D Alpha) | AI Prediction Core (5D Alpha)')).toBeInTheDocument();

        // Assert Alpha value formatting (adds '+', multiplies by 100, 2 decimals)
        expect(screen.getByText('+3.50%')).toBeInTheDocument();

        // Assert Bullish text is bilingual
        expect(screen.getByText('標的前景: 看多 (Bullish) | Outlook: Bullish')).toBeInTheDocument();
    });

    it('TC-7003: 呈現偏弱狀態 (Bearish) - Alpha 小於 0', () => {
        render(<AIPredictionIndicator alpha={-0.012} winRate={0.4} loading={false} />);

        // Assert Alpha value formatting (no '+' prefix for negative)
        expect(screen.getByText('-1.20%')).toBeInTheDocument();

        // Assert Bearish text is bilingual
        expect(screen.getByText('標的前景: 偏弱 (Bearish) | Outlook: Bearish')).toBeInTheDocument();
    });
});
