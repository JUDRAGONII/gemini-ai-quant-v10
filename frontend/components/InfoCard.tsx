import React from 'react';

/**
 * 宏觀指標資訊卡片組件
 * 用於展示指標的次要屬性（如更新頻率、數據來源等）
 */
interface InfoCardProps {
    icon: React.ElementType;
    label: React.ReactNode;
    value: string;
}

const InfoCard = ({ icon: Icon, label, value }: InfoCardProps) => (
    <div className="glass p-4 rounded-xl border border-white/10 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-white/5">
            <Icon size={20} className="text-gray-400" />
        </div>
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
                {label}
            </p>
            <p className="text-white font-medium">{value}</p>
        </div>
    </div>
);

export default InfoCard;
