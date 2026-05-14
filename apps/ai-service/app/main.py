import json

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import JSONResponse

from .models import (
    ChatRequest,
    ChatResponse,
    EmbedRequest,
    EmbedResponse,
    SentimentRequest,
    SentimentResponse,
    WeeklySummaryRequest,
    WeeklySummaryResponse,
)
from .pipelines import embeddings, rag, sentiment, weekly_summary
from .security import verify_hmac

app = FastAPI(
    title="OptiTime AI Service",
    description="Sentiment, embeddings, RAG chat, and weekly-summary endpoints for OptiTime.",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _parse(body: bytes, model_cls):
    try:
        payload = json.loads(body)
    except json.JSONDecodeError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid JSON") from exc
    return model_cls.model_validate(payload)


@app.post("/sentiment", response_model=SentimentResponse)
async def post_sentiment(body: bytes = Depends(verify_hmac)) -> SentimentResponse:
    req = _parse(body, SentimentRequest)
    label, score, confidence = sentiment.analyze(req.text)
    return SentimentResponse(label=label, score=score, confidence=confidence)


@app.post("/embed", response_model=EmbedResponse)
async def post_embed(body: bytes = Depends(verify_hmac)) -> EmbedResponse:
    req = _parse(body, EmbedRequest)
    vector_id = embeddings.upsert(req.userId, req.source, req.sourceId, req.text)
    return EmbedResponse(ok=True, vectorId=vector_id)


@app.post("/chat", response_model=ChatResponse)
async def post_chat(body: bytes = Depends(verify_hmac)) -> ChatResponse:
    req = _parse(body, ChatRequest)
    reply, citations = rag.answer(
        req.userId,
        req.message,
        history=[h.model_dump() for h in (req.history or [])],
    )
    return ChatResponse(reply=reply, citations=citations)


@app.post("/weekly-summary", response_model=WeeklySummaryResponse)
async def post_weekly_summary(body: bytes = Depends(verify_hmac)) -> WeeklySummaryResponse:
    req = _parse(body, WeeklySummaryRequest)
    summary, highlights = weekly_summary.summarize(req.reflections)
    return WeeklySummaryResponse(
        userId=req.userId,
        weekStart=req.weekStart,
        weekEnd=req.weekEnd,
        summary=summary,
        highlights=highlights,
    )


@app.exception_handler(Exception)
async def _unhandled(_, exc: Exception):  # pragma: no cover
    return JSONResponse(
        status_code=500,
        content={"error": "internal", "detail": str(exc)},
    )
