import requests
import json

def test_heatmap():
    url = "http://localhost:8001/api/v1/market/heatmap"
    
    response = requests.post(url, json={"market_type": "ALL", "group_by": "sector"})
    print(f"Status: {response.status_code}")
    
    if response.ok:
        data = response.json()
        print(f"Total Stocks: {data.get('total_stocks', 0)}")
        print(f"Sectors: {len(data.get('children', []))}")
        
        for sector in data.get('children', [])[:3]:
            print(f"  - {sector['name']}: {len(sector['children'])} stocks")
            if sector['children']:
                top = sector['children'][0]
                print(f"      Top: {top['name']} ({top['stock_code']}) change: {top['change_percent']}%")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_heatmap()
