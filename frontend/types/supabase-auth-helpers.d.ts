// 補齊缺失的第三方模組型別宣告
// @supabase/auth-helpers-nextjs 僅在 watchlist.test.tsx 中被 import + jest.mock，
// 不需要完整型別定義，只需讓 tsc 不報 TS2307。
declare module '@supabase/auth-helpers-nextjs' {
    export function createClientComponentClient(): any;
}
