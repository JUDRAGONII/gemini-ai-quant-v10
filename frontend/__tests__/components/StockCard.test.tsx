import { render, screen, fireEvent } from "@testing-library/react";
import StockCard from "@/components/StockCard";
import "@testing-library/jest-dom";

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  TrendingUp: () => <div data-testid="icon-trending-up" />,
  TrendingDown: () => <div data-testid="icon-trending-down" />,
  Minus: () => <div data-testid="icon-minus" />,
}));

// Mock Recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <svg data-testid="area-chart">{children}</svg>,
  Area: () => <g data-testid="area" />,
}));

describe("StockCard 組件", () => {
  const mockProps = {
    symbol: "2330",
    name: "台積電",
    price: 580,
    changePercent: 1.5,
    sparklineData: [{ value: 570 }, { value: 575 }, { value: 580 }],
  };

  it("TC-1101: StockCard 應正確渲染股票代碼與名稱", () => {
    render(<StockCard {...mockProps} />);
    expect(screen.getByText("2330")).toBeInTheDocument();
    expect(screen.getByText("台積電")).toBeInTheDocument();
  });

  it("TC-1102: StockCard 應正確渲染現價與漲跌幅", () => {
    render(<StockCard {...mockProps} />);
    expect(screen.getByText("580")).toBeInTheDocument(); // local format for TW might differ, but 580 should be there
    expect(screen.getByText("+1.50%")).toBeInTheDocument();
  });

  it("TC-1104: StockCard 應正確渲染迷你走勢圖", () => {
    render(<StockCard {...mockProps} />);
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });

  it("TC-1105: StockCard 應導航至詳情頁", () => {
    render(<StockCard {...mockProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/stocks/2330");
  });

  it("TC-2101: StockCard 應處理漲跌幅為 0 的情況", () => {
    render(<StockCard {...mockProps} changePercent={0} />);
    expect(screen.getByText("0.00%")).toBeInTheDocument();
    expect(screen.getByTestId("icon-minus")).toBeInTheDocument();
  });

  it("TC-2102: StockCard 應處理空的 sparklineData", () => {
    render(<StockCard {...mockProps} sparklineData={[]} />);
    expect(screen.getByTestId("empty-sparkline")).toBeInTheDocument();
  });
});
