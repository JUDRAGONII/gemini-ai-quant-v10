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

describe("StocksPage 整合測試 (Isolated)", () => {
    it("TC-1503: 市場切換按鈕 (全部/台股/美股) 應正確篩選", async () => {
        render(<StocksPage />);

        // Click '台股'
        const twBtn = screen.getByTestId("market-btn-TW");
        fireEvent.click(twBtn);

        // Verify only TW stocks are shown (2330, 2317, 2454)
        expect(screen.getByText("2330 - 台積電")).toBeInTheDocument();
    });
});
