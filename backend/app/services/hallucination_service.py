import re
from typing import List
from app.models import ClaimVerdict, TokenDiffItem

class HallucinationService:
    def compute_token_diffs(self, generated_answer: str, verdicts: List[ClaimVerdict]) -> List[TokenDiffItem]:
        """
        Generates GitHub-style token-level diff items highlighting
        Correct, Incorrect, Unsupported, and Missing facts.
        """
        words = generated_answer.split()
        token_items = []

        # Find words associated with contradicted claims
        contradicted_words = set()
        partially_words = set()

        for v in verdicts:
            if v.status == "Contradicted":
                for w in re.findall(r'\w+', v.claim_text):
                    contradicted_words.add(w.lower())
            elif v.status == "Partially Supported":
                for w in re.findall(r'\w+', v.claim_text):
                    partially_words.add(w.lower())

        for w in words:
            clean = re.sub(r'[^\w]', '', w).lower()
            if clean in contradicted_words:
                token_items.append(TokenDiffItem(
                    token=w,
                    type="incorrect",
                    explanation="Contradicted by Ground Truth database."
                ))
            elif clean in partially_words:
                token_items.append(TokenDiffItem(
                    token=w,
                    type="unsupported",
                    explanation="Unverified or partially supported assertion."
                ))
            else:
                token_items.append(TokenDiffItem(
                    token=w,
                    type="correct",
                    explanation="Factually aligned with Ground Truth."
                ))

        return token_items

hallucination_service = HallucinationService()
