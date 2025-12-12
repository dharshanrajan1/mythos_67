# Google Calendar API Setup Guide

Follow these steps to generate the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` needed for your application.

## 1. Create a Google Cloud Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click the project dropdown in the top bar and select **"New Project"**.
3.  Enter a name (e.g., "Weekly Planner") and click **"Create"**.
4.  Once created, select the project from the dropdown.

## 2. Enable Google Calendar API
1.  In the left sidebar, navigate to **APIs & Services** > **Library**.
2.  Search for **"Google Calendar API"**.
3.  Click on the result and then click **"Enable"**.

## 3. Configure OAuth Consent Screen
1.  Navigate to **APIs & Services** > **OAuth consent screen**.
2.  **User Type**: Select **External** (unless you have a Google Workspace organization and only want internal users). Click **Create**.
3.  **App Information**:
    *   **App name**: Your App Name (e.g., "My Planner").
    *   **User support email**: Your email.
    *   **Developer contact information**: Your email.
4.  Click **Save and Continue**.
5.  **Scopes**:
    *   Click **Add or Remove Scopes**.
    *   Search for "calendar" and select these two:
        *   `.../auth/calendar` (See, edit, share, and permanently delete all the calendars...)
        *   `.../auth/calendar.events` (View and edit events on all your calendars)
        *   `.../auth/userinfo.email` (default)
        *   `.../auth/userinfo.profile` (default)
    *   Click **Update**, then **Save and Continue**.
6.  **Test Users** (Important for "External" apps in testing):
    *   Click **Add Users**.
    *   Enter your own Google email address (so you can log in).
    *   Click **Save and Continue**.

## 4. Create OAuth Credentials
1.  Navigate to **APIs & Services** > **Credentials**.
2.  Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3.  **Application type**: Select **Web application**.
4.  **Name**: "Next.js Client" (or similar).
5.  **Authorized JavaScript origins**:
    *   Add: `http://localhost:3000` (and your production domain later).
6.  **Authorized redirect URIs** (Crucial):
    *   Add: `http://localhost:3000/api/auth/callback/google`
    *   (If deploying to Vercel, add that URL too: `https://your-app.vercel.app/api/auth/callback/google`)
7.  Click **Create**.

## 5. Get Your Keys
1.  A popup will show your **Client ID** and **Client Secret**.
2.  Copy these strings.
3.  Paste them into your `.env` or `vercel.env` file:

```env
GOOGLE_CLIENT_ID=your_pasted_client_id_here
GOOGLE_CLIENT_SECRET=your_pasted_client_secret_here
```

## 6. Restart Server
After updating your `.env` file, make sure to restart your development server:
```bash
npm run dev
```
