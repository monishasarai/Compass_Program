import pytest
from app.services.claim_extraction_service import claim_extraction_service
from app.services.scoring_service import scoring_service
from app.services.hallucination_service import hallucination_service
from app.services.verification_service import verification_service
from app.models import AtomicClaim, ClaimVerdict, GroundTruthChunk

def test_claim_extraction_service():
    sample_text = "Valid8 provides 99.4% factual accuracy for LLMs. It was launched in 2026 by Enterprise AI Security."
    claims = claim_extraction_service.extract_claims(sample_text)
    assert isinstance(claims, list)
    assert len(claims) > 0
    assert claims[0].claim_id.startswith("claim-")
    assert len(claims[0].text) > 0

def test_scoring_service():
    sample_verdict = ClaimVerdict(
        claim_id="c1",
        claim_text="Valid8 ensures factuality.",
        status="Supported",
        confidence=0.95,
        evidence=[],
        explanation="Direct match found in knowledge base."
    )
    sample_gt = GroundTruthChunk(
        chunk_id="gt1",
        doc_id="doc1",
        doc_title="Valid8 Whitepaper",
        content="Valid8 ensures complete factual accuracy and safety for corporate LLM deployments.",
        category="Policy",
        citation_id="[1]"
    )
    
    metrics = scoring_service.compute_all_metrics(
        verdicts=[sample_verdict],
        gt_chunks=[sample_gt],
        answer_sentences=["Valid8 ensures factuality."]
    )
    
    assert "overall_confidence_score" in metrics
    assert "accuracy_gauge" in metrics
    assert "radar_metrics" in metrics
    assert "hallucination_heatmap" in metrics
    assert "semantic_similarity_matrix" in metrics

def test_hallucination_service():
    sample_verdict = ClaimVerdict(
        claim_id="c1",
        claim_text="The earth is flat.",
        status="Contradicted",
        confidence=0.98,
        evidence=[],
        explanation="Contradicted by scientific consensus."
    )
    diffs = hallucination_service.compute_token_diffs("The earth is flat.", [sample_verdict])
    assert isinstance(diffs, list)
    assert len(diffs) > 0
    assert diffs[0].token is not None
    assert diffs[0].type in ["correct", "incorrect", "unsupported", "missing"]
