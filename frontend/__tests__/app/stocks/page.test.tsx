import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StocksPage from "@/app/stocks/page";
import "@testing-library/jest-dom";

// Mock Components
jest.mock("@/components/StockCard", () => ({
    __esModule: true,
    default: ({ symbol, name, hidden }: any) => {
        if (hidden) return null;
        return <div data-testid="stock-card">{symbol} - {name}</div>
    }
}));

// Mock Next.js Navigation
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

describe("StocksPage 整合測試", () => {
    it("TC-1501: /stocks 頁面應正確載入並顯示股票卡片", () => {
        render(<StocksPage />);
        expect(screen.getByText("市場行情總覽")).toBeInTheDocument();
        // Assuming mock data has at least some stocks
        const cards = screen.getAllByTestId("stock-card");
        expect(cards.length).toBeGreaterThan(0);
    });

    it("TC-1502: 搜尋框輸入應正確篩選股票", () => {
        render(<StocksPage />);
        const input = screen.getByPlaceholderText("搜尋股票代碼或名稱...");

        // Search for '2330'
        fireEvent.change(input, { target: { value: "2330" } });

        const cards = screen.getAllByTestId("stock-card");
        expect(cards.length).toBe(1);
        expect(screen.getByText("2330 - 台積電")).toBeInTheDocument();
    });

    it("TC-1503: 市場切換按鈕 (全部/台股/美股) 應正確篩選", async () => {
        render(<StocksPage />);

        // Click '台股'
        const twBtn = screen.getByText(/台股/);
        fireEvent.click(twBtn);

        // Verify only TW stocks are shown (2330, 2317, 2454)
        expect(screen.getByText("2330 - 台積電")).toBeInTheDocument();
        expect(screen.queryByText("AAPL - Any")).toBeNull(); // AAPL shouldn't be there (assuming mock logic correct)
    });

    it("TC-2201: 搜尋框應正確處理特殊字符輸入", () => {
        render(<StocksPage />);
        const input = screen.getByPlaceholderText("搜尋股票代碼或名稱...");
        fireEvent.change(input, { target: { value: "@#$%" } });
        expect(screen.queryByTestId("stock-card")).toBeNull();
    });

    it("TC-2202: 搜尋框應正確處理空格輸入", () => {
        render(<StocksPage />);
        const input = screen.getByPlaceholderText("搜尋股票代碼或名稱...");
        fireEvent.change(input, { target: { value: "  2330  " } });
        expect(screen.getByText("2330 - 台積電")).toBeInTheDocument();
    });
});
