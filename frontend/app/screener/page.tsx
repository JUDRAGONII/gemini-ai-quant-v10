import { ScreenerView } from '@/components/Screener';

export const metadata = {
    title: 'AI 智能選股引擎 | AI Quant V10',
    description: '多維度交叉核驗選股系統，整合 AI 預測、技術指標與即時行情。',
};

export default function ScreenerPage() {
    return (
        <main className="h-[calc(100vh-64px)] w-full">
            <ScreenerView />
        </main>
    );
}
