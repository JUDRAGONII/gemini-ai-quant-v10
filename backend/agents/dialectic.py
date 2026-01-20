from lib.supabase_client import get_supabase
from lib.llm import get_llm
from lib.config import Config
from datetime import datetime

class DialecticAgent:
    """多空辯論 AI 代理"""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.llm = get_llm()

    def get_market_context(self, symbol="SPY", days=30) -> str:
        """從資料庫獲取近期市場數據作為 Context"""
        # 暫時簡單實作：獲取 VIX 與 宏觀數據
        # 實際應用應查詢 daily_price 與 macro_indicators
        try:
            res = self.supabase.table("macro_indicators").select("*").limit(10).order("reference_date", desc=True).execute()
            data = res.data
            context = "Recent Macro Indicators:\n"
            for item in data:
                context += f"- {item['indicator_code']}: {item['value']} ({item['reference_date']})\n"
            return context
        except Exception as e:
            print(f"Error fetching context: {e}")
            return "No market data available."

    def conduct_debate(self, topic: str):
        """執行辯論並產出報告"""
        print(f"Starting debate on: {topic}")
        
        context = self.get_market_context()
        
        # 1. Bull Argument
        bull_prompt = f"""
        Context: {context}
        Topic: {topic}
        Role: Bullish Analyst (Optimist)
        Task: Provide 3 strong arguments why the market is positive.
        """
        bull_view = self.llm.generate_content(bull_prompt)
        print("Bull View Generated.")

        # 2. Bear Argument
        bear_prompt = f"""
        Context: {context}
        Topic: {topic}
        Role: Bearish Analyst (Pessimist)
        Task: Provide 3 strong risks/arguments why the market is negative.
        """
        bear_view = self.llm.generate_content(bear_prompt)
        print("Bear View Generated.")

        # 3. Synthesis (Dialectic)
        merge_prompt = f"""
        Topic: {topic}
        Bull Argument: {bull_view}
        Bear Argument: {bear_view}
        Task: Act as a Quant Fund Manager. Synthesize these opposing views. 
        1. Identify the most critical factor.
        2. Give a final verdict (Bullish/Bearish/Neutral) with a confidence score (0-100).
        3. Output in JSON format: {{ "verdict": "...", "confidence": 80, "analysis": "..." }}
        """
        final_report = self.llm.generate_content(merge_prompt)
        print("Synthesis Complete.")

        # Save to DB
        self.save_report(topic, bull_view, bear_view, final_report)

    def save_report(self, topic, bull, bear, summary):
        payload = {
            "stock_code": "MARKET_US", # General Market
            "report_date": datetime.now().strftime('%Y-%m-%d'),
            "summary": summary[:200] + "...", # Truncate for summary
            "full_content": f"TOPIC: {topic}\n\n[BULL]\n{bull}\n\n[BEAR]\n{bear}\n\n[SYNTHESIS]\n{summary}",
            # Embedding would be generated here if we had an embedding function
        }
        try:
            self.supabase.table("ai_reports").insert(payload).execute()
            print("Report saved to database.")
        except Exception as e:
            print(f"Error saving report: {e}")

if __name__ == "__main__":
    agent = DialecticAgent()
    agent.conduct_debate("Current US Market Outlook")
