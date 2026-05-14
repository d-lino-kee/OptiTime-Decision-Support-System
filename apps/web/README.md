# OptiTime Web

Next.js 16 + Tailwind v4 + Firebase Auth client for the OptiTime API.

## Pages

- `/login` — email/password sign-in & sign-up (Firebase)
- `/` — dashboard with task / reflection / focus-session summary
- `/tasks` — create + browse + delete tasks
- `/sessions` — log focus sessions, see history with duration
- `/reflections` — write reflections, see sentiment results once the worker runs
- `/chat` — AI coach (proxied through NestJS to the FastAPI sidecar)

## Local development

```bash
cd apps/web
cp .env.local.example .env.local   # then fill in Firebase web config
pnpm install
pnpm dev
```

Open <http://localhost:3000>. The NestJS API is expected at
`NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3001/v1`).

## Auth flow

The `AuthContext` mounts `onAuthStateChanged`, calls `getIdToken()` on demand, and
hands the token to `lib/api.ts` so every request to the NestJS API carries
`Authorization: Bearer <firebase-id-token>`. The API's `FirebaseAuthGuard`
verifies the token, looks up (or creates) the corresponding Mongo user, and
populates `req.user`.

## Build

```bash
pnpm build   # next build (turbopack)
pnpm start   # serve the production build
```
