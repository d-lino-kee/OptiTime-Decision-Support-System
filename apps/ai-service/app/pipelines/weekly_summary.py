"""
Weekly summary generation.

MVP: deterministic template that picks the longest and most sentiment-charged
reflections from the week. Designed to be replaced with an LLM call later
without changing the request/response contract.
"""
from __future__ import annotations

from . import sentiment


def summarize(reflections: list[str]) -> tuple[str, list[str]]:
    if not reflections:
        return "No reflections were logged this week.", []

    scored: list[tuple[float, str]] = []
    pos_count = 0
    neg_count = 0
    for r in reflections:
        label, score, _ = sentiment.analyze(r)
        if label == "positive":
            pos_count += 1
        elif label == "negative":
            neg_count += 1
        scored.append((abs(score), r))

    scored.sort(key=lambda x: x[0], reverse=True)
    highlights = [r for _, r in scored[:3]]

    mood = (
        "mostly positive" if pos_count > neg_count
        else "mostly negative" if neg_count > pos_count
        else "mixed"
    )
    summary = (
        f"This week you logged {len(reflections)} reflection"
        f"{'s' if len(reflections) != 1 else ''}. Overall mood was {mood} "
        f"({pos_count} positive, {neg_count} negative)."
    )
    return summary, highlights
