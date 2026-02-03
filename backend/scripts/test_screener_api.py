import requests
import time
import json

def test_screener():
    url = "http://localhost:8001/api/v1/screener/screen"
    
    # 測試過濾條件
    payloads = [
        {
            "name": "高 AI 分數選股",
            "data": {
                "filters": {"ai_score_range": [80, 100]},
                "sort_by": "ai_score",
                "sort_order": "desc"
            }
        },
        {
            "name": "即時強勢且成交量大",
            "data": {
                "filters": {
                    "change_range": [2, 10], 
                    "price_range": [10, 1000]
                },
                "sort_by": "change_percent",
                "sort_order": "desc"
            }
        },
        {
            "name": "交叉過濾 (AI + RSI)",
            "data": {
                "filters": {
                    "ai_score_range": [70, 100],
                    "rsi_14_range": [30, 70]
                },
                "page_size": 10
            }
        }
    ]
    
    for p in payloads:
        print(f"--- 測試: {p['name']} ---")
        start_time = time.time()
        try:
            response = requests.post(url, json=p['data'], timeout=10)
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                print(f"成功! 找到 {data['count']} 檔標的")
                print(f"響應時間: {elapsed:.3f}s")
                if data['data']:
                    print(f"首筆結果: {data['data'][0]['stock_code']} - AI Score: {data['data'][0].get('ai_score', 'N/A')}")
            else:
                print(f"失敗! 狀態碼: {response.status_code}, 內容: {response.text}")
        except Exception as e:
            print(f"錯誤: {e}")
        print("\n")

if __name__ == "__main__":
    test_screener()
