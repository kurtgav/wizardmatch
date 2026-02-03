# 🚨 CRITICAL FIX: Render Database Configuration

Your deployed application is currently crashing because it is connected to an **empty database** on Render, while your actual data (tables, questions, users) is stored in **Supabase**.

Required Action: Update the `DATABASE_URL` in Render to point to your Supabase database.

## Step-by-Step Instructions

1.  **Push the Code Changes**
    I have modified `render.yaml` to remove the incorrect database link. You must push this change to GitHub so Render picks it up.
    ```bash
    git add render.yaml
    git commit -m "fix: unbind managed db from render.yaml"
    git push origin main
    ```

2.  **Go to Render Dashboard**
    - Url: https://dashboard.render.com/
    - Click on your **Backend Service** (e.g., `wizardmatch-api`).
    - Go to the **Environment** tab.

3.  **Add/Update Required Environment Variables**
    Since we are moving to production, you must ensure these variables are set in the Render **Environment** tab:
    | Key | Value (Example) |
    | :--- | :--- |
    | `DATABASE_URL` | `postgresql://postgres.azugptnvkvvasmumllgi:mapuamalayan2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
    | `FRONTEND_URL` | `https://wizardmatch.vercel.app` |
    | `BACKEND_URL` | `https://wizardmatch-api.onrender.com` |
    | `GOOGLE_CALLBACK_URL` | `https://wizardmatch-api.onrender.com/api/auth/google/callback` |
    | `GOOGLE_CLIENT_ID` | *(Copy from your `.env`)* |
    | `GOOGLE_CLIENT_SECRET` | *(Copy from your `.env`)* |

    - **Save Changes**.

4.  **Automatic Redeploy**
    - Saving these variables will trigger a new deployment automatically.
    - You do **not** need to manually trigger a rebuild.
    - Once "Live", visit `https://wizardmatch-api.onrender.com/health` to verify.

## Why this happened?
- **Locally**, you are using Supabase (`backend/.env`).
- **On Render**, the `render.yaml` configuration automatically created a *new, empty* Postgres database hosted by Render and connected the app to it.
- Since we ran migrations and seeds against Supabase, the Render database remained empty, causing "Table does not exist" errors.

## Final Verification
After updating and redeploying, try logging in again. The error should be gone!
