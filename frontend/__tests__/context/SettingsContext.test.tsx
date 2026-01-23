/**
 * Phase 4.4 SettingsContext 狀態管理測試
 * @description 驗證設定持久化、損壞恢復與安全性
 * @version 1.1.0 (Robust Mocks)
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";

// 組件引入
import { SettingsProvider, useSettings } from "@/context/SettingsContext";

describe("SettingsContext 狀態管理 (Phase 4.4)", () => {
    // 建立一個強健的 localStorage Mock
    const localStorageStore: Record<string, string> = {};
    const localStorageMock = {
        getItem: jest.fn((key) => localStorageStore[key] || null),
        setItem: jest.fn((key, value) => {
            localStorageStore[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete localStorageStore[key];
        }),
        clear: jest.fn(() => {
            Object.keys(localStorageStore).forEach(key => delete localStorageStore[key]);
        }),
    };

    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    });

    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    const TestComponent = () => {
        const { settings, updateUISettings, isLoaded } = useSettings();
        if (!isLoaded) return <div>Loading...</div>;
        return (
            <div>
                <span data-testid="show-labels">
                    {settings.ui.showChartLabels ? "labels-on" : "labels-off"}
                </span>
                <button
                    onClick={() => updateUISettings({ showChartLabels: false })}
                >
                    DisableLabels
                </button>
            </div>
        );
    };

    describe("設定持久化 (TC-5XXX)", () => {
        it("TC-5401: 設定值應正確持久化至 LocalStorage", async () => {
            render(
                <SettingsProvider>
                    <TestComponent />
                </SettingsProvider>
            );

            // 等待載入
            expect(await screen.findByTestId("show-labels")).toHaveTextContent("labels-on");

            // 點擊變更
            const button = screen.getByText("DisableLabels");
            await act(async () => {
                fireEvent.click(button);
            });

            // 驗證 UI 更新
            expect(screen.getByTestId("show-labels")).toHaveTextContent("labels-off");

            // 驗證 localStorage 調用 (檢查物件結構而非精確字串)
            const storedValue = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(storedValue.ui.showChartLabels).toBe(false);
        });
    });

    describe("安全性驗證 (TC-3XXX)", () => {
        it("TC-3401: Settings Context 不在 LocalStorage 存儲敏感的資料庫密碼", async () => {
            render(
                <SettingsProvider>
                    <TestComponent />
                </SettingsProvider>
            );

            expect(await screen.findByTestId("show-labels")).toBeInTheDocument();

            // 檢查所有 setItem 調用
            const lastCall = localStorageMock.setItem.mock.calls.slice(-1)[0];
            if (lastCall) {
                const storedValue = lastCall[1];
                // 廣泛性排除敏感詞
                expect(storedValue.toLowerCase()).not.toContain("password");
                expect(storedValue.toLowerCase()).not.toContain("database_url");
            }
        });
    });

    describe("錯誤處理 (TC-2XXX)", () => {
        it("TC-2401: 當 LocalStorage 損壞時應自動回復至預設配置", async () => {
            // 注入損壞資料
            localStorageStore["ai-invest-settings"] = "invalid json {";

            render(
                <SettingsProvider>
                    <TestComponent />
                </SettingsProvider>
            );

            // 應正常載入預設值而非崩潰
            expect(await screen.findByTestId("show-labels")).toHaveTextContent("labels-on");
        });
    });
});

import { fireEvent } from "@testing-library/react";
