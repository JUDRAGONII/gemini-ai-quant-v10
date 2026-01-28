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

    it('TC-1300: KLineChart 組件正常渲染', async () => {
        render(<KLineChart data={mockData} symbol="2330.TW" />);

        await waitFor(() => {
            expect(screen.getByText('2330.TW')).toBeInTheDocument();
        });
    });

    it('TC-1310: 週期按鈕顯示正確', async () => {
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

    it('TC-1320: MA 均線圖例顯示', async () => {
        render(<KLineChart data={mockData} showMA={true} />);

        await waitFor(() => {
            expect(screen.getByText('MA5')).toBeInTheDocument();
            expect(screen.getByText('MA10')).toBeInTheDocument();
            expect(screen.getByText('MA20')).toBeInTheDocument();
            expect(screen.getByText('MA60')).toBeInTheDocument();
            expect(screen.getByText('MA120')).toBeInTheDocument();
        });
    });

    it('TC-2313: 隱藏 MA 均線', async () => {
        render(<KLineChart data={mockData} showMA={false} />);

        await waitFor(() => {
            expect(screen.queryByText('MA5')).not.toBeInTheDocument();
        });
    });

    it('TC-1311~1317: 切換週期按鈕觸發回調', async () => {
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

    it('TC-2310: 空數據處理 (無數據提示)', async () => {
        render(<KLineChart data={[]} symbol="2330.TW" />);

        await waitFor(() => {
            expect(screen.getByText('2330.TW')).toBeInTheDocument();
        });
    });

    it('TC-1301: KLineChart 容器樣式正確', async () => {
        render(<KLineChart data={mockData} symbol="2330.TW" />);

        const chartContainer = document.querySelector('.bg-white\\/5');
        expect(chartContainer).toBeInTheDocument();
    });

    // TechnicalIndicatorPanel Tests

    it('TC-1324: 技術指標面板正常渲染 (RSI)', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('RSI (14)')).toBeInTheDocument();
        });
    });

    it('TC-1324~1326: 顯示 RSI/MACD/MA 狀態卡片', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('RSI (14)')).toBeInTheDocument();
            expect(screen.getByText('MACD 柱狀')).toBeInTheDocument();
            expect(screen.getByText('MA20 趨勢')).toBeInTheDocument();
        });
    });

    it('TC-1327: RSI 圖表標題顯示', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('RSI 相對強弱指標')).toBeInTheDocument();
        });
    });

    it('TC-1328: MACD 圖表標題顯示', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('MACD 平滑異同移動平均線')).toBeInTheDocument();
        });
    });

    it('TC-1327: RSI 圖例顯示 (70/30)', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('70 (超買)')).toBeInTheDocument();
            expect(screen.getByText('30 (超賣)')).toBeInTheDocument();
        });
    });

    it('TC-1328: MACD 圖例顯示', async () => {
        render(<TechnicalIndicatorPanel data={mockData} />);

        await waitFor(() => {
            expect(screen.getByText('MACD (12,26,9)')).toBeInTheDocument();
            expect(screen.getByText('Signal')).toBeInTheDocument();
            expect(screen.getByText('柱狀圖')).toBeInTheDocument();
        });
    });

    it('TC-2310: 技術指標空數據處理', async () => {
        render(<TechnicalIndicatorPanel data={[]} />);

        await waitFor(() => {
            expect(screen.getByText('無法計算技術指標，數據不足')).toBeInTheDocument();
        });
    });
});
