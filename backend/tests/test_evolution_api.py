import pytest
from fastapi.testclient import TestClient
from backend.api.main import app
from backend.lib.supabase_client import get_supabase

client = TestClient(app)
supabase = get_supabase()

def test_evolution_history_endpoint():
    """TC-1342: 歷程 API 獲取 - 驗證端點是否正常運作"""
    response = client.get("/api/v1/evolution/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_evolution_best_endpoint():
    """驗證獲取當前最強個體端點"""
    # 這裡假設已經有數據，或者返回 404
    response = client.get("/api/v1/evolution/best")
    if response.status_code == 200:
        data = response.json()
        assert "best_genome" in data
        assert len(data["best_genome"]) == 26
    else:
        assert response.status_code == 404

def test_evolution_db_storage():
    """TC-1341: 基因數據存儲 - 模擬存入一筆測試數據"""
    test_gen = 999
    test_data = {
        "generation": test_gen,
        "best_genome": [0.1] * 26,
        "avg_fitness": 0.5,
        "max_fitness": 0.8
    }
    
    # 建立測試資料 (清理舊數據)
    supabase.table("evolution_history").delete().eq("generation", test_gen).execute()
    
    # 寫入
    res = supabase.table("evolution_history").upsert(test_data).execute()
    assert len(res.data) > 0
    
    # 讀取驗證
    res_get = supabase.table("evolution_history").select("*").eq("generation", test_gen).single().execute()
    assert res_get.data["generation"] == test_gen
    assert len(res_get.data["best_genome"]) == 26
    
    # 清理
    supabase.table("evolution_history").delete().eq("generation", test_gen).execute()
