from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime

# --- Auth & User Models ---
class UserRole:
    ADMIN = "admin"
    USER = "user"

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user" # user or admin

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    createdAt: str
    totalVerifications: int = 0
    tokensUsed: int = 0

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    name: str

# --- Ground Truth Ingestion Models ---
class DocumentMetadata(BaseModel):
    doc_id: str
    title: str
    category: str # PDF, Document, SQL, JSON, CSV, Policy, Knowledge Base
    version: str = "1.0"
    upload_time: str
    source_trust_score: float = 0.95
    chunk_count: int = 0

class GroundTruthChunk(BaseModel):
    chunk_id: str
    doc_id: str
    doc_title: str
    content: str
    category: str
    metadata: Dict[str, Any] = {}
    citation_id: str

class IngestionRequest(BaseModel):
    title: str
    category: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

# --- Verification & Pipeline Models ---
class LLMQueryRequest(BaseModel):
    query: str
    model: str = "GPT-4o" # GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, DeepSeek-V3, Llama 3.3, Mistral Large
    ground_truth_doc_ids: Optional[List[str]] = None
    custom_system_prompt: Optional[str] = None
    api_key_override: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = None # List of {"role": "user"/"assistant", "content": "..."}

class EntityExtraction(BaseModel):
    text: str
    type: str # PERSON, ORG, DATE, NUMBER, GPE, POLICY, RELATION
    start: int
    end: int

class AtomicClaim(BaseModel):
    claim_id: str
    text: str
    entities: List[EntityExtraction] = []
    relationships: List[str] = []
    numbers: List[str] = []
    dates: List[str] = []
    organizations: List[str] = []
    locations: List[str] = []

class EvidenceItem(BaseModel):
    chunk_id: str
    doc_title: str
    content: str
    semantic_similarity: float
    cross_encoder_score: float
    source_trust: float
    combined_rank_score: float
    citation: str

class ClaimVerdict(BaseModel):
    claim_id: str
    claim_text: str
    status: str # Supported, Contradicted, Partially Supported, Unknown
    confidence: float # 0.0 - 1.0
    evidence: List[EvidenceItem]
    explanation: str
    contradiction_reason: Optional[str] = None
    nli_scores: Dict[str, float] = {} # entailment, contradiction, neutral

class SentenceHeatmapItem(BaseModel):
    sentence_index: int
    sentence_text: str
    status: str # Supported, Partially Supported, Contradicted, Unsupported
    score: float # 0-100
    top_citation: Optional[str] = None
    explanation: str

class SemanticMatrixCell(BaseModel):
    gt_chunk_id: str
    gt_chunk_title: str
    ans_sentence_idx: int
    similarity: float

class MissingKnowledgeItem(BaseModel):
    concept: str
    type: str # Entity, Relationship, Fact
    gt_reference: str
    impact: str # High, Medium, Low

class TokenDiffItem(BaseModel):
    token: str
    type: str # correct, incorrect, unsupported, missing
    explanation: Optional[str] = None

class ModelLeaderboardItem(BaseModel):
    model_name: str
    provider: str
    overall_accuracy: float
    faithfulness_score: float
    coverage_score: float
    hallucination_rate: float
    avg_latency_ms: int
    cost_per_1k_claims: float
    rank: int

class VerificationReport(BaseModel):
    verification_id: str
    query: str
    selected_model: str
    generated_answer: str
    overall_confidence_score: float # 0 - 100
    
    # Visual Analytics Metrics
    accuracy_gauge: float # 0 - 100
    radar_metrics: Dict[str, float] # Coverage, Faithfulness, Completeness, Accuracy, Hallucination, Consistency, Citation Quality
    
    # Phase Outputs
    extracted_claims: List[AtomicClaim]
    claim_verdicts: List[ClaimVerdict]
    hallucination_heatmap: List[SentenceHeatmapItem]
    semantic_similarity_matrix: List[SemanticMatrixCell]
    missing_knowledge: List[MissingKnowledgeItem]
    token_diffs: List[TokenDiffItem]
    
    # Auto Improvement
    improved_answer: str
    improvement_reasons: List[Dict[str, str]]
    
    # Metadata
    execution_time_ms: int
    timestamp: str
