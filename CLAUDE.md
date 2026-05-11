# better-auth boilerplate

Next.js boilerplate that integrates [better-auth](https://www.better-auth.com) with Prisma on top of a Neon PostgreSQL database. Used as a starting point for learning/teaching modern auth flows.

## Stack

- **Next.js 15.5.2** (App Router, Turbopack for both `dev` and `build`)
- **React 19**
- **TypeScript** with `strict: true`, path alias `@/*` → repo root
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **Prisma** + `@prisma/adapter-neon` + `@neondatabase/serverless` (HTTP driver, serverless-friendly)
- **better-auth** for sessions, OAuth (GitHub, Google) and email/password
- **Neon** as the Postgres host

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build with Turbopack |
| `npm start` | Run the production build |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npx prisma migrate dev` | Apply schema changes locally |
| `npx prisma studio` | Inspect the DB |
| `npx @better-auth/cli generate` | Regenerate auth-related Prisma models from `lib/auth.ts` |

## Layout

```
app/
  api/auth/[...all]/route.ts   better-auth HTTP handler (catch-all)
  auth/page.tsx                Sign in / sign up UI
  dashboard/page.tsx           Protected page (uses useSession)
  components/                  Shared client components (Navigation, etc.)
  layout.tsx, page.tsx, globals.css
lib/
  auth.ts                      Server-side better-auth config (single source of truth)
  auth-client.ts               Client-side createAuthClient — exports signIn/signUp/signOut/useSession
  prisma.ts                    Prisma singleton wired with the Neon adapter
prisma/
  schema.prisma                User/Session/Account/Verification + app models
middleware.ts                  Cheap cookie check that guards /dashboard
```

## Auth conventions

- **better-auth is the only source of truth for sessions.** Do not use `localStorage` to track auth state — it gets out of sync with the server and can be spoofed. Use `authClient.useSession()` in client components and `auth.api.getSession({ headers: await headers() })` in server components/route handlers.
- The catch-all route at [app/api/auth/[...all]/route.ts](app/api/auth/[...all]/route.ts) handles every `/api/auth/*` request — never add sibling routes under `/api/auth/`.
- OAuth callback URLs are fixed by better-auth: `/api/auth/callback/github` and `/api/auth/callback/google`. Register these in the GitHub and Google OAuth apps for every environment.
- `middleware.ts` only does a cookie-existence check (cheap, runs on every request). For real authorization, also check the session inside the page/route — the middleware is defence in depth, not the gate.
- After changing `lib/auth.ts` (adding a provider, a plugin, etc.), re-run `npx @better-auth/cli generate` and then `npx prisma migrate dev` if the schema changed.

## Environment variables

Required (see `.env.local`):

- `DATABASE_URL` — pooled Neon connection string (used by the app at runtime).
- `DIRECT_URL` — direct (non-pooled) connection string (used by Prisma migrations only).
- `BETTER_AUTH_SECRET` — 32+ random bytes (e.g. `openssl rand -base64 32`).
- `BETTER_AUTH_URL` — base URL of the app (e.g. `http://localhost:3000`).
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

`.env*` is gitignored.

## Things to know

- Turbopack is enabled for `build` too (`next build --turbopack`). If a Prisma/Turbopack interaction breaks, falling back to `next build` (without `--turbopack`) is the supported escape hatch — only do it if needed and document why in the PR.
- Email verification is **not** wired up yet. When it is added, it will use Resend; until then, `emailAndPassword.requireEmailVerification` stays `false`.
- The Prisma client must be instantiated with the Neon driver adapter; importing `@prisma/client` directly without the adapter will silently use the TCP driver and fail in serverless/Edge contexts.
