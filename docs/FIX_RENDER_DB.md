# 🚨 CRITICAL FIX: Render Database Configuration

Your deployed application is currently crashing because it is connected to an **empty database** on Render, while your actual data (tables, questions, users) is stored in **Supabase**.

Required Action: Update the `DATABASE_URL` in Render to point to your Supabase database.

## Step-by-Step Instructions

1.  **Copy the Supabase Connection String**
    Copy the following URL exactly:
    ```
    postgresql://postgres.azugptnvkvvasmumllgi:mapuamalayan2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
    ```

    *(Note: This is taken from your local `backend/.env` file)*

2.  **Go to Render Dashboard**
    - Url: https://dashboard.render.com/
    - Click on your **Backend Service** (e.g., `wizardmatch-api`).
    - Go to the **Environment** tab.

3.  **Update `DATABASE_URL`**
    - Find the `DATABASE_URL` variable.
    - It might currently say "Linked to wizardmatch-db" or have a different value.
    - **Edit** it and paste the Supabase URL from Step 1.
    - **Save Changes**.

4.  **Redeploy**
    - Render should automatically restart the service.
    - Once "Live", your app will connect to the correct database (Supabase) where we just seeded the questions.

## Why this happened?
- **Locally**, you are using Supabase (`backend/.env`).
- **On Render**, the `render.yaml` configuration automatically created a *new, empty* Postgres database hosted by Render and connected the app to it.
- Since we ran migrations and seeds against Supabase, the Render database remained empty, causing "Table does not exist" errors.

## Final Verification
After updating and redeploying, try logging in again. The error should be gone!
