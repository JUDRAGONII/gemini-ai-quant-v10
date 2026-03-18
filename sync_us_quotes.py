import asyncio
import datetime
from backend.lib.supabase_client import get_supabase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def sync_us_quotes():
    try:
        db = get_supabase()
        
        # 取得所有活躍的 US stocks
        stocks_res = db.table('stocks').select('stock_code, stock_name').eq('market_type', 'US').eq('is_active', True).execute()
        us_stocks = {s['stock_code']: s['stock_name'] for s in stocks_res.data}
        if not us_stocks:
            logger.info("No active US stocks found.")
            return

        symbols = list(us_stocks.keys())
        
        # 取得各檔 US stocks 的最新 daily_price
        # 為效能起見，我們利用 limit 1 or distinct on 也可以，這裡簡單起見我們拉過去 7 天內最新的一筆
        seven_days_ago = (datetime.datetime.now() - datetime.timedelta(days=7)).strftime('%Y-%m-%d')
        price_res = db.table('daily_price') \
            .select('stock_code, close_price, open_price, volume') \
            .in_('stock_code', symbols) \
            .gte('trade_date', seven_days_ago) \
            .order('trade_date', desc=True) \
            .execute()
            
        latest_prices = {}
        for row in price_res.data:
            code = row['stock_code']
            if code not in latest_prices:
                # 計算漲跌幅，如果 open_price 不為 0
                open_p = row.get('open_price')
                close_p = row.get('close_price')
                change = 0
                change_percent = 0
                if open_p and close_p and open_p > 0:
                    change = close_p - open_p
                    change_percent = round((change / open_p) * 100, 2)
                    
                latest_prices[code] = {
                    "stock_code": code,
                    "name": us_stocks[code],
                    "price": close_p,
                    "change": change,
                    "change_percent": change_percent,
                    "volume": row.get('volume', 0),
                    "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "source": "daily_price_sync"
                }

        # 更新進 market_quotes
        quotes_to_upsert = list(latest_prices.values())
        if quotes_to_upsert:
            logger.info(f"Upserting {len(quotes_to_upsert)} US quotes to market_quotes...")
            # Supabase upsert
            db.table('market_quotes').upsert(quotes_to_upsert).execute()
            logger.info("✅ US quotes synchronized successfully.")
        else:
            logger.warning("No recent price data found for US stocks.")
            
    except Exception as e:
        logger.error(f"Error syncing US quotes: {e}")

if __name__ == "__main__":
    asyncio.run(sync_us_quotes())
