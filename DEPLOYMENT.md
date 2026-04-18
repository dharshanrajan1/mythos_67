# Meridian — Deployment Guide

How to deploy Meridian to Vercel with a Neon PostgreSQL database.

---

## Prerequisites

- Vercel account
- Neon account (neon.tech)
- Google Cloud project with OAuth credentials and Calendar API enabled (see `GOOGLE_SETUP.md`)
- TMDB account for movie/TV search (themoviedb.org)

---

## 1. Set Up the Database (Neon)

1. Go to [neon.tech](https://neon.tech) and create a new project.
2. Create a database (e.g., `meridian`).
3. From the Neon dashboard, copy two connection strings:
   - **Pooled connection** (used for queries) → `DATABASE_POSTGRES_PRISMA_URL`
   - **Direct connection** (used for migrations) → `DATABASE_POSTGRES_URL_NON_POOLING`
4. The schema is applied automatically at build time via `prisma db push`.

---

## 2. Deploy to Vercel

### 2a. Import the repository

1. In Vercel, click **Add New → Project**.
2. Import your GitHub repository.
3. Vercel auto-detects Next.js — leave the framework preset as-is.

### 2b. Set environment variables

In **Settings → Environment Variables**, add the following for **Production**, **Preview**, and **Development**:

| Variable | Value |
|---|---|
| `DATABASE_POSTGRES_PRISMA_URL` | Neon pooled connection string |
| `DATABASE_POSTGRES_URL_NON_POOLING` | Neon direct connection string |
| `NEXTAUTH_SECRET` | Random string — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (no trailing slash) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `BLOB_READ_WRITE_TOKEN` | From Vercel Blob storage (see step 3) |
| `TMDB_READ_ACCESS_TOKEN` | From TMDB → Account → Settings → API (use the long JWT "Read Access Token", not the API key) |

### 2c. Deploy

Click **Deploy**. The build script runs:
1. `prisma generate` — generates the Prisma client
2. `prisma db push --accept-data-loss` — syncs the schema to Neon (non-blocking)
3. `next build` — compiles the app (uses 4 GB memory via `NODE_OPTIONS`)

---

## 3. Set Up Vercel Blob Storage

Progress photos are stored in Vercel Blob.

1. In your Vercel project, go to **Storage → Create Database → Blob**.
2. Connect it to your project.
3. Copy the `BLOB_READ_WRITE_TOKEN` and add it to your environment variables (it may be added automatically).

---

## 4. Configure Google OAuth for Production

After deploying, add your production URL to Google Cloud Console:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit your OAuth 2.0 Client ID.
3. Under **Authorized redirect URIs**, add:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
4. Save and redeploy if needed.

---

## 5. Post-Deploy Checks

| Check | How to verify |
|---|---|
| Sign-in works | Open the app in incognito and log in with email + password |
| Google OAuth works | Click "Sign in with Google" |
| Database is seeded | Sign up creates a user; check Neon dashboard for the User row |
| TMDB search works | Go to Media → search for a movie |
| Progress photos upload | Go to Fitness → upload a photo |
| Google Calendar sync | Go to Planning → sync tasks |

---

## 6. Updating the Deployment

Push to the connected GitHub branch and Vercel auto-deploys. If you made schema changes:

- `prisma db push` runs automatically at build time.
- The `--accept-data-loss` flag means renaming/removing columns **will silently drop data**. For destructive migrations, run `prisma db push` manually against the Neon connection string first and verify.

---

## Redeploying After Env Var Changes

Changing environment variables in Vercel does **not** automatically redeploy the live site. After updating any env var:

1. Go to **Deployments** tab.
2. Click `...` next to the latest deployment → **Redeploy**.

---

## Local Development Against Neon

To run locally against the production database (not recommended for active dev):

```bash
# .env.local
DATABASE_POSTGRES_PRISMA_URL=<neon-pooled-url>
DATABASE_POSTGRES_URL_NON_POOLING=<neon-direct-url>
NEXTAUTH_URL=http://localhost:3000
# ... rest of vars
```

The build script uses webpack (not Turbopack) for Vercel compatibility. This is intentional — do not switch to `--turbo` in dev if you need parity with production builds.
