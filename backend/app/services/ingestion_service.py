import os
import json
import uuid
import re
import math
import datetime
from typing import List, Dict, Any, Optional
from app.config import config
from app.models import DocumentMetadata, GroundTruthChunk, IngestionRequest

class IngestionService:
    def __init__(self):
        self.meta_file = os.path.join(config.DATA_DIR, "ground_truth_meta.json")
        self.chunks_file = os.path.join(config.DATA_DIR, "ground_truth_chunks.json")
        self._ensure_storage()

    def _ensure_storage(self):
        os.makedirs(config.DATA_DIR, exist_ok=True)
        if not os.path.exists(self.meta_file) or not os.path.exists(self.chunks_file):
            self._seed_default_ground_truth()

    def _seed_default_ground_truth(self):
        default_docs = [
            {
                "doc_id": "gt-doc-001",
                "title": "Valid8 Enterprise Security & Compliance Policy 2026",
                "category": "Policy",
                "version": "2.4",
                "upload_time": "2026-01-10T10:00:00Z",
                "source_trust_score": 0.99,
                "content": """
Valid8 Enterprise Policy v2.4 (Effective Jan 2026).
1. Data Encryption Standards: All customer data in transit must be encrypted using TLS 1.3 with AES-256-GCM cipher suites. Data at rest must utilize FIPS 140-3 validated KMS modules with 90-day automatic key rotation.
2. Authentication & MFA: Multi-Factor Authentication (MFA) via TOTP or FIDO2 WebAuthn hardware keys is mandatory for all employee accounts. Passwordless access is permitted only via certified Okta SSO endpoints.
3. Data Retention & Privacy: Audit logs are stored in immutable AWS S3 Glacier WORM buckets for exactly 7 years. User personal identifiable information (PII) must be purged within 30 days upon formal GDPR right-to-be-forgotten request.
4. Incident Response SLA: Critical Severity 1 security incidents must be acknowledged by SecOps within 15 minutes and contained within 2 hours. Root Cause Analysis (RCA) report must be published to executive stakeholders within 72 hours.
5. Vendor Risk Assessment: Third-party API providers (OpenAI, Anthropic, Gemini) must undergo semi-annual SOC 2 Type II audits and possess ISO 27001 certifications.
"""
            },
            {
                "doc_id": "gt-doc-002",
                "title": "BioGen AI Clinical Trial Results (Phase III - NeuroVax)",
                "category": "Medical Research",
                "version": "1.0",
                "upload_time": "2026-02-14T08:30:00Z",
                "source_trust_score": 0.97,
                "content": """
BioGen NeuroVax-3 Phase III Clinical Trial Final Summary Report.
Study Objective: Evaluate efficacy of NeuroVax-3 in slowing cognitive decline in early-stage Alzheimer's patients.
Sample Size: 1,850 participants enrolled across 42 medical centers in North America and Europe. Participant age range: 60 to 82 years old (mean age 71.4).
Primary Endpoint Results: At 78 weeks, treatment arm demonstrated a 34.2% reduction in clinical dementia rating sum of boxes (CDR-SB) compared to placebo (p < 0.001).
Secondary Endpoints: Amyloid plaque clearance measured via PET scan showed a 68.5% reduction in brain amyloid burden at month 12.
Safety Profile: Amyloid-Related Imaging Abnormalities (ARIA-E) occurred in 12.4% of treated patients (versus 1.8% placebo), of which 84% were asymptomatic and resolved within 8 weeks of temporary dosing suspension.
FDA Approval Status: Fast-Track Designation granted by FDA in Nov 2025; BLA submission scheduled for Q3 2026.
"""
            },
            {
                "doc_id": "gt-doc-003",
                "title": "Global Tech Corp Q4 2025 Financial Statement & Revenue Report",
                "category": "Financial Statement",
                "version": "1.1",
                "upload_time": "2026-01-28T16:00:00Z",
                "source_trust_score": 0.98,
                "content": """
Global Tech Corp Q4 2025 Earnings Release.
Consolidated Revenue: Q4 2025 total revenue reached $18.4 billion, representing a 21.5% YoY growth (compared to $15.15 billion in Q4 2024). Full year 2025 total revenue reached $67.8 billion.
Segment Breakdown: Cloud Infrastructure revenue was $8.2 billion (+31% YoY). AI Platform & SaaS solutions revenue was $4.7 billion (+45% YoY). Hardware & Devices was $5.5 billion (+2% YoY).
Net Income & Margin: Net Income for Q4 was $4.1 billion ($2.85 per diluted share), expanding operating margin to 28.4%. Free cash flow reached $5.6 billion for the quarter.
Operating Costs: R&D expenditure increased to $3.2 billion (17.4% of total revenue), primarily driven by GPU cluster expansion (NVIDIA H200 & Blackwell deployment) and AI research talent acquisition.
Capital Allocation: Board of Directors approved an additional $10.0 billion share repurchase program and declared a quarterly dividend of $0.45 per share.
"""
            },
            {
                "doc_id": "gt-doc-004",
                "title": "Quantum Computing Architecture & QPU Specs 2026",
                "category": "Tech Specs",
                "version": "3.0",
                "upload_time": "2026-03-01T12:00:00Z",
                "source_trust_score": 0.96,
                "content": """
SuperQ-1000 Transmon Qubit Quantum Processor Architecture Manual.
Processor Specs: 1,152 physical superconducting transmon qubits operating at 15 millikelvin in a dilution refrigerator.
Gate Fidelities: Single-qubit gate fidelity average is 99.94%. Two-qubit CZ gate fidelity average is 99.62% with readout fidelity of 99.1%.
Coherence Times: T1 relaxation time averages 280 microseconds; T2 echo phase coherence time averages 320 microseconds.
Error Correction Code: Implements surface code (distance d=7), requiring 49 physical qubits per logical qubit, yielding a logical qubit error rate below 10^-6.
Control System: Microwave pulse modulation controlled via direct digital synthesis at 4.8 GHz to 6.2 GHz carrier frequencies.
"""
            }
        ]

        docs_meta = {}
        all_chunks = []

        for d in default_docs:
            chunks = self._chunk_text(d["content"], chunk_size=350, chunk_overlap=50)
            chunk_objs = []
            for idx, c in enumerate(chunks):
                cid = f"{d['doc_id']}-c{idx+1}"
                chunk_objs.append({
                    "chunk_id": cid,
                    "doc_id": d["doc_id"],
                    "doc_title": d["title"],
                    "content": c,
                    "category": d["category"],
                    "metadata": {"version": d["version"], "index": idx},
                    "citation_id": f"[{d['title']} §{idx+1}]"
                })
            
            docs_meta[d["doc_id"]] = {
                "doc_id": d["doc_id"],
                "title": d["title"],
                "category": d["category"],
                "version": d["version"],
                "upload_time": d["upload_time"],
                "source_trust_score": d["source_trust_score"],
                "chunk_count": len(chunk_objs)
            }
            all_chunks.extend(chunk_objs)

        with open(self.meta_file, "w") as f:
            json.dump(docs_meta, f, indent=2)

        with open(self.chunks_file, "w") as f:
            json.dump(all_chunks, f, indent=2)

    def _chunk_text(self, text: str, chunk_size: int = 350, chunk_overlap: int = 50) -> List[str]:
        paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
        chunks = []
        curr = ""
        for p in paragraphs:
            if len(curr) + len(p) <= chunk_size:
                curr += " " + p if curr else p
            else:
                if curr:
                    chunks.append(curr.strip())
                curr = p
        if curr:
            chunks.append(curr.strip())
        return chunks if chunks else [text.strip()]

    def list_documents(self) -> List[DocumentMetadata]:
        try:
            with open(self.meta_file, "r") as f:
                data = json.load(f)
                return [DocumentMetadata(**v) for v in data.values()]
        except Exception:
            return []

    def get_all_chunks(self) -> List[GroundTruthChunk]:
        try:
            with open(self.chunks_file, "r") as f:
                data = json.load(f)
                return [GroundTruthChunk(**c) for c in data]
        except Exception:
            return []

    def ingest_document(self, req: IngestionRequest) -> DocumentMetadata:
        doc_id = f"gt-doc-{uuid.uuid4().hex[:6]}"
        chunks = self._chunk_text(req.content)
        
        chunk_objs = []
        for idx, c in enumerate(chunks):
            cid = f"{doc_id}-c{idx+1}"
            chunk_objs.append({
                "chunk_id": cid,
                "doc_id": doc_id,
                "doc_title": req.title,
                "content": c,
                "category": req.category,
                "metadata": req.metadata or {"index": idx},
                "citation_id": f"[{req.title} §{idx+1}]"
            })

        # Save metadata
        docs_meta = {}
        if os.path.exists(self.meta_file):
            with open(self.meta_file, "r") as f:
                docs_meta = json.load(f)

        meta = {
            "doc_id": doc_id,
            "title": req.title,
            "category": req.category,
            "version": "1.0",
            "upload_time": datetime.datetime.utcnow().isoformat() + "Z",
            "source_trust_score": 0.98,
            "chunk_count": len(chunk_objs)
        }
        docs_meta[doc_id] = meta

        with open(self.meta_file, "w") as f:
            json.dump(docs_meta, f, indent=2)

        # Save chunks
        all_chunks = []
        if os.path.exists(self.chunks_file):
            with open(self.chunks_file, "r") as f:
                all_chunks = json.load(f)
        all_chunks.extend(chunk_objs)

        with open(self.chunks_file, "w") as f:
            json.dump(all_chunks, f, indent=2)

        return DocumentMetadata(**meta)

    def ingest_wikipedia_page(self, title: str) -> Optional[DocumentMetadata]:
        from app.services.wikipedia_service import wikipedia_service
        article = wikipedia_service.fetch_live_wikipedia_article(title)
        if not article or not article.get("content"):
            search_res = wikipedia_service.search_wikipedia_topics(title, limit=1)
            if search_res:
                article = wikipedia_service.fetch_live_wikipedia_article(search_res[0]["title"])

        if not article or not article.get("content"):
            return None
        
        req = IngestionRequest(
            title=article["title"],
            category="Wikipedia Live Data",
            content=article["content"],
            metadata={"url": article.get("url"), "source": "Wikipedia REST API"}
        )
        return self.ingest_document(req)

ingestion_service = IngestionService()
