# 🚀 Vercel Deployment Guide

## Important: Two Separate Deployments

Your project has **frontend** and **backend** in separate folders. For Vercel, you need **2 deployments**:
- Frontend deployment (Next.js)
- Backend deployment (Express)

**Users access everything from one URL** - they don't need to know about the backend.

---

## Step 1: Deploy Backend

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. **CRITICAL**: In "Configure Project", set:
   - **Root Directory**: `backend` (type this manually)
4. Add Environment Variables:

```
DATABASE_URL=postgresql://postgres.azugptnvkvvasmumllgi:mapuamalayan2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

SUPABASE_URL=https://azugptnvkvvasmumllgi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_TUxo-6cqJ8Mm-8sRfp2lMw_9MQD5zxP

FRONTEND_URL=https://wizardmatch.vercel.app
BACKEND_URL=https://wizardmatch-backend.vercel.app
NODE_ENV=production

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/tmp/uploads
MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
```

5. Click **Deploy**
6. Wait ~2-3 minutes
7. **Copy your backend URL** (e.g., `https://wizardmatch-backend-xyz.vercel.app`)

---

## Step 2: Deploy Frontend

1. Go to https://vercel.com/new again (new project)
2. Import the **same** GitHub repo
3. **CRITICAL**: In "Configure Project", set:
   - **Root Directory**: `frontend` (type this manually)
4. Add Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://azugptnvkvvasmumllgi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dWdwdG52a3Z2YXNtdW1sbGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTI5MTEsImV4cCI6MjA1NDM4ODkxMX0.fJ7zZrO0jbFZRbzrN1pPgG-pJH8VGbXa_yLJEHIX0KQ

NEXT_PUBLIC_APP_URL=https://wizardmatch.vercel.app
NEXT_PUBLIC_API_URL=https://wizardmatch-backend-xyz.vercel.app

NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
```

**IMPORTANT**: Replace `wizardmatch-backend-xyz.vercel.app` with your **actual backend URL** from Step 1.

5. Click **Deploy**
6. Wait ~3-4 minutes

---

## ✅ After Deployment

### Test Your App

1. **Frontend**: Visit your frontend URL (e.g., `https://wizardmatch.vercel.app`)
2. **Auth**: Click "Sign in with Google"
3. **Backend API**: Test at `https://wizardmatch-backend-xyz.vercel.app/api/health`

---

## 📊 How It Works

```
User visits: wizardmatch.vercel.app
                    ↓
        ┌───────────────────────┐
        │  Next.js Frontend     │
        └───────────────────────┘
                    ↓ (API calls)
        ┌───────────────────────┐
        │  Express Backend      │
        │  (wizardmatch-backend │
        │   .vercel.app)        │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │  Supabase             │
        │  (Auth + Database)    │
        └───────────────────────┘
```

**Users only see**: `wizardmatch.vercel.app`
**Backend works silently** in the background

---

## 🔄 Future Updates

After you push to GitHub:
- **Both projects auto-redeploy** ✅
- Frontend updates at `wizardmatch.vercel.app`
- Backend updates at `wizardmatch-backend-xyz.vercel.app`

---

## 🐛 Troubleshooting

### "npm install failed"
- Make sure Root Directory is set to `frontend` or `backend`
- Don't use `.` (root) as it can't find package.json

### "Cannot find module"
- Check that node_modules are installed
- Verify Root Directory setting

### Auth not working
- Verify Google OAuth is enabled in Supabase Dashboard
- Check Supabase URL and keys are correct

### CORS errors
- Make sure `FRONTEND_URL` in backend env vars matches your frontend domain
- Both should be https://

---

## ✅ You're Done!

Your app is live:
- **Frontend**: `https://wizardmatch.vercel.app`
- **Backend**: `https://wizardmatch-backend-xyz.vercel.app`

All users can signup and login smoothly! 🎉
