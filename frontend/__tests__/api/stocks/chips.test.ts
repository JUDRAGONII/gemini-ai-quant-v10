// @ts-nocheck
import { GET } from '@/app/api/stocks/[symbol]/chips/route';

// Polyfill Response for JSDOM environment
if (!global.Response) {
    global.Response = class Response {
        constructor(body: any, init?: any) {
            this.body = body;
            this.status = init?.status || 200;
            this.headers = new Map();
        }
        async json() { return typeof (this as any).body === 'string' ? JSON.parse((this as any).body) : (this as any).body; }
    } as any;
}

// Mock next/server
jest.mock('next/server', () => ({
    NextResponse: {
        json: (body: any, init?: any) => ({
            json: async () => body,
            status: init?.status || 200,
        }),
    },
    NextRequest: class NextRequest {
        constructor(url: string) {
            this.url = url;
        }
    }
}));

// Mock Supabase
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

const mockChain = {
    select: mockSelect,
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
};

mockSelect.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);
mockOrder.mockReturnValue(mockChain);

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => mockChain),
    },
}));

describe('Chips API Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if symbol is missing', async () => {
        // Since we explicitly define params in the function signature, Next.js handles routing.
        // But our function checks if symbol is valid inside? Actually the Route Handler signature enforces params.
        // However, let's test the logical flow if we pass empty symbol manually.
        const req = { url: 'http://localhost/api/stocks//chips' } as any;
        const res = await GET(req, { params: { symbol: '' } });
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toBe('Symbol is required');
    });

    it('should aggregate data correctly', async () => {
        const symbol = '2330';
        const req = { url: `http://localhost/api/stocks/${symbol}/chips` } as any;

        // Mock Daily Price Data
        const mockPrices = [
            { trade_date: '2024-01-02', close_price: 600 },
            { trade_date: '2024-01-01', close_price: 590 },
        ];

        // Mock Institutional Investors Data (Unit: Shares)
        const mockChips = [
            {
                trade_date: '2024-01-02',
                foreign_inv_net_buy_sell: 2000000, // 2000 Lots
                investment_trust_net_buy_sell: -100000, // -100 Lots
                dealer_net_buy_sell: 50000 // 50 Lots
            },
            // 2024-01-01 has no chips data (simulate null)
        ];

        // Ensure Promise.all order: 1. Daily Price, 2. Chips
        // We use mockLimit to return different values based on call order or inspection
        // Since execution is parallel, we can't rely on call order easily with a single mock object unless we are careful.
        // But `from` is called twice. We can mock `from` implementation to return specific chains based on table name.

        const fromSpy = require('@/lib/supabase').supabase.from;
        fromSpy.mockImplementation((table: string) => {
            if (table === 'daily_price') {
                return {
                    ...mockChain,
                    limit: jest.fn().mockResolvedValue({ data: mockPrices, error: null })
                };
            }
            if (table === 'institutional_investors') {
                return {
                    ...mockChain,
                    limit: jest.fn().mockResolvedValue({ data: mockChips, error: null })
                };
            }
            return mockChain;
        });

        const res = await GET(req, { params: { symbol } });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.symbol).toBe(symbol);
        expect(json.data).toHaveLength(2);

        // Check 2024-01-02 (Has Chips)
        // Time sort: 2024-01-01 comes first (index 0), 2024-01-02 comes second (index 1)
        const data0102 = json.data[1];
        expect(data0102.date).toBe('2024-01-02');
        expect(data0102.price).toBe(600);
        expect(data0102.foreign_inv).toBe(2000); // 2000000 / 1000
        expect(data0102.investment_trust).toBe(-100);
        expect(data0102.dealer).toBe(50);
        expect(data0102.total).toBe(1950);

        // Check 2024-01-01 (No Chips -> 0)
        const data0101 = json.data[0];
        expect(data0101.date).toBe('2024-01-01');
        expect(data0101.foreign_inv).toBe(0);
        expect(data0101.total).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
        const fromSpy = require('@/lib/supabase').supabase.from;
        fromSpy.mockImplementation(() => ({
            ...mockChain,
            limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
        }));

        const req = { url: 'http://localhost/api/stocks/2330/chips' } as any;
        const res = await GET(req, { params: { symbol: '2330' } });
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.error).toBe('Internal Server Error');
    });
});
