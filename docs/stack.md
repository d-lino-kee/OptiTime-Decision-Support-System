# OptiTime Stack

Why each piece is in the box.

## Web — Next.js 16 + Tailwind v4

- App Router, React 19, React Compiler enabled.
- Tailwind v4 with the PostCSS plugin (no `@apply` overuse — utilities in JSX).
- Firebase JS SDK for email/password auth. ID tokens flow to the API via a
  token-getter wired into `lib/api.ts`.
- Path alias `@/*` → `src/*`.

## API — NestJS 10

- Modular structure: one module per domain (`tasks`, `sessions`, `reflections`,
  `chat`, `users`, `auth`, `health`, `jobs`).
- DTOs in `dto/`, schemas in `schemas/`, services + controllers per module.
- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, transform on)
  enforces `class-validator` decorators on every body.
- Global `AllExceptionsFilter` shapes error responses + injects request id.
- Firebase Admin SDK verifies bearer tokens in `FirebaseAuthGuard` (set as the
  app-wide `APP_GUARD`). Public routes opt out via `@Public()`.
- Swagger UI at `/docs` reads `@ApiTags` / `@ApiBearerAuth` / `@ApiProperty`.

## Data — MongoDB + Mongoose

- One collection per domain object. `userId`-prefixed compound indexes on the
  most common sort key.
- DTOs and Mongoose schemas live next to their modules; no shared "models"
  bag — each module owns its data shape.

## Queues — Redis + BullMQ

- Four queues: `embeddings`, `sentiment`, `summaries`, `personalization`.
- Producers live in `src/jobs/jobs.service.ts`; cron-style repeats are
  registered with `repeat: { pattern }` on boot.
- Workers (`src/jobs/processors/*.ts`) extend `WorkerHost` and are wired in
  the same module so a single `pnpm start:dev` runs producer + consumer.
- Default job options: 3 attempts with exponential backoff,
  `removeOnComplete: 100`, `removeOnFail: 50`.

## AI — FastAPI + (optional) Weaviate + Transformers

- Endpoints: `/sentiment`, `/embed`, `/chat`, `/weekly-summary`, `/health`.
- All requests verified via HMAC-SHA256 (`X-OptiTime-Timestamp` +
  `X-OptiTime-Signature`).
- Two execution modes: a deterministic lightweight mode that works on any
  laptop with no model downloads, and a real-model mode that pulls
  HuggingFace + Weaviate. The HTTP contract is identical so the NestJS side
  doesn't change.

## Auth — Firebase

- The web app handles sign-up / sign-in / token refresh.
- The API trusts Firebase Admin's `verifyIdToken` and find-or-creates a Mongo
  user keyed by `firebaseUid`.
- Service-to-service is HMAC, not Firebase — no AI service in the auth tree.

## Deployment

- `docker-compose.dev.yml` runs Mongo, Redis, Weaviate, and the AI service
  for local dev.
- API and web run on the host during development for fast HMR.
- Production target is Railway (or any container host): one container per
  service, plus managed Mongo (Atlas), Redis, and Weaviate Cloud.
