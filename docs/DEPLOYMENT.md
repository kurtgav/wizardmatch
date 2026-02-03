# Deployment Guide - Render.com

## Quick Deploy (Recommended)

Since the Blueprint is having sync issues, let's deploy manually:

### Step 1: Deploy PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - **Name**: `wizardmatch-db`
   - **Database**: `perfect_match`
   - **User**: `wizard_user`
   - **Region**: Singapore (or closest to you)
   - **Plan**: Free
4. Click **"Create Database"**
5. **SAVE THIS**: Copy the **Internal Database URL** (starts with `postgresql://`)

### Step 2: Deploy Redis

1. Click **"New +"** → **"Redis"**
2. Settings:
   - **Name**: `wizardmatch-redis`
   - **Region**: Singapore (same as database)
   - **Plan**: Free
3. Click **"Create Redis"**
4. **SAVE THIS**: Copy the **Internal Redis URL** (starts with `redis://`)

### Step 3: Deploy Backend API

1. Click **"New +"** → **"Web Service"**
2. **Connect GitHub**: Select `kurtgav/wizardmatch`
3. Settings:
   - **Name**: `wizardmatch-api`
   - **Region**: Singapore (same as database)
   - **Root Directory**: `backend`
   - **Environment**: Docker
   - **Plan**: Free
   - **Branch**: main

4. **Environment Variables** - Click "Add Environment Variable" for each:
   ```
   NODE_ENV=production
   DATABASE_URL=<paste Internal Database URL from Step 1>
   REDIS_URL=<paste Internal Redis URL from Step 2>
   JWT_SECRET=<from your backend/.env file>
   NEXTAUTH_SECRET=<from your backend/.env file>
   GOOGLE_CLIENT_ID=<from your backend/.env file>
   GOOGLE_CLIENT_SECRET=<from your backend/.env file>
   NEXT_PUBLIC_APP_URL=<your Vercel frontend URL>
   ```

5. Click **"Create Web Service"**

### Step 4: Wait for Deployment

- Watch the logs (it takes 5-10 minutes)
- Once deployed, you'll get a URL like: `https://wizardmatch-api.onrender.com`

### Step 5: Update Frontend

1. Go to Vercel Dashboard
2. Select your `wizardmatch-frontend` project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
5. Go to **Deployments** → Click **"Redeploy"**

---

## Troubleshooting

If the backend deployment fails:
- Check the **Logs** in Render
- Common issues:
  - Missing environment variables
  - Database connection issues
  - Docker build errors

---

**Current Status**: Ready to deploy manually following the steps above.
