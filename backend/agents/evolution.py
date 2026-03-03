import random
import logging
import numpy as np
from deap import base, creator, tools, algorithms
from typing import List, Dict, Any, Tuple
from .backtest import BacktestEngine

logger = logging.getLogger(__name__)

class EvolutionEngine:
    """
    演化策略引擎 (Evolution Strategy Engine)
    使用遺傳演算法 (GA) 優化投資策略參數。
    """

    def __init__(self, population_size: int = 50, generations: int = 10):
        self.population_size = population_size
        self.generations = generations
        self._setup_deap()

    def _setup_deap(self):
        """設定 DEAP 遺傳演算法組件"""
        # 定義適應度函數 (最大化)
        if not hasattr(creator, "FitnessMax"):
            creator.create("FitnessMax", base.Fitness, weights=(1.0,))
        
        # 定義個體 (長度為 26 的浮點數向量)
        if not hasattr(creator, "Individual"):
            creator.create("Individual", list, fitness=creator.FitnessMax)

        self.toolbox = base.Toolbox()
        # 基因初始化 (0.0 - 1.0)
        self.toolbox.register("attr_float", random.random)
        self.toolbox.register("individual", tools.initRepeat, creator.Individual, self.toolbox.attr_float, n=26)
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)

        # 遺傳算子
        self.toolbox.register("mate", tools.cxTwoPoint) # 兩點交叉
        self.toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=0.1, indpb=0.1) # 高斯突變
        self.toolbox.register("select", tools.selTournament, tournsize=3) # 競賽選擇

    def evaluate_individual(self, individual: List[float], backtest_engine: BacktestEngine) -> Tuple[float]:
        """
        適應度評估函數
        將 26 項基因映射至策略參數，執行回測並獲取夏普比率。
        """
        # 映射邏輯 (示例)
        weights = {
            "value": individual[0],
            "growth": individual[1],
            "quality": individual[2],
            "momentum": individual[3],
            "macro_adj": individual[4]
        }
        
        sharpe, annual_return, max_dd = backtest_engine.evaluate(weights)
        fitness = backtest_engine.calculate_fitness(sharpe, max_dd)
        
        return (fitness,)

    def run(self, backtest_engine: BacktestEngine):
        """執行演化流程並持久化歷史紀錄"""
        logger.info(f"Starting Evolution: PopSize={self.population_size}, Gen={self.generations}")
        
        # 註冊評估函數
        self.toolbox.register("evaluate", self.evaluate_individual, backtest_engine=backtest_engine)
        
        pop = self.toolbox.population(n=self.population_size)
        hof = tools.HallOfFame(1)
        
        # 統計資訊
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("avg", np.mean)
        stats.register("max", np.max)
        
        from ..lib.supabase_client import get_supabase
        supabase = get_supabase()

        # 初始評估
        invalid_ind = [ind for ind in pop if not ind.fitness.valid]
        fitnesses = self.toolbox.map(self.toolbox.evaluate, invalid_ind)
        for ind, fit in zip(invalid_ind, fitnesses):
            ind.fitness.values = fit
        
        if hof is not None:
            hof.update(pop)

        logbook = tools.Logbook()
        record = stats.compile(pop) if stats else {}
        logbook.record(gen=0, **record)

        # 演化主迴圈
        for gen in range(1, self.generations + 1):
            # 選取下一代
            offspring = self.toolbox.select(pop, len(pop))
            offspring = list(map(self.toolbox.clone, offspring))

            # 交叉與突變
            for child1, child2 in zip(offspring[::2], offspring[1::2]):
                if random.random() < 0.5: # cxpb
                    self.toolbox.mate(child1, child2)
                    del child1.fitness.values
                    del child2.fitness.values

            for mutant in offspring:
                if random.random() < 0.2: # mutpb
                    self.toolbox.mutate(mutant)
                    del mutant.fitness.values

            # 評估失效個體
            invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
            fitnesses = self.toolbox.map(self.toolbox.evaluate, invalid_ind)
            for ind, fit in zip(invalid_ind, fitnesses):
                ind.fitness.values = fit

            # 更新族群
            pop[:] = offspring
            if hof is not None:
                hof.update(pop)

            # 紀錄統計
            record = stats.compile(pop) if stats else {}
            logbook.record(gen=gen, **record)
            
            # 持久化至資料庫
            try:
                best_ind = hof[0]
                supabase.table("evolution_history").upsert({
                    "generation": gen,
                    "best_genome": [float(g) for g in best_ind],
                    "avg_fitness": float(record["avg"]),
                    "max_fitness": float(record["max"])
                }).execute()
                logger.info(f"Gen {gen}: Statistics persisted.")
            except Exception as e:
                logger.error(f"Failed to persist generation {gen}: {e}")

        best_ind = hof[0]
        logger.info(f"Evolution Completed. Best Fitness: {best_ind.fitness.values[0]}")
        
        return best_ind, logbook
