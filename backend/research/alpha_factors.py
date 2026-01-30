import pandas as pd
import numpy as np
from typing import List, Dict, Optional

class AlphaFactory:
    """
    AI Alpha 特徵工廠 (Alpha Factor Factory)
    
    核心原則：
    1. Vectorization First: 全向量化運算，嚴禁使用 for loop。
    2. Stateless: 不持有狀態，輸入 DataFrame -> 輸出 DataFrame。
    3. Deterministic: 相同輸入必產生相同輸出。
    """
    
    def __init__(self, stock_df: pd.DataFrame, benchmark_df: Optional[pd.DataFrame] = None):
        """
        初始化
        :param stock_df: 包含 OHLCV 的 DataFrame，Index 必須是 Datetime
        :param benchmark_df: 大盤或基準指數 DataFrame (可選)
        """
        # Ensure data is sorted by date
        self.df = stock_df.sort_index().copy()
        self.bench = benchmark_df.sort_index().copy() if benchmark_df is not None else None
        
        # Validation
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        missing = [c for c in required_cols if c not in self.df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
            
    def _calc_rsi(self, series: pd.Series, period: int = 14) -> pd.Series:
        """向量化 RSI 計算"""
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    def _calc_macd(self, series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> tuple:
        """向量化 MACD 計算"""
        exp1 = series.ewm(span=fast, adjust=False).mean()
        exp2 = series.ewm(span=slow, adjust=False).mean()
        macd_line = exp1 - exp2
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        hist = macd_line - signal_line
        return macd_line, signal_line, hist

    def _calc_atr(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
        """向量化 ATR 計算"""
        tr1 = high - low
        tr2 = (high - close.shift()).abs()
        tr3 = (low - close.shift()).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        return tr.rolling(window=period).mean()

    def _calc_adx(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
        """向量化 ADX 計算 (Simplified Rolling)"""
        up = high.diff()
        down = -low.diff()
        
        plus_dm = np.where((up > down) & (up > 0), up, 0.0)
        minus_dm = np.where((down > up) & (down > 0), down, 0.0)
        
        tr = self._calc_atr(high, low, close, period=1) # True Range for 1 day
        atr = tr.rolling(window=period).mean()
        
        plus_di = 100 * (pd.Series(plus_dm, index=high.index).rolling(window=period).mean() / atr)
        minus_di = 100 * (pd.Series(minus_dm, index=high.index).rolling(window=period).mean() / atr)
        
        dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
        adx = dx.rolling(window=period).mean()
        return adx

    def _calc_bollinger(self, series: pd.Series, period: int = 20, std_dev: int = 2) -> tuple:
        """向量化布林通道計算"""
        ma = series.rolling(window=period).mean()
        std = series.rolling(window=period).std()
        upper = ma + (std * std_dev)
        lower = ma - (std * std_dev)
        return upper, lower, ma

    def add_technical_factors(self) -> pd.DataFrame:
        """
        生成技術面因子 (Momentum, Volatility, Volume)
        """
        # Copy to avoid SettingWithCopyWarning
        features = pd.DataFrame(index=self.df.index)
        
        close = self.df['close']
        high = self.df['high']
        low = self.df['low']
        volume = self.df['volume']
        
        # --- 1. Momentum Factors ---
        # RSI
        features['MOM_RSI'] = self._calc_rsi(close, 14)
        
        # MACD
        _, _, macd_hist = self._calc_macd(close)
        features['MOM_MACD_DIFF'] = macd_hist
        features['MOM_MACD_SLOPE'] = macd_hist.diff(3) # 3日斜率
        
        # ROC (Rate of Change)
        features['MOM_ROC_5'] = close.pct_change(5)
        features['MOM_ROC_20'] = close.pct_change(20)
        
        # MA Bias (均線乖離)
        features['MOM_MA_BIAS_20'] = close / close.rolling(20).mean() - 1
        features['MOM_MA_BIAS_60'] = close / close.rolling(60).mean() - 1
        
        # ADX (Trend Strength)
        features['MOM_ADX'] = self._calc_adx(high, low, close, 14)
        
        # --- 2. Volatility Factors ---
        # ATR Ratio
        atr = self._calc_atr(high, low, close, 14)
        features['VOL_ATR_RATIO'] = atr / close
        
        # Bollinger Bands
        upper, lower, mid = self._calc_bollinger(close, 20, 2)
        features['VOL_BB_WIDTH'] = (upper - lower) / mid
        features['VOL_BB_PCT'] = (close - lower) / (upper - lower)
        
        # Std Dev
        features['VOL_STD_DEV'] = close.rolling(20).std() / close
        
        # --- 3. Volume Factors ---
        # Volume MA Ratio
        features['VLM_MA_RATIO'] = volume / volume.rolling(20).mean()
        
        # Force Index
        features['VLM_FORCE'] = close.diff(1) * volume
        
        # Merge back to self.df or just return features
        # For factory pattern, we might want to accumulate in self.df
        self.df = pd.concat([self.df, features], axis=1)
        
        # Return only the new features for validation if needed
        return features

    def add_chip_factors(self, chip_df: pd.DataFrame) -> pd.DataFrame:
        """
        生成籌碼面因子 (需傳入籌碼數據)
        :param chip_df: 包含 institutional/margin 數據的 DataFrame (Index=Date)
        :columns require: foreign_investor_net, investment_trust_net, dealer_net, margin_balance, short_balance, margin_rate
        """
        if chip_df is None or chip_df.empty:
            return pd.DataFrame()

        # Reindex to match stock_df (Forward fill for missing chip data)
        chip_aligned = chip_df.reindex(self.df.index, method='ffill')
        
        # Calculate Net Institutional Buy (Shares)
        inst_net = (
            chip_aligned.get('foreign_investor_net', 0) + 
            chip_aligned.get('investment_trust_net', 0) + 
            chip_aligned.get('dealer_net', 0)
        )
        
        features = pd.DataFrame(index=self.df.index)
        volume = self.df['volume'].replace(0, np.nan) # Avoid div by zero
        
        # CHP_INST_NET_RATIO: 法人淨買超 / 成交量
        features['CHP_INST_NET_RATIO'] = inst_net / volume
        
        # CHP_INST_ACC_5D: 法人 5 日累計買超 (Normalized by 5D Volume)
        features['CHP_INST_ACC_5D'] = inst_net.rolling(5).sum() / volume.rolling(5).sum()
        
        # CHP_MARGIN_USE_CHG: 融資使用率變動
        if 'margin_rate' in chip_aligned:
            features['CHP_MARGIN_USE_CHG'] = chip_aligned['margin_rate'].diff()
            
        # CHP_SHORT_COVER: 券資比 (Short Balance / Margin Balance)
        if 'short_balance' in chip_aligned and 'margin_balance' in chip_aligned:
            features['CHP_SHORT_COVER'] = chip_aligned['short_balance'] / chip_aligned['margin_balance'].replace(0, np.nan)
            
        self.df = pd.concat([self.df, features], axis=1)
        return features

    def add_macro_factors(self, macro_df: pd.DataFrame) -> pd.DataFrame:
        """
        生成宏觀因子 (需傳入寬表格式的宏觀數據)
        :param macro_df: Index=Date, Columns=[^TWII, VIX, ...etc] (Close Prices)
        """
        if macro_df is None or macro_df.empty:
            return pd.DataFrame()
            
        # Algin Datetime
        macro_aligned = macro_df.reindex(self.df.index, method='ffill')
        
        # Calculate Returns
        stock_ret = self.df['close'].pct_change()
        
        features = pd.DataFrame(index=self.df.index)
        
        # Market Benchmark related (e.g., ^TWII)
        market_col = '^TWII' # Default market index
        if market_col in macro_aligned:
            market_ret = macro_aligned[market_col].pct_change()
            
            # MCR_RS_MARKET: Relative Strength (Stock Return - Market Return)
            features['MCR_RS_MARKET'] = stock_ret - market_ret
            
            # MCR_BETA_20: Rolling Beta
            # Beta = Cov(Stock, Market) / Var(Market)
            cov = stock_ret.rolling(20).cov(market_ret)
            var = market_ret.rolling(20).var()
            features['MCR_BETA_20'] = cov / var
            
        # VIX related
        vix_col = 'VIX'
        if vix_col in macro_aligned:
            vix_change = macro_aligned[vix_col].diff()
            
            # MCR_CORR_VIX: Correlation with VIX changes
            features['MCR_CORR_VIX'] = stock_ret.rolling(20).corr(vix_change)
            
        self.df = pd.concat([self.df, features], axis=1)
        return features
        
    def get_factors(self, drop_na=True) -> pd.DataFrame:
        """
        獲取最終因子矩陣
        """
        # Filter columns that starts with MOM_, VOL_, VLM_, CHP_, MCR_
        factor_cols = [c for c in self.df.columns if any(c.startswith(p) for p in ['MOM_', 'VOL_', 'VLM_', 'CHP_', 'MCR_'])]
        result = self.df[factor_cols].copy()
        
        # Replace inf with nan
        result = result.replace([np.inf, -np.inf], np.nan)
        
        if drop_na:
            result = result.dropna()
            
        return result
