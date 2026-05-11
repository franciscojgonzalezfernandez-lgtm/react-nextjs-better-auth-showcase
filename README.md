# How to use Better Auth

A didactic Next.js 15 boilerplate that wires up [better-auth](https://www.better-auth.com) with Prisma on Neon Postgres, plus GitHub + Google OAuth and Resend for email verification.

The goal of this repo is to **teach** modern auth in the App Router — every protected route deliberately implements the session check a different way, so you can read both side-by-side and feel the tradeoffs in your own browser.

## 🎯 What You'll Learn

- How to configure **better-auth** (email/password + OAuth) end-to-end.
- How to issue and consume sessions from **both** server components (`auth.api.getSession`) and client components (`useSession()`).
- The difference between the Next.js 15 **`unauthorized()` interrupt** (RSC-only, real `401`, URL preserved) and a **client `router.replace()` redirect** (status `200`, URL changes, brief flash).
- Why this project has **no `middleware.ts`** and uses per-route protection instead.
- How to send **verification emails** with Resend and the sandbox limitation that bites every beginner.
- How to drive **Prisma + Neon** with the serverless HTTP adapter so the app works in Edge/serverless runtimes.

## 🧱 Tech Stack

| Category   | Tech Stack                                            |
| ---------- | ----------------------------------------------------- |
| Framework  | Next.js 15.5.2 (App Router, Turbopack for dev + build) |
| Language   | TypeScript 5 (`strict: true`)                         |
| UI         | React 19 + Tailwind CSS 4                             |
| Database   | PostgreSQL on Neon (serverless HTTP driver)           |
| ORM        | Prisma 6 with `@prisma/adapter-neon`                  |
| Auth       | better-auth 1.6 — email/password + GitHub + Google    |
| Email      | Resend 6 (verification emails)                        |

## 🗺️ Project Layout

```
app/
  api/auth/[...all]/route.ts   better-auth HTTP handler (catch-all, never add siblings)
  auth/page.tsx                Sign in / sign up UI
  dashboard/page.tsx           Protected CLIENT page (useSession + router.replace)
  dashboard-server/page.tsx    Protected SERVER page (auth.api.getSession + unauthorized())
  dashboard-server/actions.ts  Server Actions: revoke other sessions, update profile
  unauthorized.tsx             Special segment rendered by Next.js when unauthorized() is thrown
  unauthorized/page.tsx        Regular route, target of client-side router.replace
  components/                  Navigation, SignOutButton, UnauthorizedScreen
lib/
  auth.ts                      Server-side better-auth config (single source of truth)
  auth-client.ts               createAuthClient — signIn / signUp / signOut / useSession
  prisma.ts                    Prisma singleton wired with the Neon adapter
  resend.ts                    Resend client
prisma/
  schema.prisma                User / Session / Account / Verification (+ your app models)
```

## 🚀 Getting Started

### 1. Clone, install, copy env

```bash
git clone <this-repo>.git
cd better-auth
npm install
cp .env.template .env.local
```

You will fill `.env.local` step by step below. Each subsection tells you which keys it produces.

### 2. Neon database → `DATABASE_URL`, `DIRECT_URL`

1. Create a project on [console.neon.tech](https://console.neon.tech).
2. Open **Connection Details** and copy two connection strings:
   - The **pooled** one (looks like `...-pooler.<region>.neon.tech/...`) → `DATABASE_URL`
   - The **direct/unpooled** one → `DIRECT_URL`

Why both? The pooled URL goes through Neon's transaction pooler — required for serverless/Edge runtimes because the Neon HTTP driver in [lib/prisma.ts](lib/prisma.ts) uses short-lived connections. The direct URL is used **only** by Prisma migrations, which need a stateful session that the pooler doesn't allow.

### 3. better-auth secret + URL → `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

```bash
openssl rand -base64 32
```

Paste the output into `BETTER_AUTH_SECRET`. Set `BETTER_AUTH_URL=http://localhost:3000` for local dev.

### 4. GitHub OAuth → `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**.
2. **Authorization callback URL** must be exactly:
   ```
   http://localhost:3000/api/auth/callback/github
   ```
3. After creating the app, click **Generate a new client secret**.
4. Copy Client ID and Client Secret into `.env.local`.

> The callback path is fixed by better-auth — do not change it. If you deploy, you need to register a **second** callback for your production URL.

### 5. Google OAuth → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create or select a project.
2. **APIs & Services → OAuth consent screen** → configure (External, add your email as a test user).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
4. **Authorized redirect URIs** must include exactly:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Copy Client ID and Client Secret into `.env.local`.

### 6. Resend (email verification) → `RESEND_API_KEY`

1. Sign up at [resend.com](https://resend.com).
2. **API Keys → Create API Key** → copy into `RESEND_API_KEY`.

> ⚠️ **Sandbox limitation.** The `from` address in [lib/auth.ts](lib/auth.ts) is `onboarding@resend.dev`, which is Resend's shared sandbox sender. It will **only deliver to the email you registered with Resend**. Trying to verify any other email will silently fail. For real users, verify a domain in Resend and change the `from` address to one on that domain.

### 7. Generate the auth schema and migrate

```bash
npx @better-auth/cli generate   # regenerates User/Session/Account/Verification from lib/auth.ts
npx prisma migrate dev          # applies the schema to Neon
```

Re-run both whenever you change [lib/auth.ts](lib/auth.ts) (adding a provider, a plugin, etc.).

### 8. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Try `/auth`, then visit both `/dashboard` and `/dashboard-server` — signed in and signed out — to see the contrast described below.

## 🔐 Client vs Server Auth — the pedagogical point

This boilerplate intentionally implements two protected dashboards. Read both files side-by-side: [app/dashboard/page.tsx](app/dashboard/page.tsx) (client) and [app/dashboard-server/page.tsx](app/dashboard-server/page.tsx) (server).

### Comparison

| Aspect              | Client — `app/dashboard`              | Server — `app/dashboard-server`        |
| ------------------- | ------------------------------------- | -------------------------------------- |
| Session check       | `useSession()` hook                   | `auth.api.getSession({ headers })`     |
| Unauth handling     | `router.replace("/unauthorized")`     | `unauthorized()` interrupt             |
| URL when unauth     | Changes to `/unauthorized`            | Preserved (`/dashboard-server`)        |
| HTTP status         | `200` (client-side redirect)          | Real `401`                             |
| Loading flash       | Brief spinner before redirect         | None — resolved before HTML is sent    |
| Mutations           | `signOut()` from `auth-client`        | Server Actions in `actions.ts`         |

### Client pattern

```tsx
"use client";
const { data: session, isPending } = useSession();

useEffect(() => {
  if (!isPending && !session) router.replace("/unauthorized");
}, [isPending, session, router]);
```

The hook fetches the session over HTTP after hydration, so there is always a moment where the page is rendered without a session. That's the flash. The only redirect mechanism available inside `"use client"` is `router.replace()`, which is a client-side navigation — the response that delivered the page was a normal `200`.

### Server pattern

```tsx
const session = await auth.api.getSession({ headers: await headers() });
if (!session) unauthorized();
```

`unauthorized()` is a Next.js 15 server-only function that throws an interrupt. Next.js catches it, renders the special segment [app/unauthorized.tsx](app/unauthorized.tsx) in place, and returns a real **`401`** status. The URL stays on `/dashboard-server`. No flash, no client roundtrip, no leaked content.

### Gotchas

- `unauthorized()` requires `experimental.authInterrupts: true` in `next.config.ts`.
- `unauthorized()` is **only** callable from RSC, route handlers, and server actions. Calling it from middleware or a client component will throw.
- `app/unauthorized.tsx` (special segment, sibling of `app/layout.tsx`) and `app/unauthorized/page.tsx` (regular route) coexist on purpose — the first is rendered by the interrupt, the second is the target of the client-side `router.replace`. Both render the same `UnauthorizedScreen` component so the user sees an identical UI.

### Why no `middleware.ts`?

better-auth supports a middleware-level session check, but this repo deliberately omits it. With middleware, the unauth experience is uniform — and invisible. With per-route checks, **you can feel the tradeoff**: load `/dashboard` and watch the flash; load `/dashboard-server` and notice there isn't one. That's the lesson.

In a real app, pick the pattern per route based on whether the page is server-rendered. Use the server pattern whenever possible.

## 📨 Email Verification Flow

In [lib/auth.ts](lib/auth.ts):

```ts
emailVerification: {
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
  requireEmailVerification: true,
  sendVerificationEmail: async ({ user, url }) => {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: user.email,
      subject: "Verify your email in Better Auth Demo",
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
    });
  },
},
```

What this means in practice:

- **Sign-up succeeds** even before the user clicks the link — the row is created in the `user` table with `emailVerified: false`.
- **Sign-in is blocked** until the user clicks the verification link. `signIn.email` will return an "email not verified" error.
- The signup UX in [app/auth/page.tsx](app/auth/page.tsx) tells the user to check their inbox after sign-up succeeds.
- If the email never arrives, you almost certainly hit the **Resend sandbox limitation** described in §6.

## 🛠️ Common Scripts

| Command                          | Purpose                                            |
| -------------------------------- | -------------------------------------------------- |
| `npm run dev`                    | Turbopack dev server                               |
| `npm run build`                  | Production build (Turbopack)                       |
| `npm start`                      | Run the production build                           |
| `npm run lint`                   | ESLint (`eslint-config-next`)                      |
| `npx prisma studio`              | Inspect the Neon database                          |
| `npx prisma migrate dev`         | Apply schema changes locally                       |
| `npx @better-auth/cli generate`  | Regenerate auth Prisma models from `lib/auth.ts`   |

## 🚢 Deploy to Vercel

1. Push to GitHub, import the repo in Vercel.
2. Add **every** variable from `.env.template` in Vercel → **Settings → Environment Variables**.
3. Update `BETTER_AUTH_URL` to your Vercel production URL (e.g. `https://your-app.vercel.app`).
4. **Register the production callback URLs** in both OAuth providers:
   - GitHub: `https://your-app.vercel.app/api/auth/callback/github`
   - Google: `https://your-app.vercel.app/api/auth/callback/google`
5. For real email verification in production: verify a domain in Resend and change the `from` in [lib/auth.ts](lib/auth.ts) from `onboarding@resend.dev` to an address on that domain.

## 🩺 Troubleshooting

- **The verification email never arrives.** You are almost certainly hitting the Resend sandbox limit — `onboarding@resend.dev` only delivers to the email registered with your Resend account. Verify a domain or test with that one email.
- **OAuth fails with `redirect_uri_mismatch`.** The callback URL in the provider must match better-auth's path **exactly**, including scheme, host, and port: `/api/auth/callback/github` or `/api/auth/callback/google`.
- **Sign-in returns "email not verified" after successful sign-up.** Expected. `requireEmailVerification: true` blocks sign-in until the link is clicked. Either click the link or set the flag to `false` while developing.
- **Prisma errors about TCP connections / pooling in production.** [lib/prisma.ts](lib/prisma.ts) must instantiate `PrismaClient` with `@prisma/adapter-neon`. A direct `new PrismaClient()` falls back to the TCP driver and breaks in serverless/Edge.
- **`next build --turbopack` errors on Prisma generated code.** Fall back to `next build` (without `--turbopack`) — this is the documented escape hatch.

---

Built to learn modern auth with Next.js + better-auth.
