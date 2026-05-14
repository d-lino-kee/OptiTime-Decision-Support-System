# Local Development

## Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+ (only if running the AI service outside Docker)
- Docker + Docker Compose
- A Firebase project (free tier is fine) with Email/Password sign-in enabled

## 1. Boot infrastructure

```powershell
docker compose -f docker-compose.dev.yml up -d
```

That starts MongoDB on `:27017`, Redis on `:6379`, Weaviate on `:8080`, and
the AI sidecar on `:8000`. Check `docker compose ps` to confirm.

## 2. NestJS API

```powershell
copy .env.example .env
# edit .env: set FIREBASE_PROJECT_ID
pnpm install
pnpm start:dev
```

Authenticate Firebase Admin with one of:

- `gcloud auth application-default login` (easiest for dev)
- `$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\service-account.json"`

The API listens on <http://localhost:3001>, with Swagger at
<http://localhost:3001/docs>.

## 3. Next.js web app

```powershell
cd apps/web
copy .env.local.example .env.local
# fill in NEXT_PUBLIC_FIREBASE_* from Firebase console > Project settings > General
pnpm install
pnpm dev
```

Open <http://localhost:3000>, sign up, and reflections/tasks/sessions will
flow through to the API.

## 4. AI service outside Docker (optional)

```powershell
cd apps/ai-service
copy .env.example .env
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Smoke test the full flow

1. Sign up on the web app.
2. Create a task → should appear in `/v1/tasks` via Swagger.
3. Write a reflection. Within a few seconds the dashboard shows a sentiment
   badge (positive / neutral / negative).
4. Open the Chat page and ask "How am I doing?" — the response should quote
   one of your reflections.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `Invalid environment variables: FIREBASE_PROJECT_ID` on API boot | `.env` not loaded; copy from `.env.example` |
| Web build crashes on `auth/invalid-api-key` | Firebase env vars missing in `apps/web/.env.local` |
| Reflection sentiment never appears | Workers can't reach AI service; check `docker compose logs ai` |
| AI service returns 401 | HMAC secret mismatch between API `.env` and AI `.env` |
