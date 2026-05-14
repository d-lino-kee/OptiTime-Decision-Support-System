# OptiTime AI Service

FastAPI sidecar that powers the AI features of OptiTime:

| Endpoint           | Purpose                                                              |
| ------------------ | -------------------------------------------------------------------- |
| `POST /sentiment`  | Label + score + confidence for a reflection                          |
| `POST /embed`      | Embed task/reflection text and upsert into the vector store          |
| `POST /chat`       | Retrieval-augmented coach reply (Weaviate + grounded generation)     |
| `POST /weekly-summary` | Summarize a week of reflections into highlights + a mood read    |
| `GET  /health`     | Liveness probe                                                       |

All `POST` endpoints require a valid `X-OptiTime-Timestamp` / `X-OptiTime-Signature`
pair, signed with the shared HMAC secret. The NestJS API signs every request via
`AiService` in `src/integrations/ai/ai.service.ts`.

## Run it

```bash
cd apps/ai-service
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Or via Docker (used in `docker-compose.dev.yml`):

```bash
docker compose -f ../../docker-compose.dev.yml up ai
```

## Modes

The service runs in two modes, controlled by env flags:

- **Lightweight (default)** — deterministic lexicon-based sentiment, in-memory
  vector store, templated chat. Zero heavy deps, runs anywhere.
- **Real models** (`ENABLE_REAL_MODELS=true`, `ENABLE_WEAVIATE=true`) — pulls
  HuggingFace Transformers and connects to a real Weaviate instance. Install
  the `ml` extras: `pip install -r requirements.txt && pip install transformers torch sentence-transformers weaviate-client`.

The contracts in `app/models.py` stay identical, so the NestJS callers and
BullMQ workers do not change when you flip modes.
