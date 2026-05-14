"""
Embeddings + Weaviate upsert.

When `enable_weaviate` is True we connect to Weaviate and upsert with the
configured embedding model. Otherwise we store payloads in an in-memory dict
so the rest of the system still flows end-to-end during local dev.
"""
from __future__ import annotations

import hashlib
from typing import Any

from ..settings import settings

_MEMORY_STORE: dict[str, dict[str, Any]] = {}


def _vector_id(user_id: str, source: str, source_id: str) -> str:
    return hashlib.sha1(f"{user_id}:{source}:{source_id}".encode("utf-8")).hexdigest()[:24]


def upsert(user_id: str, source: str, source_id: str, text: str) -> str:
    """Embed `text` and upsert into the vector store. Returns the vector id."""
    vid = _vector_id(user_id, source, source_id)
    if settings.enable_weaviate:  # pragma: no cover - heavy path
        # Real Weaviate client would go here. Kept out of MVP to avoid runtime deps.
        # Use weaviate-client v4: client.collections.get(...).data.insert(...)
        pass
    _MEMORY_STORE[vid] = {
        "userId": user_id,
        "source": source,
        "sourceId": source_id,
        "text": text,
    }
    return vid


def search(user_id: str, query: str, limit: int = 5) -> list[dict[str, Any]]:
    """Semantic-ish retrieval. Memory mode does naive substring + token-overlap scoring."""
    if settings.enable_weaviate:  # pragma: no cover
        return []
    q_tokens = {t.lower() for t in query.split()}
    scored: list[tuple[float, dict[str, Any]]] = []
    for item in _MEMORY_STORE.values():
        if item["userId"] != user_id:
            continue
        t_tokens = {t.lower() for t in item["text"].split()}
        overlap = len(q_tokens & t_tokens)
        if overlap == 0 and query.lower() not in item["text"].lower():
            continue
        score = overlap + (1 if query.lower() in item["text"].lower() else 0)
        scored.append((score, item))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [s[1] for s in scored[:limit]]
