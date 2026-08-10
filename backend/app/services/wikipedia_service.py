import httpx
import re
import uuid
import datetime
from typing import List, Dict, Any, Optional

class WikipediaService:
    """
    Real-Time Wikipedia & Web Knowledge Retriever Service.
    Fetches live article summaries, lead sections, and paragraphs directly from Wikipedia API
    to expand Ground Truth verification context dynamically beyond PDFs/documents.
    """
    def __init__(self):
        self.api_url = "https://en.wikipedia.org/w/api.php"
        self.rest_url = "https://en.wikipedia.org/api/rest_v1/page/summary/"

    def search_wikipedia_topics(self, query: str, limit: int = 5) -> List[Dict[str, str]]:
        """Search Wikipedia for matching page titles."""
        headers = {"User-Agent": "Valid8Bot/2.0 (http://localhost:3000; contact@valid8.ai)"}
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": limit
        }
        try:
            res = httpx.get(self.api_url, params=params, headers=headers, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                results = data.get("query", {}).get("search", [])
                return [
                    {
                        "title": r["title"],
                        "snippet": re.sub(r'<[^>]+>', '', r["snippet"]),
                        "pageid": str(r["pageid"])
                    }
                    for r in results
                ]
        except Exception as e:
            print(f"[WikipediaService] Search Error: {e}")
        return []

    def fetch_live_wikipedia_article(self, title: str) -> Optional[Dict[str, Any]]:
        """Fetch full extract and lead summary for a specific Wikipedia title."""
        headers = {"User-Agent": "Valid8Bot/2.0 (http://localhost:3000; contact@valid8.ai)"}
        params = {
            "action": "query",
            "prop": "extracts",
            "exintro": True,
            "explaintext": True,
            "titles": title,
            "format": "json"
        }
        try:
            res = httpx.get(self.api_url, params=params, headers=headers, timeout=10.0)
            if res.status_code == 200:
                pages = res.json().get("query", {}).get("pages", {})
                for page_id, page_data in pages.items():
                    if page_id != "-1":
                        extract = page_data.get("extract", "")
                        return {
                            "doc_id": f"wiki-{uuid.uuid4().hex[:8]}",
                            "title": f"Wikipedia: {page_data.get('title')}",
                            "content": extract,
                            "category": "Wikipedia Live Data",
                            "source_trust_score": 0.98,
                            "url": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
                        }
        except Exception as e:
            print(f"[WikipediaService] Fetch Error: {e}")
        return None

    def auto_fetch_realtime_evidence(self, query: str) -> List[Dict[str, Any]]:
        """
        On-the-fly Real-Time Evidence Fetcher:
        Extracts key entities from user query, queries Wikipedia REST API, and returns candidate evidence chunks.
        """
        search_results = self.search_wikipedia_topics(query, limit=2)
        evidence_chunks = []
        
        for item in search_results:
            article = self.fetch_live_wikipedia_article(item["title"])
            if article and article["content"]:
                # Split extract into 250-word chunks
                words = article["content"].split()
                chunk_size = 200
                for i in range(0, len(words), chunk_size):
                    chunk_text = " ".join(words[i:i+chunk_size])
                    if len(chunk_text.strip()) > 30:
                        evidence_chunks.append({
                            "chunk_id": f"wiki-chunk-{uuid.uuid4().hex[:6]}",
                            "doc_id": article["doc_id"],
                            "doc_title": article["title"],
                            "content": chunk_text,
                            "category": "Wikipedia Live Data",
                            "citation_id": f"[{article['title']} §{i//chunk_size + 1}]",
                            "metadata": {"url": article["url"], "fetch_time": datetime.datetime.utcnow().isoformat()}
                        })
        return evidence_chunks

wikipedia_service = WikipediaService()
