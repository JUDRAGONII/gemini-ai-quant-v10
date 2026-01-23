import { render, screen } from "@testing-library/react";
import ScoreRadarChart from "@/components/ScoreRadarChart";
import "@testing-library/jest-dom";

// Mock Recharts
jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    RadarChart: ({ children }: any) => <svg data-testid="radar-chart">{children}</svg>,
    PolarGrid: () => <g />,
    PolarAngleAxis: () => <g />,
    PolarRadiusAxis: () => <g />,
    Radar: () => <g />,
    Legend: () => <div />,
    Tooltip: () => <div />,
}));

describe("ScoreRadarChart 組件", () => {
    const mockData = [
        { dimension: "價值", score: 80, fullMark: 100 },
        { dimension: "成長", score: 70, fullMark: 100 },
        { dimension: "動能", score: 60, fullMark: 100 },
        { dimension: "品質", score: 90, fullMark: 100 },
        { dimension: "籌碼", score: 50, fullMark: 100 },
    ];

    it("TC-1301: ScoreRadarChart 應正確渲染五維度雷達圖", () => {
        render(<ScoreRadarChart data={mockData} symbol="TEST" />);
        expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
        expect(screen.getByText("AI 多維評分")).toBeInTheDocument();
    });

    it("TC-1302: ScoreRadarChart 應計算並顯示平均評分", () => {
        render(<ScoreRadarChart data={mockData} symbol="TEST" />);
        // Average: (80+70+60+90+50)/5 = 70
        expect(screen.getByText("70 分")).toBeInTheDocument();
    });

    it("TC-1303: ScoreRadarChart 評級 (A+/A/B/C/D) 應根據分數正確顯示", () => {
        // 70 should be A
        const { rerender } = render(<ScoreRadarChart data={mockData} symbol="TEST" />);
        expect(screen.getByText("A")).toBeInTheDocument();

        // Test A+ (80+)
        const dataAPlus = mockData.map(d => ({ ...d, score: 85 }));
        rerender(<ScoreRadarChart data={dataAPlus} symbol="TEST" />);
        expect(screen.getByText("A+")).toBeInTheDocument();

        // Test B (60-70)
        const dataB = mockData.map(d => ({ ...d, score: 65 }));
        rerender(<ScoreRadarChart data={dataB} symbol="TEST" />);
        expect(screen.getByText("B")).toBeInTheDocument();
    });

    it("TC-2104: ScoreRadarChart 應處理分數為 0 的維度", () => {
        const zeroData = mockData.map(d => ({ ...d, score: 0 }));
        render(<ScoreRadarChart data={zeroData} symbol="TEST" />);
        expect(screen.getByText("0 分")).toBeInTheDocument();
        expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
    });
});
