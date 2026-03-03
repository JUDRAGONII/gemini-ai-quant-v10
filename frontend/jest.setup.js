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
    ComposedChart: ({ children }) => <svg data-testid="composed-chart">{children}</svg>,
    RadarChart: ({ children }) => <svg data-testid="radar-chart">{children}</svg>,
    Radar: () => <path data-testid="radar" />,
    PolarGrid: () => <g data-testid="polar-grid" />,
    PolarAngleAxis: () => <g data-testid="polar-angle-axis" />,
    PolarRadiusAxis: () => <g data-testid="polar-radius-axis" />,
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

// 6. Mock lightweight-charts (Canvas based, not supported in JSDOM)
jest.mock('lightweight-charts', () => ({
    createChart: jest.fn(() => ({
        applyOptions: jest.fn(),
        remove: jest.fn(),
        resize: jest.fn(),
        addSeries: jest.fn(() => ({
            setData: jest.fn(),
            applyOptions: jest.fn(),
            setMarkers: jest.fn(),
        })),
        timeScale: jest.fn(() => ({
            fitContent: jest.fn(),
            subscribeVisibleTimeRangeChange: jest.fn(),
            unsubscribeVisibleTimeRangeChange: jest.fn(),
        })),
    })),
    ColorType: { Solid: 'solid' },
    CrosshairMode: { Normal: 0, Magnet: 1 },
    LineStyle: { Solid: 0 },
}), { virtual: true });

// 7. Polyfill Response/Request/Headers for JSDOM (Next.js 14 API Testing)
if (typeof global.Response === 'undefined') {
    class MockResponse {
        constructor(body, init) {
            this.body = body;
            this.status = init?.status || 200;
            this.ok = this.status >= 200 && this.status < 300;
            this.headers = new Map(Object.entries(init?.headers || {}));
        }
        async json() {
            return JSON.parse(this.body);
        }
        static json(data, init) {
            return new MockResponse(JSON.stringify(data), {
                ...init,
                headers: {
                    'Content-Type': 'application/json',
                    ...(init?.headers || {})
                }
            });
        }
    }

    class MockRequest {
        constructor(url, init) {
            this.url = url;
            this.method = init?.method || 'GET';
            this.headers = new Map(Object.entries(init?.headers || {}));
        }
    }

    class MockHeaders extends Map {
        constructor(init) {
            if (!init) {
                super();
            } else if (Array.isArray(init) || (init instanceof Map)) {
                super(init);
            } else if (typeof init === 'object') {
                super(Object.entries(init));
            } else {
                super();
            }
        }
    }

    global.Response = MockResponse;
    global.Request = MockRequest;
    global.Headers = MockHeaders;
}
