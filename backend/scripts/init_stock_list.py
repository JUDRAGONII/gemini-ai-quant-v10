import os
import sys
import logging
import requests
import pandas as pd

# 閮剖? Python 頝臬?
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.lib.supabase_client import get_supabase
from backend.etl.tw_official import TwseFetcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_otc_stocks():
    """敺?TPEx ??銝?璅?皜"""
    url = "https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_quotes_result.php?l=zh-tw&o=json"
    try:
        logger.info(f"甇?敺?TPEx ??銝?皜: {url}")
        resp = requests.get(url, timeout=10)
        data = resp.json()
        if 'aaData' not in data:
            return []
        
        records = []
        for row in data['aaData']:
            # row[0]: 隞??, row[1]: ?迂
            symbol = row[0].strip()
            name = row[1].strip()
            if len(symbol) in [4, 5, 6]:
                records.append({
                    "stock_code": symbol,
                    "stock_name": name,
                    "market_type": "TW",
                    "priority": 2, # 銝??身?芸?摨?
                    "is_active": True
                })
        return records
    except Exception as e:
        logger.error(f"?? OTC 憭望?: {e}")
        return []

def get_us_constituents():
    """摰儔蝢?之?????""
    constituents = {
        "DJI": ["GS", "CAT", "MSFT", "HD", "AXP", "UNH", "SHW", "AMGN", "V", "MCD", "JPM", "IBM", "TRV", "BA", "AAPL", "AMZN", "CRM", "HON", "JNJ", "NVDA", "CVX", "MMM", "PG", "WMT", "DIS", "MRK", "CSCO", "KO", "NKE", "VZ"],
        "SOX": ["AMD", "ALGM", "AMKR", "ADI", "AMAT", "ASML", "ACLS", "AVGO", "COHR", "ENTG", "GFS", "INTC", "KLAC", "LRCX", "LSCC", "MRVL", "MCHP", "MU", "MPWR", "NVDA", "NXPI", "ON", "QRVO", "QCOM", "RMBS", "SWKS", "TSM", "TER", "TXN", "WOLF"],
        "Nasdaq100": ["NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "GOOG", "META", "AVGO", "TSLA", "ASML", "MU", "COST", "AMD", "PLTR", "NFLX", "CSCO", "AZN", "LRCX", "AMAT", "INTC", "LIN", "TMUS", "KLAC", "PEP", "ISRG", "AMGN", "SHOP", "APP", "TXN", "GILD", "QCOM", "BKNG", "INTU", "PDD", "ADI", "HON", "PANW", "ADBE", "ARM", "VRTX", "CRWD", "SBUX", "MELI", "CMCSA", "CEG", "ADP", "SNPS", "DASH", "CDNS", "MAR", "ORLY", "ABNB", "MNST", "REGN", "CTAS", "MDLZ", "WBD", "CSX", "MRVL", "PCAR", "AEP", "ROST", "FTNT", "NXPI", "ADSK", "IDXX", "TRI", "BKR", "PYPL", "EA", "FAST", "WDAY", "AXON", "MSTR", "DDOG", "TTWO", "EXC", "XEL", "FANG", "ROP", "CTSH", "MCHP", "CCEP", "CPRT", "PAYX", "KDP", "ODFL", "GEHC", "TEAM", "ZS", "VRSK", "DXCM", "CSGP", "KHC", "BIIB", "ON", "CHTR", "GFS", "LULU", "TTD", "CDW"],
        "SP500": ["NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "GOOG", "META", "AVGO", "TSLA", "BRK-B", "LLY", "WMT", "JPM", "V", "XOM", "JNJ", "ORCL", "MA", "MU", "COST", "AMD", "PLTR", "ABBV", "HD", "BAC", "NFLX", "PG", "CVX", "UNH", "KO", "GE", "CSCO", "CAT", "MS", "GS", "LRCX", "IBM", "PM", "WFC", "MRK", "RTX", "AMAT", "AXP", "TMO", "MCD", "INTC", "CRM", "LIN", "TMUS", "KLAC", "C", "DIS", "PEP", "BA", "ABT", "ISRG", "AMGN", "APH", "SCHW", "GEV", "APP", "NEE", "TXN", "BLK", "ACN", "ANET", "UBER", "TJX", "GILD", "T", "QCOM", "VZ", "DHR", "BKNG", "SPGI", "INTU", "LOW", "ADI", "PFE", "HON", "NOW", "DE", "COF", "BSX", "LMT", "UNP", "SYK", "NEM", "MDT", "ETN", "WELL", "PANW", "ADBE", "COP", "PGR", "VRTX", "CB", "PLD", "PH", "BX", "CRWD", "BMY", "SBUX", "KKR", "HCA", "CMCSA", "CVS", "CEG", "ADP", "MO", "CME", "MCK", "ICE", "GD", "SO", "NKE", "HOOD", "NOC", "SNPS", "MCO", "WM", "UPS", "DUK", "MRSH", "DASH", "PNC", "FCX", "CDNS", "HWM", "SHW", "MMM", "USB", "MAR", "TT", "ORLY", "AMT", "EMR", "ELV", "CRH", "BK", "WDC", "ABNB", "MNST", "GLW", "TDG", "ECL", "WMB", "REGN", "APO", "CMI", "RCL", "EQIX", "CTAS", "DELL", "STX", "MDLZ", "ITW", "CI", "GM", "SLB", "AON", "FDX", "WBD", "PWR", "CL", "JCI", "SNDK", "HLT", "COR", "CSX", "RSG", "CVNA", "MSI", "LHX", "KMI", "TEL", "AJG", "NSC", "PCAR", "TFC", "AEP", "AZO", "ROST", "FTNT", "MTI", "TRV", "SPG", "EOG", "NXPI", "COIN", "URI", "APD", "BDX", "ADSK", "VLO", "PSX", "AFL", "SRE", "NDAQ", "O", "IDXX", "DLR", "ZTS", "VST", "CMG", "F", "BKR", "PYPL", "MPC", "EA", "MPWR", "D", "AME", "ALL", "FAST", "CBRE", "GWW", "MET", "WDAY", "PSA", "CAH", "OKE", "TGT", "AXON", "EW", "CTVA", "CARR", "ROK", "AMP", "DDOG", "TTWO", "EXC", "DAL", "XEL", "MSCI", "FANG", "ROP", "DHI", "OXY", "YUM", "EL", "EBAY", "ETR", "NUE", "TRGP", "KR", "CTSH", "XYZ", "LVS", "MCHP", "CPRT", "IQV", "GRMN", "VMC", "FIX", "WAB", "MLM", "PEG", "AIG", "HSY", "A", "PAYX", "KDP", "CCI", "PRU", "ED", "CCL", "RMD", "FICO", "KEYS", "SYY", "ODFL", "FISV", "GEHC", "VTR", "TER", "HIG", "WEC", "OTIS", "STT", "UAL", "EQT", "IBKR", "IR", "XYL", "ARES", "LYV", "KVUE", "KMB", "ACGL", "FITB", "RJF", "EXPE", "MTB", "PCG", "ADM", "DG", "HUM", "FIS", "EME", "WTW", "VICI", "ULTA", "VRSK", "ROL", "EXR", "CBOE", "TSCO", "MTD", "TDY", "NRG", "HAL", "DXCM", "DOV", "HPE", "DTE", "CSGP", "NTRS", "AEE", "IRM", "LEN", "SYF", "STZ", "KHC", "HBAN", "BRO", "FE", "CFG", "PPL", "ATO", "TPR", "STLD", "ES", "EXE", "FSLR", "HUBB", "JBL", "EFX", "DLTR", "WRB", "STE", "CNP", "AWK", "AVB", "PPG", "BIIB", "VLTO", "OMC", "ON", "CHTR", "CINF", "LDOS", "WSM", "PHM", "DVN", "BR", "TPL", "RF", "GIS", "DRI", "EQR", "EIX", "WAT", "KEY", "VRSN", "TROW", "SW", "IP", "CNC", "CPAY", "LULU", "ALB", "RL", "CHD", "LH", "BG", "TSN", "LUV", "CMS", "EXPD", "GPN", "L", "NVR", "CTRA", "CHRW", "NI", "AMCR", "PKG", "DGX", "Q", "DOW", "PFG", "INCY", "SBAC", "JBHT", "NTAP", "PTC", "WY", "SNA", "GPC", "PODD", "MRNA", "SMCI", "IFF", "TYL", "DD", "LII", "HPQ", "TTD", "PNR", "EVRG", "FTV", "LNT", "ZBH", "WST", "TRMB", "TXT", "HOLX", "IT", "INVH", "APTV", "HII", "LYB", "CDW", "ESS", "MKC", "J", "TKO", "COO", "MAA", "GEN", "FOX", "BALL", "VTRS", "FOXA", "NDSN", "FFIV", "IEX", "DECK", "AVY", "ERIE", "CF", "ALLE", "MAS", "KIM", "BBY", "GDDY", "DPZ", "CLX", "SOLV", "AKAM", "EG", "HRL", "BLDR", "JKHY", "RVTY", "BEN", "REG", "PSKY", "HST", "UHS", "SWK", "BF-B", "IVZ", "DOC", "UDR", "HAS", "ZBRA", "ALGN", "EPAM", "WYNN", "AIZ", "CPT", "DAY", "PNW", "SJM", "GL", "CRL", "FDS", "TECH", "BXP", "MOH", "BAX", "ARE", "GNRC", "AES", "AOS", "NWSA", "POOL", "TAP", "NCLH", "MGM", "APA", "MOS", "HSIC", "SWKS", "FRT", "CAG", "PAYC", "CPB", "DVA", "MTCH", "LW", "NWS"]
    }
    
    unique_symbols = set()
    for market, syms in constituents.items():
        for s in syms:
            unique_symbols.add(s)
            
    records = []
    for symbol in unique_symbols:
        records.append({
            "stock_code": symbol,
            "stock_name": f"US Stock: {symbol}", # 雿??迂嚗?蝥?鋆??湔
            "market_type": "US",
            "priority": 2, # ???∪??
            "is_active": True
        })
    return records

def get_us_indices():
    """摰儔?詨?蝢?撠? ETF"""
    indices = [
        {"stock_code": "DIA", "stock_name": "??撌交平? ETF (DIA)", "priority": 1},
        {"stock_code": "SPY", "stock_name": "璅500? ETF (SPY)", "priority": 1},
        {"stock_code": "QQQ", "stock_name": "????100? ETF (QQQ)", "priority": 1},
        {"stock_code": "SOXX", "stock_name": "鞎餃???擃???ETF (SOXX)", "priority": 1},
    ]
    for item in indices:
        item["market_type"] = "US"
        item["is_active"] = True
    return indices

def init_stocks():
    supabase = get_supabase()
    fetcher = TwseFetcher(supabase)
    
    all_records = []

    # 1. ???啗銝?
    logger.info("? 甇?敺?TWSE ??銝?皜...")
    df_twse = fetcher.fetch(report_type='BWIBBU_ALL')
    if not df_twse.empty:
        for _, row in df_twse.iterrows():
            symbol = row['stock_code'].strip()
            if len(symbol) in [4, 5, 6]:
                # 甈潸?芸?摨?擃?(蝭?: 2330, 2317)
                priority = 1 if symbol in ['2330', '2317', '2454', '0050', '0056'] else 2
                all_records.append({
                    "stock_code": symbol,
                    "stock_name": row['stock_name'].strip(),
                    "market_type": "TW",
                    "priority": priority,
                    "is_active": True
                })

    # 2. ???啗銝?
    otc_records = fetch_otc_stocks()
    all_records.extend(otc_records)

    # 3. 瘜典蝢?詨?????
    us_indices = get_us_indices()
    all_records.extend(us_indices)
    
    us_constituents = get_us_constituents()
    all_records.extend(us_constituents)

    # 4. 瘜典?漱?璅? (TX, MTX, TE)
    futures = [
        {"stock_code": "TX", "stock_name": "?唳???, "market_type": "Taifex", "priority": 1, "is_active": True},
        {"stock_code": "MTX", "stock_name": "撠??唳?", "market_type": "Taifex", "priority": 1, "is_active": True},
        {"stock_code": "TE", "stock_name": "?餃???, "market_type": "Taifex", "priority": 1, "is_active": True},
    ]
    all_records.extend(futures)

    if all_records:
        logger.info(f"?? 甇?撠?{len(all_records)} 瑼????亥??澈 (?啗銝?瑹?+ 蝢?)...")
        try:
            # ?望蝑頛?嚗??寡?鋆∩誑?脰???
            batch_size = 500
            for i in range(0, len(all_records), batch_size):
                batch = all_records[i:i+batch_size]
                supabase.from_('stocks').upsert(batch, on_conflict='stock_code').execute()
            logger.info("??璅?皜??????)
        except Exception as e:
            logger.error(f"??摮鞈?摨怠仃?? {e}")

if __name__ == "__main__":
    init_stocks()
