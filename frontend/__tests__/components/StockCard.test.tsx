import { render, screen, fireEvent } from "@testing-library/react";
import StockCard from "@/components/StockCard";
import "@testing-library/jest-dom";

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  TrendingUp: () => <div data-testid="icon-trending-up" />,
  TrendingDown: () => <div data-testid="icon-trending-down" />,
}));

// Mock Recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  YAxis: () => <div />,
}));

describe("StockCard 組件", () => {
  const mockProps = {
    symbol: "2330",
    name: "台積電",
    price: 580,
    changePercent: 1.5,
    volume: 1000,
    sparklineData: [570, 575, 580],
  };

  it("TC-1101: StockCard 應正確渲染股票代碼與名稱", () => {
    render(<StockCard {...mockProps} />);
    expect(screen.getByText("2330")).toBeInTheDocument();
    expect(screen.getByText("台積電")).toBeInTheDocument();
  });

  it("TC-1102: StockCard 應根據正數 changePercent 顯示綠色", () => {
    render(<StockCard {...mockProps} changePercent={1.5} />);
    const changeText = screen.getByText("+1.50%");
    expect(changeText).toHaveClass("text-emerald-400");
  });

  it("TC-1103: StockCard 應根據負數 changePercent 顯示紅色", () => {
    render(<StockCard {...mockProps} changePercent={-1.5} />);
    const changeText = screen.getByText("-1.50%");
    expect(changeText).toHaveClass("text-rose-400");
  });

  it("TC-1104: StockCard 應正確渲染迷你走勢圖 (sparklineData)", () => {
    render(<StockCard {...mockProps} />);
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });

  it("TC-1105: StockCard 點擊應導航至 /stocks/[symbol]", () => {
    render(<StockCard {...mockProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/stocks/2330");
  });

  it("TC-2101: StockCard 應處理 changePercent = 0 的情況 (顯示灰色)", () => {
    render(<StockCard {...mockProps} changePercent={0} />);
    const changeText = screen.getByText("0.00%");
    expect(changeText).toHaveClass("text-gray-400");
  });

  it("TC-2102: StockCard 應處理空的 sparklineData", () => {
    render(<StockCard {...mockProps} sparklineData={[]} />);
    expect(screen.getByText("暫無趨勢數據")).toBeInTheDocument();
  });

  it("TC-3201: StockCard Link 應使用正確的 href 格式", () => {
    render(<StockCard {...mockProps} symbol="AAPL" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/stocks/AAPL");
  });
});
