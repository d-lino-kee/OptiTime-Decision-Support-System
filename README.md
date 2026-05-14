# OptiTime — AI Time-Management Decision Support System

OptiTime is a full-stack productivity platform that helps users manage tasks,
focus sessions, and daily reflections — with an AI layer that adds sentiment
analysis, semantic search, and retrieval-augmented coaching over time.

The repo is organised as three deployable services plus shared infra:

```text
optitime/
├─ src/                 # NestJS API           (TypeScript, Mongo, BullMQ, Firebase Auth)
├─ apps/web/            # Next.js 16 web app   (TypeScript, Tailwind v4, Firebase client)
├─ apps/ai-service/     # FastAPI AI service   (Python 3.11, Weaviate, RAG)
└─ docker-compose.dev.yml   # mongo + redis + weaviate + ai sidecar
```

## Features

| Surface | What it does |
| --- | --- |
| **Tasks** | CRUD with priority, difficulty, type, due date, est. minutes, tags |
| **Focus sessions** | Start/end deep-work sessions with interruption count + notes |
| **Reflections** | Free-text daily check-ins, auto-tagged with sentiment by the AI worker |
| **Dashboard** | Aggregate view across tasks / sessions / latest reflection mood |
| **Chat coach** | RAG over the user's own reflections + tasks, grounded responses + citations |
| **Weekly summary** | Cron-triggered job that summarises a week of reflections into highlights |

## Architecture

```text
                ┌──────────────┐
                │  Next.js Web │   (Firebase email/password auth, Tailwind UI)
                └──────┬───────┘
                       │ HTTPS + Firebase ID token
                       ▼
                ┌──────────────┐         ┌────────────┐
                │  NestJS API  │ ─────▶  │  MongoDB   │   tasks, sessions, reflections, users
                │   (Express)  │         └────────────┘
                └──┬─────┬─────┘
                   │     │ enqueue
                   │     ▼
                   │  ┌────────────┐         ┌────────────┐
                   │  │  BullMQ    │ ◀────▶  │   Redis    │
                   │  │  (Redis)   │         └────────────┘
                   │  └─────┬──────┘
                   │        │ processor → HMAC-signed POST
                   ▼        ▼
                ┌──────────────────┐         ┌────────────┐
                │  FastAPI AI svc  │ ─────▶  │  Weaviate  │   embeddings + metadata
                │  sentiment, RAG, │         └────────────┘
                │  weekly summary  │
                └──────────────────┘
```

**Auth.** The web app signs in with Firebase. Every API request carries a
Firebase ID token; the NestJS `FirebaseAuthGuard` verifies it via the Admin SDK
and find-or-creates the matching Mongo `User`. All controllers receive the
authenticated user via the `@ReqUser()` decorator.

**Service-to-service auth.** The NestJS API signs each request to the FastAPI
sidecar with an HMAC-SHA256 over `${timestamp}.${jsonBody}`. The AI service
verifies the signature and rejects stale timestamps to defeat replay.

**Background work.** Reflections and tasks enqueue `sentiment` and `embed-user-data`
jobs on create/update. BullMQ workers (in-process, registered alongside the
producers) call the AI service and write the results back to Mongo or Weaviate.
Two repeating jobs are registered at boot: a weekly summary cron and a nightly
personalization refresh.

## Backend layout

```text
src/
├─ app.module.ts
├─ main.ts                  # global ValidationPipe, exception filter, request id, Swagger
├─ auth/                    # Firebase Admin guard, /auth/me
├─ chat/                    # POST /v1/chat → AI service
├─ common/                  # decorators (@ReqUser, @Public), filter, interceptor
├─ config/                  # zod-validated env + AppConfigService
├─ health/                  # /health, /health/ping
├─ integrations/
│  ├─ ai/                   # HMAC-signed AI service client
│  └─ mongo/                # Mongoose root module
├─ jobs/
│  ├─ jobs.service.ts       # queue producers + cron registrations
│  ├─ queues.ts             # queue/job names, payload types
│  └─ processors/           # BullMQ workers (sentiment, embeddings, weekly, personalization)
├─ reflections/             # schema + DTOs + service + controller
├─ sessions/                # focus session module
├─ tasks/                   # tasks module
└─ users/                   # /users/me (get + patch) + firebase find-or-create
```

Every domain follows the same shape: `controller` ↔ `service` ↔ `schema`, with
`dto/` for `class-validator`-decorated request bodies. The global
`ValidationPipe` enforces whitelist + `forbidNonWhitelisted`, so unknown
fields are rejected.

## Quick start

### 1. Infrastructure (mongo + redis + weaviate + ai)

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. NestJS API

```bash
cp .env.example .env             # then fill in FIREBASE_PROJECT_ID
pnpm install
pnpm start:dev
```

Swagger UI: <http://localhost:3001/docs>

The API uses Firebase Admin. Authenticate the host with either:

- `gcloud auth application-default login` (recommended for dev), or
- `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`

### 3. Next.js web app

```bash
cd apps/web
cp .env.local.example .env.local   # fill in Firebase web config
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

### 4. AI service (already started by docker compose)

To run outside Docker:

```bash
cd apps/ai-service
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Scripts

| Where             | Command            | What it does                          |
| ----------------- | ------------------ | ------------------------------------- |
| repo root         | `pnpm start:dev`   | NestJS API with watch mode            |
| repo root         | `pnpm build`       | NestJS production build               |
| repo root         | `pnpm lint`        | ESLint                                |
| `apps/web`        | `pnpm dev`         | Next.js dev server                    |
| `apps/web`        | `pnpm build`       | Next.js production build              |
| `apps/ai-service` | `uvicorn ...`      | FastAPI dev server (see above)        |

## Tech stack

- **API**: NestJS 10, TypeScript, Mongoose 8, BullMQ 5, class-validator, Zod env validation, Helmet, Swagger
- **Web**: Next.js 16, React 19, TypeScript, Tailwind v4, lucide-react, Firebase JS SDK
- **AI**: FastAPI, Pydantic v2, optional Transformers + sentence-transformers + Weaviate client
- **Infra**: MongoDB 7, Redis 7, Weaviate 1.27, Firebase Auth

## What's MVP vs real-model

The AI service ships in a deterministic "lightweight" mode by default — lexicon
sentiment, in-memory vector store, templated chat responses — so the full
end-to-end flow runs locally with zero GPU. Flipping
`ENABLE_REAL_MODELS=true` and `ENABLE_WEAVIATE=true` in
`apps/ai-service/.env` swaps in HuggingFace sentiment, sentence-transformer
embeddings, and a real Weaviate client. The NestJS / web contracts do not
change between modes.

## Project timeline

Built Sep 2025 – Jan 2026 as a portfolio project demonstrating clean modular
backend design, async job processing, AI service integration patterns, and a
production-quality web UX.
