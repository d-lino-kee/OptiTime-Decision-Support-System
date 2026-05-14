"""
Sentiment analysis pipeline.

Real-model path: HuggingFace Transformers (distilbert SST-2 or cardiffnlp twitter-roberta).
Lightweight default: deterministic lexicon scoring so the service runs locally
without GPU/model downloads. Toggle via settings.enable_real_models.
"""
from __future__ import annotations

import re
from functools import lru_cache

from ..settings import settings

POSITIVE = {
    "good", "great", "love", "happy", "win", "wins", "win!", "productive",
    "focused", "calm", "proud", "grateful", "energized", "progress", "done",
    "easy", "smooth", "clear",
}
NEGATIVE = {
    "bad", "terrible", "anxious", "tired", "stressed", "lost", "behind",
    "hate", "distracted", "overwhelmed", "burnout", "stuck", "fail", "missed",
    "hard", "exhausted", "frustrated",
}

_TOKEN = re.compile(r"[a-zA-Z']+")


@lru_cache(maxsize=1)
def _real_pipeline():  # pragma: no cover - heavy import path
    from transformers import pipeline

    return pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")


def _lexicon_sentiment(text: str) -> tuple[str, float, float]:
    tokens = [t.lower() for t in _TOKEN.findall(text)]
    if not tokens:
        return "neutral", 0.0, 0.0

    pos = sum(1 for t in tokens if t in POSITIVE)
    neg = sum(1 for t in tokens if t in NEGATIVE)
    total = pos + neg
    if total == 0:
        return "neutral", 0.0, 0.3

    score = (pos - neg) / max(len(tokens), 1)  # in [-1, 1]
    confidence = min(1.0, total / 5)
    if score > 0.05:
        label = "positive"
    elif score < -0.05:
        label = "negative"
    else:
        label = "neutral"
    return label, round(score, 3), round(confidence, 3)


def analyze(text: str) -> tuple[str, float, float]:
    if settings.enable_real_models:  # pragma: no cover - real path
        out = _real_pipeline()(text[:512])[0]
        label = "positive" if out["label"].upper().startswith("POS") else "negative"
        score = float(out["score"]) if label == "positive" else -float(out["score"])
        return label, round(score, 3), round(float(out["score"]), 3)
    return _lexicon_sentiment(text)
