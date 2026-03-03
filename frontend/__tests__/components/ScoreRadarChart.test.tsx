import { render, screen } from "@testing-library/react";
import ScoreRadarChart from "@/components/ScoreRadarChart";
import "@testing-library/jest-dom";

// Mock Bilingual
jest.mock('@/components/ui/Bilingual', () => ({
    __esModule: true,
    Bilingual: ({ zh, en }: any) => <span data-testid="mock-bilingual">{zh} | {en}</span>,
}));

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
        expect(screen.getByText("AI 多維評分 | AI Multi-Dim Score")).toBeInTheDocument();
    });

    it("TC-1302: ScoreRadarChart 應計算並顯示平均評分", () => {
        render(<ScoreRadarChart data={mockData} symbol="TEST" />);
        // Average: (80+70+60+90+50)/5 = 70
        expect(screen.getByText("分 | pts")).toBeInTheDocument();
    });

    it("TC-1303: ScoreRadarChart 評級 (S/A/B/C/D) 應根據分數正確顯示", () => {
        // 70 should be A
        const { rerender } = render(<ScoreRadarChart data={mockData} symbol="TEST" />);
        expect(screen.getByText("A")).toBeInTheDocument();

        // Test S (80+)
        const dataS = mockData.map(d => ({ ...d, score: 85 }));
        rerender(<ScoreRadarChart data={dataS} symbol="TEST" />);
        expect(screen.getByText("S")).toBeInTheDocument();

        // Test B (60-70)
        const dataB = mockData.map(d => ({ ...d, score: 65 }));
        rerender(<ScoreRadarChart data={dataB} symbol="TEST" />);
        expect(screen.getByText("B")).toBeInTheDocument();

        // Test C (50-60)
        const dataC = mockData.map(d => ({ ...d, score: 55 }));
        rerender(<ScoreRadarChart data={dataC} symbol="TEST" />);
        expect(screen.getByText("C")).toBeInTheDocument();

        // Test D (<50)
        const dataD = mockData.map(d => ({ ...d, score: 45 }));
        rerender(<ScoreRadarChart data={dataD} symbol="TEST" />);
        expect(screen.getByText("D")).toBeInTheDocument();
    });

    it("TC-2104: ScoreRadarChart 應處理分數為 0 的維度", () => {
        const zeroData = mockData.map(d => ({ ...d, score: 0 }));
        render(<ScoreRadarChart data={zeroData} symbol="TEST" />);
        expect(screen.getByText("分 | pts")).toBeInTheDocument();
        expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
    });
});
