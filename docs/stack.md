
---

## `docs/stack.md`
```markdown
# OptiTime Stack Documentation

This document explains the technology choices for OptiTime and how each component fits together.

## 1) Frontends

### Web: Next.js + Tailwind CSS
**Why**
- Production-grade React framework with routing, server components, and great DX
- Tailwind enables fast iteration and a modern “portfolio-ready” design system

**Responsibilities**
- UI for tasks, schedule, analytics dashboards, and chatbot
- Calls backend API via typed client (shared DTOs in `packages/shared`)

### Mobile: Native iOS (Swift/SwiftUI) + Android (Kotlin/Jetpack Compose)
**Why**
- Demonstrates real native engineering skills (not only cross-platform frameworks)
- SwiftUI + Compose produce modern, fluid UIs and are great for polished demos

**Responsibilities**
- Mobile-first task capture and focus sessions
- Offline-first patterns where helpful (optional)
- Uses the same API contract as the web client

---

## 2) Backend API: NestJS (TypeScript)

**Why**
- Strong modular architecture (controllers/services/modules)
- Dependency injection and patterns commonly used in industry
- Works well with job queues and scalable service design

**Responsibilities**
- Auth/session management (pluggable)
- CRUD for tasks, schedules, focus sessions, reflections
- Analytics endpoints (weekly stats, streaks, distributions)
- Enqueues background work into BullMQ (Redis)
- Server-to-server calls to AI service (FastAPI)

---

## 3) Datastores

### MongoDB (system of record)
**Why**
- Flexible document model fits tasks/reflections/sessions well
- Easy iteration as the schema evolves
- Great for event-style collections (activity logs)

**What it stores**
- Users
- Tasks + schedules
- Focus sessions
- Reflections/check-ins
- AI outputs (sentiment scores, summaries, recommendation snapshots)

### Weaviate (vector database)
**Why**
- Purpose-built semantic retrieval: “ask about my week”
- Supports long-term memory for chatbot (embeddings + metadata filters)

**What it stores**
- Embedded chunks of user data (reflections, session notes, task summaries)
- Metadata for filtering (userId, date range, type, source)

---

## 4) AI/ML Service: FastAPI (Python)

**Why**
- Python ecosystem is ideal for NLP/ML workflows
- Isolating AI from the main API is a real-world architecture pattern

**AI capabilities**
1. **Sentiment analysis**
   - Produces sentiment score/label/confidence for reflections/check-ins
2. **Common-sense question flow**
   - A state-machine-like flow to ask practical coaching questions
3. **Personalization engine**
   - Generates recommendations (e.g., “schedule deep work earlier”)
4. **RAG over user data**
   - Retrieves relevant chunks from Weaviate and generates grounded responses
5. **Weekly review**
   - Summarizes patterns, mood trends, and productivity insights

**Deployment**
- Dockerized FastAPI service deployed to Railway

---

## 5) Background Jobs: Redis + BullMQ

**Why**
- Keeps API fast and responsive
- Job-driven architecture demonstrates production thinking

**Jobs (examples)**
- `embed_user_data`: create embeddings and upsert into Weaviate
- `weekly_summary`: generate weekly review and store in MongoDB
- `sentiment_batch`: batch analyze reflections for sentiment
- `personalization_update`: refresh user recommendation model

---

## 6) Deployment: Railway

**Why**
- Simple, modern PaaS for multi-service deployments
- Easy env var management and logs per service

**Services**
- `api` (NestJS)
- `ai` (FastAPI, Docker)
- `worker` (BullMQ worker, Node/TS)
- `redis` (Railway-managed)
- MongoDB typically via MongoDB Atlas (recommended)
- Weaviate via Weaviate Cloud or container deployment

---

## 7) Security Model (recommended baseline)
- Service-to-service authentication between API and AI (HMAC or JWT)
- Strict user-scoped data access in MongoDB queries
- Weaviate queries always filtered by `userId` metadata

---

## 8) Observability (recommended)
- Structured logs in API/AI/Worker
- Error tracking (Sentry) and request tracing (OpenTelemetry) as a stretch goal