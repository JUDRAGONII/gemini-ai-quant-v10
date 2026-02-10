import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TacticalPlanner from '@/components/Dashboard/TacticalPlanner';
import useSWR from 'swr';

// Mock 所有外部依賴
jest.mock('swr', () => ({
    __esModule: true,
    default: jest.fn(),
    mutate: jest.fn(),
}));

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        form: React.forwardRef(({ children, onSubmit, ...props }: any, ref: any) => (
            <form ref={ref} onSubmit={onSubmit} {...props}>{children}</form>
        )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
    Target: () => <span data-testid="icon-target" />,
    Sword: () => <span data-testid="icon-sword" />,
    Trash2: () => <span data-testid="icon-trash" />,
    Plus: () => <span data-testid="icon-plus" />,
    Calendar: () => <span data-testid="icon-calendar" />,
    Save: () => <span data-testid="icon-save" />,
    CheckCircle2: () => <span data-testid="icon-check" />,
}));

const mockUseSWR = useSWR as jest.Mock;

// 標準 mock 數據
const mockPlans = [
    {
        id: 'plan-001',
        stock_code: '2330',
        stock_name: '台積電',
        entry_price: 850,
        stop_loss: 820,
        take_profit: 920,
        reason: '技術面突破前高，法人持續買超',
        status: 'active',
    },
];

describe('TacticalPlanner — 戰術計畫器', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('基礎路徑測試', () => {

        it('TC-1301: 無計畫時應顯示 "無運行中戰術計畫" 空狀態', () => {
            mockUseSWR.mockReturnValue({ data: [], isLoading: false });
            render(<TacticalPlanner />);

            expect(screen.getByText('無運行中戰術計畫')).toBeInTheDocument();
        });

        it('TC-1302: 有計畫時應正確渲染計畫卡片', () => {
            mockUseSWR.mockReturnValue({ data: mockPlans, isLoading: false });
            render(<TacticalPlanner />);

            // 驗證股票代碼與名稱
            expect(screen.getByText('2330')).toBeInTheDocument();
            expect(screen.getByText('台積電')).toBeInTheDocument();

            // 驗證價格欄位
            expect(screen.getByText('850')).toBeInTheDocument();
            expect(screen.getByText('820')).toBeInTheDocument();
            expect(screen.getByText('920')).toBeInTheDocument();

            // 驗證理由
            expect(screen.getByText(/技術面突破前高/)).toBeInTheDocument();
        });

        it('TC-1303: 點擊 "啟動新戰術" 應顯示表單', () => {
            mockUseSWR.mockReturnValue({ data: [], isLoading: false });
            render(<TacticalPlanner />);

            // 點擊 "啟動新戰術" 按鈕
            const addButton = screen.getByText('啟動新戰術');
            fireEvent.click(addButton);

            // 驗證表單出現
            expect(screen.getByText('代碼')).toBeInTheDocument();
            expect(screen.getByText('名稱')).toBeInTheDocument();
            expect(screen.getByText('預計進場')).toBeInTheDocument();
            expect(screen.getByText('停損價')).toBeInTheDocument();
            expect(screen.getByText('停利價')).toBeInTheDocument();
            expect(screen.getByText('戰術理由')).toBeInTheDocument();
            expect(screen.getByText('寫入戰術指令庫')).toBeInTheDocument();
        });
    });

    describe('邊界條件測試', () => {

        it('TC-2301: stock_code 為空時 submit 應被 required 阻擋', () => {
            mockUseSWR.mockReturnValue({ data: [], isLoading: false });
            render(<TacticalPlanner />);

            // 打開表單
            fireEvent.click(screen.getByText('啟動新戰術'));

            // 取得 submit 按鈕並嘗試提交（stock_code input 有 required 屬性）
            const submitButton = screen.getByText('寫入戰術指令庫');
            // HTML5 required 驗證會阻止提交，但不會拋錯
            // 這裡驗證表單元素有 required 屬性
            const inputs = screen.getAllByRole('textbox');
            const codeInput = inputs[0]; // 第一個 textbox 是代碼
            expect(codeInput).toBeRequired();
        });
    });
});
