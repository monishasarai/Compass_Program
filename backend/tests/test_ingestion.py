import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_and_ingest_documents():
    # 1. List existing documents
    res_list = client.get("/api/v1/documents")
    assert res_list.status_code == 200
    docs = res_list.json()
    assert isinstance(docs, list)

    # 2. Ingest custom document
    ingest_payload = {
        "title": "Test AI Ethics Guidelines",
        "category": "Policy",
        "content": "AI systems must ensure transparency, accountability, fairness, and safety at all times. Hallucination detection is critical for trustworthy AI.",
        "metadata": {"author": "QA Team", "version": "1.0"}
    }
    res_ingest = client.post("/api/v1/documents/ingest", json=ingest_payload)
    assert res_ingest.status_code == 200
    doc_meta = res_ingest.json()
    assert doc_meta["title"] == "Test AI Ethics Guidelines"
    assert doc_meta["category"] == "Policy"
    assert doc_meta["chunk_count"] > 0

def test_wikipedia_search():
    res_search = client.get("/api/v1/documents/wikipedia/search?query=Artificial Intelligence")
    assert res_search.status_code == 200
    results = res_search.json()
    assert isinstance(results, list)
    if len(results) > 0:
        assert "title" in results[0]
