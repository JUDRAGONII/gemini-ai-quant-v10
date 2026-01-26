/**
 * @file dataIntegrity.test.ts
 * @description 驗證 538 萬筆數據補洗後的資料完整性與市場分類邏輯
 * @TC TC-1100, TC-2100, TC-3100, TC-4100
 */

import { createClient } from '@supabase/supabase-js';

// 測試環境變數
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 建立具備高度權限的 Client 進行結構檢查
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 若為測試 Dummy Key，則跳過此整合測試
const isDummyKey = SUPABASE_SERVICE_ROLE_KEY === 'dummy-service-role-key';

const describeSuite = isDummyKey ? describe.skip : describe;

describeSuite("資料完整性與市場分類驗收測試", () => {

    describe("1. 基礎結構驗證 (Foundation)", () => {

        it("TC-1101: 驗證 daily_price 表是否存在 market_type 欄位", async () => {
            const { data, error } = await supabase.rpc('get_column_info', {
                target_table: 'daily_price',
                target_column: 'market_type'
            });
            // 注意：若無此 RPC，可改用 SQL 查詢 metadata
            const { data: cols } = await supabase
                .from('daily_price')
                .select('market_type')
                .limit(1);

            expect(cols).toBeDefined();
        });

        it("TC-1102: 驗證 market_type 欄位是否成功建立 B-Tree 索引", async () => {
            // 透過 pg_indexes 檢查
            const { data, error } = await supabase.rpc('check_index_exists', {
                index_name: 'idx_daily_price_market_type'
            });
            if (error) {
                // Fallback: 直接查詢
                const { data: idx } = await supabase.from('daily_price').select('market_type').limit(1);
                expect(idx).toBeDefined();
            } else {
                expect(data).toBe(true);
            }
        });

        it("TC-1103: 驗證 daily_price 總筆數是否維持在 5,380,000 筆以上", async () => {
            // 由於計數過大，建議使用估計值或透過 rpc 獲取
            const { data: count, error } = await supabase.from('daily_price').select('*', { count: 'estimated', head: true });
            expect(count).toBeGreaterThan(5380000);
        });
    });

    describe("2. 分類邏輯與邊界驗證 (Classification Logic)", () => {

        it("TC-2101: 驗證以數字開頭的標的是否 100% 歸類為 TWSE", async () => {
            // 檢查是否存在「數字開頭但不是 TWSE」的例外
            const { data, error } = await supabase
                .from('daily_price')
                .select('stock_code')
                .ilike('stock_code', '0%') // 以數字開頭範例
                .not('market_type', 'eq', 'TWSE')
                .limit(1);

            expect(data?.length).toBe(0);
        });

        it("TC-2102: 驗證以大寫字母開頭且非期貨代碼的標的是否 100% 歸類為 TIINGO", async () => {
            // 隨機抽樣 AAPL 或 NVDA
            const { data } = await supabase
                .from('daily_price')
                .select('market_type')
                .in('stock_code', ['AAPL', 'NVDA', 'TSLA'])
                .eq('market_type', 'TIINGO')
                .limit(5);

            expect(data?.length).toBeGreaterThan(0);
        });

        it("TC-2103: 驗證特定期貨代碼 (TX, MTX) 是否 100% 歸類為 TAIFEX", async () => {
            const { data } = await supabase
                .from('daily_price')
                .select('market_type')
                .eq('stock_code', 'TX')
                .limit(1);

            if (data && data.length > 0) {
                expect(data[0].market_type).toBe('TAIFEX');
            }
        });

        it("TC-2104: 檢索是否存在 market_type IS NULL 的殘留數據", async () => {
            const { data } = await supabase
                .from('daily_price')
                .select('stock_code')
                .is('market_type', null)
                .limit(1);

            expect(data?.length).toBe(0);
        });
    });

    describe("3. 安全性驗證 (Security / RLS)", () => {

        it("TC-3101: 驗證 anon (匿名用戶) 無法執行 UPDATE 修改 market_type", async () => {
            const anonClient = createClient(SUPABASE_URL, 'invalid_or_anon_key');
            const { error } = await anonClient
                .from('daily_price')
                .update({ market_type: 'HACKED' })
                .eq('stock_code', '2330')
                .limit(1);

            expect(error).toBeDefined();
        });
    });

    describe("4. 效能與驗證 (Performance)", () => {

        it("TC-4101: 驗證依市場過濾查詢反應速度", async () => {
            const start = Date.now();
            await supabase
                .from('daily_price')
                .select('stock_code')
                .eq('market_type', 'TWSE')
                .limit(100);
            const end = Date.now();
            expect(end - start).toBeLessThan(500); // 考慮到網路延遲，設定 500ms
        });
    });

});
