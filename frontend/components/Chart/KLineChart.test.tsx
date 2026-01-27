import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { KLineChart, ChartPeriod, KLinePricePoint } from './KLineChart';
import { TechnicalIndicatorPanel } from './TechnicalIndicatorPanel';

const mockData: KLinePricePoint[] = Array.from({ length: 100 }, (_, i) => {
    const basePrice = 1000 + i * 2;
    const volatility = 20;
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = basePrice + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    return {
        time: Math.floor(Date.now() / 1000) - (100 - i) * 86400,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 10000000),
    };
});

describe('KLineChart', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders without crashing', async () => {
        render(<KLineChart data={mockData} symbol="2330.TW" />);

        await waitFor(() => {
            expect(screen.getByText('2330.TW')).toBeInTheDocument();
        });
    });

    it('renders period buttons correctly', async () => {
        render(<KLineChart data={mockData} showMA={true} />);

        await waitFor(() => {
            expect(screen.getByText('1D')).toBeInTheDocument();
            expect(screen.getByText('1W')).toBeInTheDocument();
            expect(screen.getByText('1M')).toBeInTheDocument();
            expect(screen.getByText('3M')).toBeInTheDocument();
            expect(screen.getByText('6M')).toBeInTheDocument();
            expect(screen.getByText('1Y')).toBeInTheDocument();
            expect(screen.getByText('MAX')).toBeInTheDocument();
        });
    });

    it('shows MA legend when showMA is true', async () => {
        render(<KLineChart data={mockData} showMA={true} />);

        await waitFor(() => {
            expect(screen.getByText('MA5')).toBeInTheDocument();
            expect(screen.getByText('MA10')).toBeInTheDocument();
            expect(screen.getByText('MA20')).toBeInTheDocument();
            expect(screen.getByText('MA60')).toBeInTheDocument();
            expect(screen.getByText('MA120')).toBeInTheDocument();
        });
    });

    it('hides MA legend when showMA is false', async () => {
        render(<KLineChart data={mockData} showMA={false} />);

        await waitFor(() => {
            expect(screen.queryByText('MA5')).not.toBeInTheDocument();
        });
    });

    it('calls onPeriodChange when period button is clicked', async () => {
        const mockOnPeriodChange = jest.fn();
        render(
            <KLineChart
                data={mockData}
                period="1Y"
                onPeriodChange={mockOnPeriodChange}
            />
        );

        await waitFor(() => {
            fireEvent.click(screen.getByText('3M'));
            expect(mockOnPeriodChange).toHaveBeenCalledWith('3M');
        });
    });

    it('renders empty state when no data', async () => {
        render(<KLineChart data={[]} symbol="2330.TW" />);

        await waitFor(() => {
            expect(screen.getByText('2330.TW')).toBeInTheDocument();
        });
    });

    it('renders chart container with correct styling', async () => {
        render(<KLineChart data={mockData} symbol="2330.TW" />);

        const chartContainer = document.querySelector('.bg-white\\/5');
        expect(chartContainer).toBeInTheDocument();
    });

    it('handles data updates correctly', async () => {
        const { rerender } = render(<KLineChart data={mockData.slice(0, 50)} symbol="2330.TW" />);

        await waitFor(() => {
            expect(screen.getByText('2330.TW')).toBeInTheDocument();
        });

        rerender(<KLineChart data={mockData} symbol="2330.TW" />);

        await waitFor(() => {
            expect(screen.getByText('2330.TW')).toBeInTheDocument();
        });
    });
});

describe('TechnicalIndicatorPanel', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders without crashing', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('RSI (14)')).toBeInTheDocument();
        });
    });

    it('displays RSI status cards', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('RSI (14)')).toBeInTheDocument();
            expect(screen.getByText('MACD 柱狀')).toBeInTheDocument();
            expect(screen.getByText('MA20 趨勢')).toBeInTheDocument();
        });
    });

    it('renders RSI chart title', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('RSI 相對強弱指標')).toBeInTheDocument();
        });
    });

    it('renders MACD chart title', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('MACD 平滑異同移動平均線')).toBeInTheDocument();
        });
    });

    it('displays legend for RSI chart', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('70 (超買)')).toBeInTheDocument();
            expect(screen.getByText('30 (超賣)')).toBeInTheDocument();
        });
    });

    it('displays legend for MACD chart', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('MACD (12,26,9)')).toBeInTheDocument();
            expect(screen.getByText('Signal')).toBeInTheDocument();
            expect(screen.getByText('柱狀圖')).toBeInTheDocument();
        });
    });

    it('handles empty data gracefully', async () => {
        render(<TechnicalIndicatorPanel data={[]} />);

        await waitFor(() => {
            expect(screen.getByText('無法計算技術指標，數據不足')).toBeInTheDocument();
        });
    });
});
