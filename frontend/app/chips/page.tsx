import Link from 'next/link';
import { ArrowLeft, Cpu, Share2, Layers, DollarSign, TrendingUp, BarChart } from 'lucide-react';
import ChipChart from '@/components/ChipChart';
import { MOCK_CHIPS_DATA } from '@/data/mockChips';

export default function ChipsPage() {
    // Calculate simple stats from mock data
    const lastDay = MOCK_CHIPS_DATA[MOCK_CHIPS_DATA.length - 1];
    const prevDay = MOCK_CHIPS_DATA[MOCK_CHIPS_DATA.length - 2];
    const foreignChange = lastDay.foreign_investors;
    const trustChange = lastDay.investment_trust;

    return (
        <div className="min-h-screen bg-black text-gray-100 selection:bg-cyan-500/30 pb-20">
            {/* Nav */}
            <nav className="glass sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                        <ArrowLeft size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <span className="text-cyan-400 font-bold tracking-wider">CHIPS ANALYSIS</span>
                        <div className="w-px h-4 bg-gray-700 mx-2"></div>
                        <span className="text-xs text-gray-500">MOCK DATA MODE</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 mt-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent flex items-center space-x-3 mb-2">
                        <Layers size={32} className="text-pink-500" />
                        <span>主力籌碼透視</span>
                    </h1>
                    <p className="text-gray-400">追蹤外資、投信與主力大戶的資金流向，掌握市場多空力道。</p>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        label="外資買賣超 (Foreign)"
                        value={foreignChange}
                        icon={<DollarSign />}
                        color="text-cyan-400"
                    />
                    <StatCard
                        label="投信買賣超 (Trust)"
                        value={trustChange}
                        icon={<TrendingUp />}
                        color="text-pink-400"
                    />
                    <StatCard
                        label="融資餘額 (Margin)"
                        value={lastDay.margin_balance}
                        icon={<Layers />}
                        color="text-yellow-400"
                    />
                    <StatCard
                        label="收盤價 (Close)"
                        value={lastDay.price}
                        icon={<BarChart />}
                        color="text-emerald-400"
                        isPrice
                    />
                </div>

                {/* Main Chart Section */}
                <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                        <BarChart className="text-pink-500" />
                        <span>法人動向 vs 股價趨勢</span>
                    </h2>

                    <ChipChart data={MOCK_CHIPS_DATA} />

                    <div className="mt-6 flex justify-center space-x-8 text-sm">
                        <LegendItem color="bg-cyan-500" label="外資買盤" />
                        <LegendItem color="bg-pink-500" label="投信佈局" />
                        <LegendItem color="bg-yellow-500" label="股價走勢" />
                    </div>
                </div>

                {/* Data Warning */}
                <div className="mt-8 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-yellow-500/80 text-sm text-center">
                    ⚠️ 此頁面目前使用模擬數據 (Mock Data) 進行展示，待 Phase 2 Crawler 擴充後接入真實資料。
                </div>

            </main>
        </div>
    );
}

// --- Local Components ---

function StatCard({ label, value, icon, color, isPrice = false }: any) {
    const isPositive = value > 0;
    const sign = isPositive && !isPrice ? '+' : '';
    const displayValue = isPrice ? value.toFixed(1) : `${sign}${value.toLocaleString()}`;
    const valueColor = isPrice ? 'text-white' : (isPositive ? 'text-red-400' : 'text-green-400'); // TW Stock Color

    return (
        <div className="glass p-5 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-2xl font-bold font-mono ${valueColor}`}>{displayValue}</p>
            </div>
            <div className={`p-3 rounded-full bg-white/5 ${color}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${color}`}></span>
            <span className="text-gray-400">{label}</span>
        </div>
    );
}
