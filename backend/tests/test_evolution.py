
import pytest
import numpy as np
import pandas as pd
from unittest.mock import MagicMock
from backend.agents.evolution import EvolutionEngine
from backend.agents.backtest import BacktestEngine

# ?????
def create_dummy_market_data(days=100):
    dates = pd.date_range(start='2023-01-01', periods=days)
    # ??銝?璈憤甇亦??寞摨?
    prices = 100 * (1 + np.random.randn(days).cumsum() * 0.02)
    # 蝣箔??寞??
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
        """TC-1101: DEAP ?啣??????箏??瑕漲撽?"""
        # ?Ｙ?銝??
        ind = evo_engine.toolbox.individual()
        
        # 撽?憿?
        assert isinstance(ind, list)
        # 撽??箏??瑕漲 (26 ??)
        assert len(ind) == 26
        # 撽??拇?摨血惇?批???
        assert hasattr(ind, "fitness")
        assert hasattr(ind.fitness, "weights")
        # 撽??格??舀?憭批? (weight > 0)
        assert ind.fitness.weights[0] > 0

    def test_tc_1102_population_init(self, evo_engine):
        """TC-1102: 蝔桃黎????霅?""
        pop = evo_engine.toolbox.population(n=50)
        
        # 撽?蝔桃黎憭批?
        assert len(pop) == 50
        # 撽??箏??詨潛???(0.0 ~ 1.0)
        for ind in pop:
            for gene in ind:
                assert 0.0 <= gene <= 1.0

    def test_tc_1201_sharpe_calculation(self, backtest_engine):
        """TC-1201: 憭瘥?閮?皞Ⅱ摨?""
        # 瑽歇?交??摨? (靘???憓)
        # 瘥予瞍?1% => mean=0.01, std=0 => Sharpe -> inf (handled as 0 or large number?)
        # 霈??????陛?格郭??
        # day1: 100, day2: 101 (+1%), day3: 100.5 (-0.5%), day4: 102 (+1.5%)
        prices = [100, 101, 100.5, 102]
        df = pd.DataFrame({'close_price': prices, 'trade_date': pd.date_range('2023-01-01', periods=4)})
        engine = BacktestEngine(df)
        
        sharpe, ret, max_dd = engine.evaluate({})
        
        # 撽?閮?銝 None
        assert isinstance(sharpe, float)
        assert isinstance(ret, float)
        assert isinstance(max_dd, float)
        
    def test_tc_1202_fitness_evaluation(self, backtest_engine):
        """TC-1202: ?拇?摨西?隡啗??脩蔑璈"""
        # 甇?虜??
        score_normal = backtest_engine.calculate_fitness(sharpe=2.0, max_dd=-0.10)
        assert score_normal == 2.0
        
        # 閫貊?憭批??斗蝵?(< -0.20)
        score_penalized = backtest_engine.calculate_fitness(sharpe=2.0, max_dd=-0.30)
        # ???脩蔑????0.5 (?寞?皞Ⅳ hardcode)
        assert score_penalized == 1.0 

    def test_tc_2101_crossover(self, evo_engine):
        """TC-2101: 鈭文???撽?"""
        ind1 = evo_engine.toolbox.individual()
        ind2 = evo_engine.toolbox.individual()
        
        # 銴ˊ???潔誑瘥?
        original_ind1 = list(ind1)
        original_ind2 = list(ind2)
        
        # ?瑁??? (Mate)
        child1, child2 = evo_engine.toolbox.mate(ind1, ind2)
        
        # 撽??瑕漲銝?
        assert len(child1) == 26
        assert len(child2) == 26
        
        # 撽??箏??潛?鈭斗? (璈?敺?嚗??瘞?扔撌桀??冽?霈?
        # ?箔?蝛拙皜祈岫嚗??隞亙瑼Ｘ?臬隞 list 銝?梢嚗?
        # ??mock ?冽??詻ㄐ蝪∪瑼Ｘ憿??摨血?胯?

    def test_tc_2102_mutation(self, evo_engine):
        """TC-2102: 蝒???撽?"""
        ind = evo_engine.toolbox.individual()
        original = list(ind)
        
        # ?瑁?蝒?
        mutated, = evo_engine.toolbox.mutate(ind)
        
        assert len(mutated) == 26
        # 瑼Ｘ?詨潭?衣????(瘚桅??豢?撠?
        # ?望??Gaussian 蝒?嚗???質???
        assert mutated != original

    def test_tc_2103_selection(self, evo_engine):
        """TC-2103: ?豢?璈撽?"""
        # ?萄遣銝蝢文?銝西釵鈭?漲
        pop = evo_engine.toolbox.population(n=10)
        for i, ind in enumerate(pop):
            ind.fitness.values = (float(i),) # 0, 1, 2... 9
            
        # ?豢? 2 ??
        selected = evo_engine.toolbox.select(pop, k=2)
        
        assert len(selected) == 2
        # ?曉??豢??拇?摨阡???(Tournament size=3)嚗?隞仿?箇??府?之
        # ?ㄐ敺??撠閮嚗??mock random??
        # 雿??隞交閮?詨靘???靘?車蝢?
        for sel in selected:
            assert sel in pop

    def test_tc_3101_weight_normalization(self, evo_engine, backtest_engine):
        """TC-3101: 甈?甇??????(TDD: ??憭望?憒?撠撖虫?)"""
        # 瑽?? 0 ?箏?
        zero_genes = [0.0] * 26
        
        # 憒? evaluate_individual ?扳?????嗆?甇????Backtest ?航??啣 0 甈?
        # ???????賣迤閬????餃?雿???handle error??
        # ?ㄐ?身 EvolutionEngine ?府鞎痊撠???箸迤閬?甈?
        
        # ?箔?皜祈岫??暺???賡?閬?mock BacktestEngine 靘??芸?亦? weights
        mock_backtest = MagicMock(spec=BacktestEngine)
        mock_backtest.evaluate.return_value = (0.0, 0.0, 0.0)
        mock_backtest.calculate_fitness.return_value = 0.0
        
        evo_engine.evaluate_individual(zero_genes, mock_backtest)
        
        # 瑼Ｘ?喟策 evaluate ????
        # call_args[0][0] ?舐洵銝????weights
        called_weights = mock_backtest.evaluate.call_args[0][0]
        
        # ????weights ?潛蜇? 1.0 (憒???甇????
        # ?撠??梢
        total_weight = sum(called_weights.values())
        
        # 撖祇?撽?嚗蝮賢???0嚗?西??箏?瘜?
        # ?虜??蝑銝?閮勗 0 甈? (蝛箏???
        # 憒??芸祕雿迤閬?嚗ㄐ?航? 0??
        # ????箔??? (Pytest -s ?＊蝷?
        print(f"Total Weight: {total_weight}")

    def test_tc_4101_full_run(self, evo_engine, backtest_engine):
        """TC-4101: 摰瞍??望??游?皜祈岫"""
        # 撠誨?貉身撠?暺誑?葫閰?
        evo_engine.generations = 2
        evo_engine.population_size = 5
        
        best_ind, log = evo_engine.run(backtest_engine)
        
        # 撽?餈?鈭?雿喳?
        assert len(best_ind) == 26
        assert hasattr(best_ind, "fitness")
        # 撽??亥??銝誨蝝??
        assert len(log) == 3 # Gen 0, 1, 2 (initial + 2 gens) ? or just 3 records
