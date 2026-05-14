"""
Retrieval-augmented generation for the chat endpoint.

In MVP mode we run a deterministic templated response that quotes the user's
own retrieved context. The structure (retrieve -> ground -> generate) mirrors
what a real LLM call would look like and is ready to swap in an LLM later.
"""
from __future__ import annotations

from . import embeddings


def answer(user_id: str, message: str, history: list[dict] | None = None) -> tuple[str, list[dict]]:
    hits = embeddings.search(user_id, message, limit=3)
    citations = [
        {"source": h["source"], "sourceId": h["sourceId"], "snippet": h["text"][:140]}
        for h in hits
    ]

    if not hits:
        reply = (
            "I don't have enough of your reflections or tasks yet to give a grounded answer. "
            "Try logging a few reflections and tasks, then ask again — I'll cite specifics."
        )
        return reply, citations

    summary = "; ".join(h["text"][:80].replace("\n", " ") for h in hits)
    reply = (
        f"Looking at what you've logged: {summary}. "
        "Based on these patterns, prioritise the highest-leverage task next and "
        "leave time for a short reflection at the end of the day."
    )
    return reply, citations
