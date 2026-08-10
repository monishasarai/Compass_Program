import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_leaderboard_endpoint():
    res = client.get("/api/v1/leaderboard")
    assert res.status_code == 200
    leaderboard = res.json()
    assert isinstance(leaderboard, list)
    assert len(leaderboard) > 0
    assert "model_name" in leaderboard[0]
    assert "faithfulness_score" in leaderboard[0]

def test_verification_pipeline_run():
    # Login to get authorization header
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@valid8.ai", "password": "AdminValid8@2026"})
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    verify_payload = {
        "query": "What are the core requirements for AI safety and transparency?",
        "model": "GPT-4o"
    }

    res_verify = client.post("/api/v1/verify", json=verify_payload, headers=headers)
    assert res_verify.status_code == 200
    report = res_verify.json()

    assert "verification_id" in report
    assert report["query"] == verify_payload["query"]
    assert report["selected_model"] == "GPT-4o"
    assert isinstance(report["generated_answer"], str)
    assert len(report["generated_answer"]) > 0
    assert 0 <= report["overall_confidence_score"] <= 100
    assert 0 <= report["accuracy_gauge"] <= 100
    assert "radar_metrics" in report
    assert isinstance(report["extracted_claims"], list)
    assert isinstance(report["claim_verdicts"], list)
    assert isinstance(report["hallucination_heatmap"], list)
    assert isinstance(report["semantic_similarity_matrix"], list)
    assert isinstance(report["missing_knowledge"], list)
    assert isinstance(report["token_diffs"], list)
    assert isinstance(report["improved_answer"], str)
