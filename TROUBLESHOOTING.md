# Debugging "Authentication Failed" for Google Sign In

This error usually happens because the sensitive secure cookies used by NextAuth to verify the login flow are being rejected or mismatched. This is almost always an **Environment Variable** issue on Vercel.

## Checklist

### 1. Check `NEXTAUTH_URL` (Most Likely)
Go to **Vercel Dashboard** > **Settings** > **Environment Variables**.
*   **Key**: `NEXTAUTH_URL`
*   **Value**: Must be exactly `https://complexsite.vercel.app` (or whatever your specific `.vercel.app` domain is).
    *   **CRITICAL**: It must start with `https://`.
    *   **CRITICAL**: It must **NOT** have a trailing slash (`/`).
    *   **CRITICAL**: It must **NOT** be `localhost`.

### 2. Check `NEXTAUTH_SECRET`
Go to **Vercel Dashboard** > **Settings** > **Environment Variables**.
*   **Key**: `NEXTAUTH_SECRET`
*   **Value**: A random string (e.g., generated via `openssl rand -base64 32`).
    *   If this is missing, login will fail.

### 3. Check `DATABASE_URL` (CRITICAL FAIL POINT)
This is the **most likely** cause if your config is otherwise correct. NextAuth tries to save the user to the database immediately.
*   **Problem**: Your local computer uses `file:./dev.db` (SQLite), but your `schema.prisma` says `provider=postgresql`. AND Vercel cannot run SQLite easily.
*   **Solution**: You MUST use a real Postgres Database (e.g., Vercel Postgres, Neon, or Supabase).
*   **Action**:
    1.  Go to Vercel Dashboard > Storage.
    2.  Create a "Postgres" database.
    3.  Connect it to your project.
    4.  It will automatically add `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` to your Env Vars.
    5.  You MUST add a new Env Var: `DATABASE_URL` and set its value to the same value as `POSTGRES_PRISMA_URL` (copy-paste it).

### 4. Check Google Console Redirect URI
Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
*   Edit your OAuth 2.0 Client.
*   **Authorized redirect URIs** must contain:
    *   `https://complexsite.vercel.app/api/auth/callback/google`
    *   (Make sure there are no typos, and it matches your `NEXTAUTH_URL` exactly).

### 5. Check "Production" Deployment
If you changed any Environment Variables in Vercel, they **DO NOT** apply to the *current* running site automatically.
*   You **MUST** go to **Deployments** tab in Vercel.
*   Click the three dots `...` next to the latest deployment.
*   Select **Redeploy**.

## How to Verify
1.  Open your browser's "Incognito" or "Private" mode (to clear old cookies).
2.  Go to your site.
3.  Click "Login with Google".
4.  If it works, the issue was invalid cookies from previous failed attempts.
