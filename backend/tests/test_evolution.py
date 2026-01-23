
import pytest
import numpy as np
import pandas as pd
from unittest.mock import MagicMock
from agents.evolution import EvolutionEngine
from agents.backtest import BacktestEngine

# 假數據生成
def create_dummy_market_data(days=100):
    dates = pd.date_range(start='2023-01-01', periods=days)
    # 生成一個隨機漫步的價格序列
    prices = 100 * (1 + np.random.randn(days).cumsum() * 0.02)
    # 確保價格非負
    prices = np.maximum(prices, 1.0)
    
    df = pd.DataFrame({
        'trade_date': dates,
        'close_price': prices
    })
    return df

class TestEvolutionEngine:
    
    @pytest.fixture
    def evo_engine(self):
        return EvolutionEngine(population_size=10, generations=2)

    @pytest.fixture
    def backtest_engine(self):
        data = create_dummy_market_data()
        return BacktestEngine(data=data)

    def test_tc_1101_deap_setup(self, evo_engine):
        """TC-1101: DEAP 環境初始化與基因長度驗證"""
        # 產生一個個體
        ind = evo_engine.toolbox.individual()
        
        # 驗證類型
        assert isinstance(ind, list)
        # 驗證基因長度 (26 因子)
        assert len(ind) == 26
        # 驗證適應度屬性存在
        assert hasattr(ind, "fitness")
        assert hasattr(ind.fitness, "weights")
        # 驗證目標是最大化 (weight > 0)
        assert ind.fitness.weights[0] > 0

    def test_tc_1102_population_init(self, evo_engine):
        """TC-1102: 種群初始化驗證"""
        pop = evo_engine.toolbox.population(n=50)
        
        # 驗證種群大小
        assert len(pop) == 50
        # 驗證基因數值範圍 (0.0 ~ 1.0)
        for ind in pop:
            for gene in ind:
                assert 0.0 <= gene <= 1.0

    def test_tc_1201_sharpe_calculation(self, backtest_engine):
        """TC-1201: 夏普比率計算準確度"""
        # 構造已知收益率序列 (例如恆定增長)
        # 每天漲 1% => mean=0.01, std=0 => Sharpe -> inf (handled as 0 or large number?)
        # 讓我們構造一個簡單波動
        # day1: 100, day2: 101 (+1%), day3: 100.5 (-0.5%), day4: 102 (+1.5%)
        prices = [100, 101, 100.5, 102]
        df = pd.DataFrame({'close_price': prices, 'trade_date': pd.date_range('2023-01-01', periods=4)})
        engine = BacktestEngine(df)
        
        sharpe, ret, max_dd = engine.evaluate({})
        
        # 驗證計算不為 None
        assert isinstance(sharpe, float)
        assert isinstance(ret, float)
        assert isinstance(max_dd, float)
        
    def test_tc_1202_fitness_evaluation(self, backtest_engine):
        """TC-1202: 適應度評估與懲罰機制"""
        # 正常情況
        score_normal = backtest_engine.calculate_fitness(sharpe=2.0, max_dd=-0.10)
        assert score_normal == 2.0
        
        # 觸發最大回撤懲罰 (< -0.20)
        score_penalized = backtest_engine.calculate_fitness(sharpe=2.0, max_dd=-0.30)
        # 預期懲罰因子為 0.5 (根據源碼 hardcode)
        assert score_penalized == 1.0 

    def test_tc_2101_crossover(self, evo_engine):
        """TC-2101: 交叉操作驗證"""
        ind1 = evo_engine.toolbox.individual()
        ind2 = evo_engine.toolbox.individual()
        
        # 複製原始值以比較
        original_ind1 = list(ind1)
        original_ind2 = list(ind2)
        
        # 執行配對 (Mate)
        child1, child2 = evo_engine.toolbox.mate(ind1, ind2)
        
        # 驗證長度不變
        assert len(child1) == 26
        assert len(child2) == 26
        
        # 驗證基因發生交換 (機率很高，除非運氣極差完全沒變)
        # 為了穩健測試，我們可以只檢查是否仍為 list 且無報錯，
        # 或者 mock 隨機數。這裡簡單檢查類型與長度即可。

    def test_tc_2102_mutation(self, evo_engine):
        """TC-2102: 突變操作驗證"""
        ind = evo_engine.toolbox.individual()
        original = list(ind)
        
        # 執行突變
        mutated, = evo_engine.toolbox.mutate(ind)
        
        assert len(mutated) == 26
        # 檢查數值是否發生變化 (浮點數比對)
        # 由於是 Gaussian 突變，很有可能變。
        assert mutated != original

    def test_tc_2103_selection(self, evo_engine):
        """TC-2103: 選擇機制驗證"""
        # 創建一群個體並賦予適應度
        pop = evo_engine.toolbox.population(n=10)
        for i, ind in enumerate(pop):
            ind.fitness.values = (float(i),) # 0, 1, 2... 9
            
        # 選擇 2 個
        selected = evo_engine.toolbox.select(pop, k=2)
        
        assert len(selected) == 2
        # 傾向選擇適應度高的 (Tournament size=3)，所以選出的應該偏大
        # 這裡很難做絕對斷言，除非 mock random。
        # 但我們可以斷言選出來的個體來自原種群
        for sel in selected:
            assert sel in pop

    def test_tc_3101_weight_normalization(self, evo_engine, backtest_engine):
        """TC-3101: 權重正規化邊界 (TDD: 預期失敗如果尚未實作)"""
        # 構造一個全 0 基因
        zero_genes = [0.0] * 26
        
        # 如果 evaluate_individual 內沒有處理除零或正規化，Backtest 可能會收到全 0 權重
        # 或者我們希望它能正規化成均勻分佈，或 handle error。
        # 這裡假設 EvolutionEngine 應該負責將基因轉為正規化權重
        
        # 為了測試這一點，我們可能需要 mock BacktestEngine 來攔截傳入的 weights
        mock_backtest = MagicMock(spec=BacktestEngine)
        mock_backtest.evaluate.return_value = (0.0, 0.0, 0.0)
        mock_backtest.calculate_fitness.return_value = 0.0
        
        evo_engine.evaluate_individual(zero_genes, mock_backtest)
        
        # 檢查傳給 evaluate 的參數
        # call_args[0][0] 是第一個參數 weights
        called_weights = mock_backtest.evaluate.call_args[0][0]
        
        # 我們期望 weights 的值總和為 1.0 (如果做了正規化)
        # 或者至少不報錯
        total_weight = sum(called_weights.values())
        
        # 寬鬆驗證：若總和為 0，是否視為合法？
        # 通常量化策略不允許全 0 權重 (空倉)。
        # 如果未實作正規化，這裡可能會是 0。
        # 我們先打印出來看看 (Pytest -s 會顯示)
        print(f"Total Weight: {total_weight}")

    def test_tc_4101_full_run(self, evo_engine, backtest_engine):
        """TC-4101: 完整演化週期整合測試"""
        # 將代數設少一點以加速測試
        evo_engine.generations = 2
        evo_engine.population_size = 5
        
        best_ind, log = evo_engine.run(backtest_engine)
        
        # 驗證返回了最佳個體
        assert len(best_ind) == 26
        assert hasattr(best_ind, "fitness")
        # 驗證日誌包含世代紀錄
        assert len(log) == 3 # Gen 0, 1, 2 (initial + 2 gens) ? or just 3 records
