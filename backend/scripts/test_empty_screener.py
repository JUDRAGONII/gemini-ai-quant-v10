import requests
r = requests.post('http://localhost:8001/api/v1/screener/screen', json={'filters': {}})
print(f"Status: {r.status_code}")
print(f"Count: {r.json()['count']}")
if r.json()['data']:
    print(f"First: {r.json()['data'][0]['stock_code']}")
