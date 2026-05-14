from pydantic import BaseModel, Field


class SentimentRequest(BaseModel):
    text: str = Field(min_length=1)


class SentimentResponse(BaseModel):
    label: str  # "positive" | "neutral" | "negative"
    score: float
    confidence: float


class EmbedRequest(BaseModel):
    userId: str
    source: str
    sourceId: str
    text: str = Field(min_length=1)


class EmbedResponse(BaseModel):
    ok: bool
    vectorId: str | None = None


class ChatHistoryItem(BaseModel):
    role: str  # "user" | "assistant"
    text: str


class ChatRequest(BaseModel):
    userId: str
    message: str = Field(min_length=1)
    history: list[ChatHistoryItem] | None = None


class Citation(BaseModel):
    source: str
    sourceId: str
    snippet: str


class ChatResponse(BaseModel):
    reply: str
    citations: list[Citation] | None = None


class WeeklySummaryRequest(BaseModel):
    userId: str
    weekStart: str
    weekEnd: str
    reflections: list[str]


class WeeklySummaryResponse(BaseModel):
    userId: str
    weekStart: str
    weekEnd: str
    summary: str
    highlights: list[str]
