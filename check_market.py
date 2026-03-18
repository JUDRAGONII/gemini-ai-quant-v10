import asyncio
import pandas as pd
from backend.lib.supabase_client import get_supabase

async def main():
    try:
        db = get_supabase()
        print("連線至 Supabase REST API 成功，開始查詢...\n")

        # 台股統計
        print("=== 台股市場統計 (上市、上櫃、期權) ===")
        tw_stocks = db.table('stocks').select('stock_code, market_type').in_('market_type', ['TW', 'Taifex']).execute()
        
        tw_stats = []
        for mt in ['TW', 'Taifex']:
            codes = [s['stock_code'] for s in tw_stocks.data if s['market_type'] == mt]
            total = len(codes)
            count = 0
            latest = None
            if total > 0:
                stats = db.table('daily_price').select('trade_date').in_('stock_code', codes[:100]).order('trade_date', desc=True).limit(1).execute()
                latest = stats.data[0]['trade_date'] if stats.data else 'N/A'
                countRes = db.table('daily_price').select('stock_code', count='exact').in_('stock_code', codes[:10]).execute()
                count = countRes.count * (total // 10) if countRes.count else 0 # Estimate based on sample due to API limits
            
            tw_stats.append({'market_type': mt, 'total_stocks': total, 'estimated_records': count, 'latest_sample_date': latest})
            
        print(pd.DataFrame(tw_stats).to_string(index=False))

        # 美股統
        print("\n=== 美股市場統計 ( NASDAQ、NYSE 等) ===")
        us_stocks = db.table('stocks').select('stock_code, market_type').in_('market_type', ['US']).execute()
        us_stats = []
        for mt in ['US']:
            codes = [s['stock_code'] for s in us_stocks.data if s['market_type'] == mt]
            total = len(codes)
            latest = None
            if total > 0:
                stats = db.table('daily_price').select('trade_date').in_('stock_code', codes[:100]).order('trade_date', desc=True).limit(1).execute()
                latest = stats.data[0]['trade_date'] if stats.data else 'N/A'
            us_stats.append({'market_type': mt, 'total_stocks': total, 'latest_sample_date': latest})
        
        print(pd.DataFrame(us_stats).to_string(index=False))

        # 指數代表
        print("\n=== 美股核心大盤指數/ETF (代表道瓊, S&P500, NASDAQ, 費半) ===")
        indices = ['DIA', 'SPY', 'QQQ', 'SOXX', '^DJI', '^GSPC', '^IXIC']
        idx_res = []
        for code in indices:
            stats = db.table('daily_price').select('trade_date').eq('stock_code', code).order('trade_date', desc=True).limit(1).execute()
            if stats.data:
                idx_res.append({'stock_code': code, 'latest_date': stats.data[0]['trade_date']})
        print(pd.DataFrame(idx_res).to_string(index=False))

        # 宏觀經濟
        print("\n=== 總體經濟指數統計 (台灣、美國、全球) ===")
        macro_stats = db.table('macro_indicators').select('country').execute()
        countries = [m['country'] for m in macro_stats.data]
        df_c = pd.Series(countries).value_counts().reset_index()
        df_c.columns = ['Region', 'total_records']
        df_c['Region'] = df_c['Region'].replace({'TW': '台灣', 'US': '美國', 'GLOBAL': '全球'})
        print(df_c.to_string(index=False))

        # 匯率與黃金
        print("\n=== 匯率與貴金屬 (黃金、白銀) ===")
        fx_stats = db.table('exchange_rates').select('currency_pair').execute()
        pairs = [f['currency_pair'] for f in fx_stats.data]
        df_f = pd.Series(pairs).value_counts().reset_index()
        df_f.columns = ['Currency/Metal', 'total_records']
        print(df_f.to_string(index=False))

    except Exception as e:
        print(f"查詢錯誤: {e}")

if __name__ == "__main__":
    asyncio.run(main())
