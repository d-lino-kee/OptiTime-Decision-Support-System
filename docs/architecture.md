# OptiTime Architecture

## Overview

OptiTime is split into three services that share Mongo + Redis + Weaviate:

- **`apps/web`** — Next.js 16 client. Firebase email/password auth. Calls the
  NestJS API with an ID-token bearer. Tailwind v4 UI.
- **`src/`** — NestJS API. Owns business logic, persistence, and queue
  production. Validates input with `class-validator` and a global
  `ValidationPipe`. Firebase Admin verifies bearer tokens.
- **`apps/ai-service`** — FastAPI sidecar. Owns the ML/RAG surface. Verifies
  every call with HMAC-SHA256.

Background workers live inside the NestJS process (registered through
`@nestjs/bullmq` in `src/jobs/processors/`). Moving them to a dedicated
`apps/worker` deployable is a deliberate next step rather than a hidden
TODO — the producer/consumer contract is already isolated in `src/jobs/queues.ts`.

## Logical diagram

```text
┌──────────────┐    HTTPS + Firebase ID token    ┌──────────────────────┐
│  Web (Next)  │ ──────────────────────────────▶ │       NestJS API     │
└──────────────┘                                 │  (Express + Mongoose) │
                                                 └────────┬───────┬─────┘
                                                          │       │
                                          ┌── enqueue ────┘       └── HMAC POST
                                          ▼                                  │
                                ┌──────────────────┐                         ▼
                                │  Redis + BullMQ  │                ┌─────────────────┐
                                └────────┬─────────┘                │  FastAPI AI svc │
                                         │ consume                  │  sentiment, RAG │
                                         ▼                          │  weekly summary │
                                ┌──────────────────┐                └────────┬────────┘
                                │ Worker processors │                        │
                                │ (in-process now)  │  ─── HMAC POST ───────▶│
                                └──────────────────┘                         │
                                                                             ▼
                                                                     ┌──────────────┐
                                                                     │   Weaviate   │
                                                                     └──────────────┘
                              ┌──────────────┐
                              │   MongoDB    │  source of truth for users, tasks,
                              │              │  sessions, reflections, AI outputs
                              └──────────────┘
```

## Request flow — creating a reflection

1. Web POSTs `/v1/reflections` with the user's Firebase ID token.
2. `FirebaseAuthGuard` verifies the token via Firebase Admin and find-or-creates
   the Mongo `User`.
3. `ReflectionsService.create` writes the document and enqueues two jobs:
   - `sentiment:reflection:<id>` → `SentimentProcessor` calls
     `AiService.analyzeSentiment` and writes the label/score back to Mongo.
   - `embed:reflection:<id>` → `EmbeddingsProcessor` calls `AiService.embed`,
     which upserts a vector into Weaviate (or the in-memory fallback).
4. The web dashboard polls `/v1/reflections` and renders sentiment when it
   appears. No long-polling — sentiment usually lands within seconds.

## Service-to-service security

NestJS' `AiService` signs every outbound request:

```ts
const ts = Date.now().toString();
const sig = createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
// headers: X-OptiTime-Timestamp, X-OptiTime-Signature
```

The FastAPI service rejects requests with a stale timestamp (default 300 s
skew) or a signature mismatch (constant-time compare). The shared secret lives
in env vars on both sides — never in code.

## Data model

| Collection | Fields (selected) |
| --- | --- |
| `users` | `firebaseUid` (unique), `email` (unique), `displayName` |
| `tasks` | `userId`, `title`, `notes`, `priority`, `difficulty`, `type`, `dueAt`, `estimatedMinutes`, `tags` |
| `focussessions` | `userId`, `taskId?`, `startedAt`, `endedAt?`, `interruptions`, `notes` |
| `reflections` | `userId`, `text`, `sentimentLabel?`, `sentimentScore?`, `sentimentConfidence?` |

All collections are indexed by `userId` + the most-used sort key (e.g. `dueAt`,
`startedAt`, `createdAt`).

## Deployment notes

- Each service has its own Dockerfile (NestJS uses `nest build` + Node runtime;
  FastAPI uses python:3.11-slim).
- The dev compose file boots Mongo, Redis, Weaviate, and the AI service. The
  NestJS API and the web app are run locally for fast reload.
- A production deployment moves the workers to `apps/worker` so the API
  process never blocks on AI calls.
