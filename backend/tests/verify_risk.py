import requests
import sys
import os

def verify_risk():
    print("--- Phase 13.4 Risk Matrix Verification ---")
    ticker = "2330"
    url = f"http://localhost:8001/api/v1/professional/risk-matrix?ticker={ticker}"
    
    print(f"Testing Endpoint: {url}")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("  [PASS] API returned status 200.")
            print(f"  [INFO] Ticker: {data.get('ticker')}")
            
            # Greeks 驗證
            greeks = data.get("greeks")
            if greeks and all(k in greeks for k in ["delta", "gamma", "theta", "vega"]):
                print("  [PASS] Greeks simulation data structure is correct.")
            else:
                print("  [FAIL] Greeks data incomplete.")
                
            # Barra 驗證
            barra = data.get("barra_decomposition")
            if barra and all(k in barra for k in ["size", "value", "momentum", "volatility", "growth"]):
                print("  [PASS] Barra decomposition data structure is correct.")
            else:
                print("  [FAIL] Barra data incomplete.")
                
            # Stress Test 驗證
            stress = data.get("stress_tests")
            if stress and len(stress) > 0:
                print(f"  [PASS] Stress test returned {len(stress)} scenarios.")
            else:
                print("  [FAIL] Stress test data missing.")
                
        else:
            print(f"  [FAIL] API returned status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"  [ERROR] API call failed: {e}")

if __name__ == "__main__":
    verify_risk()
