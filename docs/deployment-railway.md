# Deploying OptiTime to Railway

OptiTime ships as three independent services. Each gets its own Railway
service inside the same project, sharing managed Redis and (optionally)
external MongoDB Atlas + Weaviate Cloud.

## Services

| Railway service | Build context | Start command | Port |
| --- | --- | --- | --- |
| `api` | repo root | `pnpm start` (after `pnpm build`) | 3001 |
| `web` | `apps/web` | `pnpm start` | 3000 |
| `ai` | `apps/ai-service` (Dockerfile) | (image default) | 8000 |
| `redis` | Railway plugin | — | 6379 |

MongoDB and Weaviate are usually managed externally (Atlas + Weaviate Cloud)
rather than as Railway plugins.

## Required env vars

### `api`

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
MONGODB_DB=optitime
REDIS_URL=${{REDIS_URL}}
AI_SERVICE_URL=https://${{ai.RAILWAY_PUBLIC_DOMAIN}}
AI_SERVICE_HMAC_SECRET=<shared with ai>
WEAVIATE_URL=https://<cluster>.weaviate.network
WEAVIATE_API_KEY=<from weaviate cloud>
FIREBASE_PROJECT_ID=<firebase project>
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-admin.json
```

Upload the Firebase Admin service-account JSON as a Railway secret file at
`/etc/secrets/firebase-admin.json`.

### `web`

```env
NEXT_PUBLIC_API_BASE_URL=https://${{api.RAILWAY_PUBLIC_DOMAIN}}/v1
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### `ai`

```env
AI_SERVICE_HMAC_SECRET=<shared with api>
WEAVIATE_URL=https://<cluster>.weaviate.network
WEAVIATE_API_KEY=<from weaviate cloud>
ENABLE_WEAVIATE=true
ENABLE_REAL_MODELS=true
```

## Steps

1. Push the repo to GitHub and connect it to Railway.
2. Create three services from the same repo, set the root directory and
   build command per the table above.
3. Add the Redis plugin to the project; reference it as `${{REDIS_URL}}`.
4. Set the env vars above, sharing `AI_SERVICE_HMAC_SECRET` across `api` and
   `ai`.
5. Deploy `api` and `ai` first; deploy `web` once it can reach the API.

## Health checks

- `api`: `GET /v1/health` — returns Mongo readyState
- `ai`: `GET /health`
- `web`: `GET /` — redirects to `/login` while unauthenticated, which is fine
