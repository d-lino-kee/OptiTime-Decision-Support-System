# OptiTime

An AI time management decision support system. OptiTime is a full stack productivity platform that helps users plan tasks, run focus sessions, and write daily reflections. An AI layer adds sentiment analysis, semantic search, and retrieval augmented coaching over time.

The repo is organised as three deployable services plus shared infrastructure.

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
| **Tasks** | CRUD with priority, difficulty, type, due date, estimated minutes, and tags |
| **Focus sessions** | Start and end deep work sessions with interruption count and notes |
| **Reflections** | Free text daily check ins, tagged with sentiment by the AI worker |
| **Dashboard** | Aggregate view across tasks, sessions, and latest reflection mood |
| **Chat coach** | RAG over the user's own reflections and tasks, with grounded responses and citations |
| **Weekly summary** | Cron triggered job that summarises a week of reflections into highlights |

## Architecture

```text
                ┌──────────────┐
                │  Next.js Web │   (Firebase email and password auth, Tailwind UI)
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
                   │        │ processor → HMAC signed POST
                   ▼        ▼
                ┌──────────────────┐         ┌────────────┐
                │  FastAPI AI svc  │ ─────▶  │  Weaviate  │   embeddings + metadata
                │  sentiment, RAG, │         └────────────┘
                │  weekly summary  │
                └──────────────────┘
```

**Auth.** The web app signs in with Firebase. Every API request carries a Firebase ID token. The NestJS `FirebaseAuthGuard` verifies it via the Admin SDK and finds or creates the matching Mongo `User`. All controllers receive the authenticated user via the `@ReqUser()` decorator.

**Service to service auth.** The NestJS API signs each request to the FastAPI sidecar using HMAC SHA256 over `${timestamp}.${jsonBody}`. The AI service verifies the signature and rejects stale timestamps to defeat replay.

**Background work.** Reflections and tasks enqueue `sentiment` and `embed-user-data` jobs on create or update. BullMQ workers, registered alongside the producers, call the AI service and write the results back to Mongo or Weaviate. Two repeating jobs are registered at boot. A weekly summary cron and a nightly personalization refresh.

## Backend layout

```text
src/
├─ app.module.ts
├─ main.ts                  # global ValidationPipe, exception filter, request id, Swagger
├─ auth/                    # Firebase Admin guard, /auth/me
├─ chat/                    # POST /v1/chat to AI service
├─ common/                  # decorators (@ReqUser, @Public), filter, interceptor
├─ config/                  # zod validated env + AppConfigService
├─ health/                  # /health, /health/ping
├─ integrations/
│  ├─ ai/                   # HMAC signed AI service client
│  └─ mongo/                # Mongoose root module
├─ jobs/
│  ├─ jobs.service.ts       # queue producers + cron registrations
│  ├─ queues.ts             # queue and job names, payload types
│  └─ processors/           # BullMQ workers (sentiment, embeddings, weekly, personalization)
├─ reflections/             # schema + DTOs + service + controller
├─ sessions/                # focus session module
├─ tasks/                   # tasks module
└─ users/                   # /users/me (get + patch) + firebase find or create
```

Every domain follows the same shape. `controller` to `service` to `schema`, with `dto/` for `class-validator` decorated request bodies. The global `ValidationPipe` enforces whitelist and `forbidNonWhitelisted`, so unknown fields are rejected.

## Quick start

### 1. Infrastructure (mongo, redis, weaviate, ai)

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. NestJS API

```bash
cp .env.example .env
pnpm install
pnpm start:dev
```

Set `FIREBASE_PROJECT_ID` in `.env` before starting. Swagger UI is at <http://localhost:3001/docs>.

The API uses Firebase Admin. Authenticate the host with either of these.

* `gcloud auth application-default login` (recommended for dev)
* `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`

### 3. Next.js web app

```bash
cd apps/web
cp .env.local.example .env.local
pnpm install
pnpm dev
```

Fill in the Firebase web config in `.env.local`, then open <http://localhost:3000>.

### 4. AI service (already started by docker compose)

To run outside Docker.

```bash
cd apps/ai-service
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| repo root | `pnpm start:dev` | NestJS API with watch mode |
| repo root | `pnpm build` | NestJS production build |
| repo root | `pnpm lint` | ESLint |
| `apps/web` | `pnpm dev` | Next.js dev server |
| `apps/web` | `pnpm build` | Next.js production build |
| `apps/ai-service` | `uvicorn ...` | FastAPI dev server (see above) |

## Tech stack

* **API.** NestJS 10, TypeScript, Mongoose 8, BullMQ 5, class-validator, Zod env validation, Helmet, Swagger
* **Web.** Next.js 16, React 19, TypeScript, Tailwind v4, lucide-react, Firebase JS SDK
* **AI.** FastAPI, Pydantic v2, optional Transformers, sentence-transformers, and Weaviate client
* **Infra.** MongoDB 7, Redis 7, Weaviate 1.27, Firebase Auth

## MVP mode versus real model mode

The AI service ships in a deterministic lightweight mode by default. Lexicon sentiment, in memory vector store, and templated chat responses, so the full end to end flow runs locally with zero GPU. Setting `ENABLE_REAL_MODELS=true` and `ENABLE_WEAVIATE=true` in `apps/ai-service/.env` swaps in HuggingFace sentiment, sentence transformer embeddings, and a real Weaviate client. The NestJS and web contracts do not change between modes.

## Project timeline

Built Sep 2025 to Jan 2026 as a portfolio project demonstrating clean modular backend design, async job processing, AI service integration patterns, and a production quality web UX.
