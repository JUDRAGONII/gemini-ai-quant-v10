import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertToast } from './AlertToast';
import { MarketAlert } from '@/types/alert';

export const AlertToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<MarketAlert[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((alert: MarketAlert) => {
        setToasts(prev => {
            // 避免重複
            if (prev.find(t => t.id === alert.id)) return prev;
            return [...prev, alert];
        });

        // 8 秒後自動移除
        setTimeout(() => {
            removeToast(alert.id);
        }, 8000);
    }, [removeToast]);

    useEffect(() => {
        const handleNewAlert = (event: any) => {
            addToast(event.detail);
        };

        window.addEventListener('new-market-alert', handleNewAlert);
        return () => window.removeEventListener('new-market-alert', handleNewAlert);
    }, [addToast]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                    {toasts.map(alert => (
                        <AlertToast key={alert.id} alert={alert} onClose={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
