import re
import uuid
from typing import List
from app.models import AtomicClaim, EntityExtraction

class ClaimExtractionService:
    def extract_claims(self, generated_answer: str) -> List[AtomicClaim]:
        """
        Splits LLM generated answer into discrete atomic factual statements
        and extracts NER metadata (Entities, Numbers, Dates, Orgs, Locations, Relations).
        """
        # Split sentences reliably
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', generated_answer) if len(s.strip()) > 10]
        
        claims = []
        for idx, sentence in enumerate(sentences):
            cid = f"claim-{idx+1}"
            entities = self._extract_entities(sentence)
            
            numbers = [e.text for e in entities if e.type == "NUMBER"]
            dates = [e.text for e in entities if e.type == "DATE"]
            orgs = [e.text for e in entities if e.type == "ORG"]
            locs = [e.text for e in entities if e.type == "GPE"]
            relations = self._extract_relations(sentence)

            claims.append(AtomicClaim(
                claim_id=cid,
                text=sentence,
                entities=entities,
                relationships=relations,
                numbers=numbers,
                dates=dates,
                organizations=orgs,
                locations=locs
            ))

        return claims

    def _extract_entities(self, text: str) -> List[EntityExtraction]:
        entities = []
        
        # Regex patterns for fast, robust entity extraction
        # Dates (e.g. 1947, Jan 2026, Q4 2025, 78 weeks, Q3 2026)
        date_pattern = r'\b(19\d\d|20\d\d|Q[1-4]\s?\d\d\d\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d+\s+(weeks|months|years|days))\b'
        for m in re.finditer(date_pattern, text, re.IGNORECASE):
            entities.append(EntityExtraction(text=m.group(0), type="DATE", start=m.start(), end=m.end()))

        # Numbers & Percentages (e.g. 34.2%, 18.4 billion, 7 years, 1,850, $10.0 billion, 99.94%)
        num_pattern = r'\b(\$?\d+([.,]\d+)?\s*(%|billion|million|k|years|microseconds|mK)?)\b'
        for m in re.finditer(num_pattern, text, re.IGNORECASE):
            if not any(e.start == m.start() for e in entities): # avoid dupes
                entities.append(EntityExtraction(text=m.group(0), type="NUMBER", start=m.start(), end=m.end()))

        # Known Organizations & Technologies
        org_keywords = ["Valid8", "AWS", "S3", "Glacier", "BioGen", "FDA", "Global Tech Corp", "NVIDIA", "Okta", "SecOps", "GDPR", "KMS"]
        for org in org_keywords:
            if org in text:
                pos = text.find(org)
                entities.append(EntityExtraction(text=org, type="ORG", start=pos, end=pos+len(org)))

        # Known Locations & Protocols
        loc_keywords = ["North America", "Europe", "New Delhi", "India", "TLS 1.3", "FIPS 140-3", "NeuroVax-3"]
        for loc in loc_keywords:
            if loc in text:
                pos = text.find(loc)
                entities.append(EntityExtraction(text=loc, type="GPE", start=pos, end=pos+len(loc)))

        return entities

    def _extract_relations(self, text: str) -> List[str]:
        relations = []
        low = text.lower()
        if "encrypted using" in low or "requires" in low:
            relations.append("ENCRYPTED_BY")
        if "reduction in" in low or "reduced" in low:
            relations.append("REDUCED_BY_PERCENTAGE")
        if "revenue reached" in low or "total revenue" in low:
            relations.append("HAS_REVENUE")
        if "stored in" in low or "retained for" in low:
            relations.append("RETAINED_PERIOD")
        if "approved" in low or "granted" in low:
            relations.append("REGULATORY_STATUS")
        return relations if relations else ["GENERAL_ASSERTION"]

claim_extraction_service = ClaimExtractionService()
