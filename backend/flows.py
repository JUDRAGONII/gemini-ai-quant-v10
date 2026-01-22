from prefect import flow, task
import time
from etl.macro import MacroETL
from agents.dialectic import DialecticAgent
import schedule

@task(name="Sync Macro Data", retries=3)
def sync_macro():
    print("--- [Task] Sync Macro Data ---")
    etl = MacroETL()
    etl.run()

@task(name="Run AI Dialectic", retries=0)
def run_dialectic():
    print("--- [Task] Run AI Dialectic ---")
    agent = DialecticAgent()
    # Topic could be dynamic
    agent.conduct_debate("Market Trends Analysis")

@flow(name="Daily Analysis Pipeline")
def daily_pipeline():
    sync_macro()
    # run_dialectic() # Commented out to save quota for now or run carefully

def run_scheduler():
    print("Starting Scheduler...")
    # Schedule runs (e.g., every day at 08:00 AM)
    schedule.every().day.at("08:00").do(daily_pipeline)
    
    # Also run once on startup for verification
    print("Running initial pipeline...")
    daily_pipeline()

    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    run_scheduler()
