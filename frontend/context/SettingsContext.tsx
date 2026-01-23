"use client";

/**
 * SettingsContext - 全域設定管理
 * @description 管理 UI 偏好、API 設置等全域設定，支援 LocalStorage 持久化
 * @version 1.0.0 (Phase 4.4 Pro Max)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// 設定類型定義
interface AppSettings {
    /** UI 偏好 */
    ui: {
        /** 是否顯示圖表數值標籤 */
        showChartLabels: boolean;
        /** 是否啟用動畫效果 */
        enableAnimations: boolean;
        /** 是否使用緊湊模式 */
        compactMode: boolean;
    };
    /** 數據更新頻率 (分鐘) */
    refreshInterval: number;
    /** 上次更新時間 */
    lastUpdated: string;
}

// 預設設定
const defaultSettings: AppSettings = {
    ui: {
        showChartLabels: true,
        enableAnimations: true,
        compactMode: false,
    },
    refreshInterval: 5,
    lastUpdated: new Date().toISOString(),
};

// Context 類型
interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (updates: Partial<AppSettings>) => void;
    updateUISettings: (updates: Partial<AppSettings["ui"]>) => void;
    resetSettings: () => void;
    isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "ai-quant-settings";

/**
 * 設定 Provider 組件
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    // 從 LocalStorage 載入設定
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as AppSettings;
                // 合併預設值以防止舊版本缺少新欄位
                setSettings({
                    ...defaultSettings,
                    ...parsed,
                    ui: { ...defaultSettings.ui, ...parsed.ui },
                });
            }
        } catch (error) {
            console.warn("[SettingsContext] 載入設定失敗，使用預設值:", error);
            setSettings(defaultSettings);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // 監聽其他分頁的設定變更
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue) as AppSettings;
                    setSettings(parsed);
                } catch (error) {
                    console.warn("[SettingsContext] 同步設定失敗:", error);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // 儲存設定至 LocalStorage
    const persistSettings = useCallback((newSettings: AppSettings) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error("[SettingsContext] 儲存設定失敗:", error);
        }
    }, []);

    // 更新設定
    const updateSettings = useCallback((updates: Partial<AppSettings>) => {
        setSettings((prev) => {
            const newSettings = {
                ...prev,
                ...updates,
                lastUpdated: new Date().toISOString(),
            };
            persistSettings(newSettings);
            return newSettings;
        });
    }, [persistSettings]);

    // 更新 UI 設定
    const updateUISettings = useCallback((updates: Partial<AppSettings["ui"]>) => {
        setSettings((prev) => {
            const newSettings = {
                ...prev,
                ui: { ...prev.ui, ...updates },
                lastUpdated: new Date().toISOString(),
            };
            persistSettings(newSettings);
            return newSettings;
        });
    }, [persistSettings]);

    // 重置設定
    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
        persistSettings(defaultSettings);
    }, [persistSettings]);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSettings,
                updateUISettings,
                resetSettings,
                isLoaded,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

/**
 * 使用設定的 Hook
 */
export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings 必須在 SettingsProvider 內使用");
    }
    return context;
}

export default SettingsContext;
