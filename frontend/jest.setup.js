import '@testing-library/jest-dom'
const React = require('react');

// 1. Mock next/navigation 全域導航
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/'),
    useParams: jest.fn(() => ({})),
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => {
        const params = new URLSearchParams();
        return {
            get: (key) => params.get(key),
            getAll: (key) => params.getAll(key),
            has: (key) => params.has(key),
            forEach: (callback) => params.forEach(callback),
            entries: () => params.entries(),
            keys: () => params.keys(),
            values: () => params.values(),
            toString: () => params.toString(),
            [Symbol.iterator]: () => params[Symbol.iterator](),
        };
    },
}));

// 2. Mock lucide-react 全域圖標 (使用 Proxy 自動生成並快取組件)
jest.mock('lucide-react', () => {
    const iconCache = {};
    return new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === 'string' && /^[A-Z]/.test(prop)) {
                if (!iconCache[prop]) {
                    const IconComponent = (props) => {
                        return React.createElement('svg', {
                            ...props,
                            'data-testid': `icon-${prop.toLowerCase()}`
                        });
                    };
                    IconComponent.displayName = prop;
                    iconCache[prop] = IconComponent;
                }
                return iconCache[prop];
            }
            return undefined;
        }
    });
});

// 3. Mock Recharts (JSDOM 不支援 SVG 測量，需 Mock)
jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children }) => <svg data-testid="area-chart">{children}</svg>,
    Area: () => <path data-testid="chart-area" />,
    BarChart: ({ children }) => <svg data-testid="bar-chart">{children}</svg>,
    Bar: () => <rect data-testid="chart-bar" />,
    LineChart: ({ children }) => <svg data-testid="line-chart">{children}</svg>,
    Line: () => <path data-testid="chart-line" />,
    PieChart: ({ children }) => <svg data-testid="pie-chart">{children}</svg>,
    Pie: () => <circle data-testid="chart-pie" />,
    Cell: () => <path />,
    XAxis: () => <g />,
    YAxis: () => <g />,
    CartesianGrid: () => <g />,
    Tooltip: () => <div />,
    Legend: () => <div />,
    ReferenceLine: () => <line />,
    Defs: ({ children }) => <defs>{children}</defs>,
    LinearGradient: ({ children }) => <linearGradient>{children}</linearGradient>,
    Stop: () => <stop />,
}));

// 4. ResizeObserver Polyfill (Recharts 依賴)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// 5. 全域環境變數注入
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy-service-role-key';
