import requests
import logging

logging.basicConfig(level=logging.INFO)

url = "https://www.twse.com.tw/exchangeReport/BWIBBU_ALL?response=json"
try:
    resp = requests.get(url, timeout=10)
    data = resp.json()
    if 'data' in data and len(data['data']) > 0:
        first_row = data['data'][0]
        logging.info(f"First row length: {len(first_row)}")
        logging.info(f"First row content: {first_row}")
    else:
        logging.warning("No data found or empty 'data' field.")
        logging.info(f"Keys: {data.keys()}")
except Exception as e:
    logging.error(f"Error: {e}")
