import os
import sys
sys.path.append('backend')
from lib.supabase_client import get_supabase

def verify_technical_indicators():
    sb = get_supabase()
    # 挑選幾個熱門標的進行驗證，避免全表掃描
    test_stocks = ['2330', '2317', 'AAPL', 'NVDA']
    print(f"{'Indicator View':<35} | {'Stock':<6} | {'Sample Data'}")
    print("-" * 80)
    
    views = [
        'v_stock_ma',
        'v_stock_rsi',
        'v_stock_macd',
        'v_stock_bollinger_bands',
        'v_stock_technical_indicators'
    ]
    
    for view in views:
        for stock in test_stocks:
            try:
                res = sb.table(view).select('*').eq('stock_code', stock).limit(1).execute()
                sample = "No Data"
                if res.data:
                    first = res.data[0]
                    if view == 'v_stock_ma':
                        sample = f"ma5={first.get('ma5'):.2f}, ma20={first.get('ma20'):.2f}"
                    elif view == 'v_stock_rsi':
                        sample = f"rsi_14={first.get('rsi_14'):.2f}"
                    elif view == 'v_stock_macd':
                        sample = f"macd={first.get('macd_line'):.2f}, signal={first.get('signal_line'):.2f}"
                    elif view == 'v_stock_bollinger_bands':
                        sample = f"upper={first.get('bb_upper'):.2f}, lower={first.get('bb_lower'):.2f}"
                    elif view == 'v_stock_technical_indicators':
                        sample = f"RSI={first.get('rsi_14'):.2f}, MACD={first.get('macd_line'):.2f}"
                
                print(f"{view:<35} | {stock:<6} | {sample}")
            except Exception as e:
                print(f"{view:<35} | {stock:<6} | Failed ({str(e)[:50]}...)")

if __name__ == "__main__":
    verify_technical_indicators()
