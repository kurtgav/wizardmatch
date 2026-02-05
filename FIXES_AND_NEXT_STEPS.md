# 🔧 Build Error Fix + Next Steps

## ✅ What Was Fixed

### Build Error Fixed
The Vercel build error was caused by the Supabase client being created at module import time. When environment variables weren't available during build, it would fail.

**Solution**: Changed Supabase client to lazy-load only when needed (runtime), not at import time (build time).

### Files Updated
- `frontend/src/lib/supabase.ts` - Made Supabase client lazy-loaded
- `frontend/src/app/auth/login/page.tsx` - Updated to call `supabase()` as function
- `frontend/src/app/auth/signup/page.tsx` - Updated to call `supabase()` as function
- `frontend/src/hooks/useAuth.tsx` - Updated to call `supabase()` as function
- `frontend/src/hooks/useAuthState.ts` - Updated to call `supabase()` as function
- `vercel.json` - Simplified for root deployment

---

## 📋 Next Steps for Deployment

### Understanding the Deployment Model

**Important**: For Vercel, you need **two separate projects** but users access everything from **ONE URL**.

```
┌─────────────────────────────────────┐
│  wizardmatch.vercel.app             │  ← Users access here
│  (Frontend - Next.js)               │
└─────────────────────────────────────┘
           ↓ API Calls (hidden from users)
┌─────────────────────────────────────┐
│  wizardmatch-backend.vercel.app     │  ← Backend API
│  (Backend - Express)                │
└─────────────────────────────────────┘
```

### Step 1: Deploy Backend

1. Go to https://vercel.com/new
2. Import your `wizardmatch` repo
3. **Set Root Directory**: `backend`
4. **Add Environment Variables**:

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
6. Copy your backend URL (e.g., `https://wizardmatch-backend-xyz.vercel.app`)

### Step 2: Deploy Frontend

1. Create another Vercel project (same repo)
2. **Set Root Directory**: `.` (root of repo)
3. **Add Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://azugptnvkvvasmumllgi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dWdwdG52a3Z2YXNtdW1sbGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTI5MTEsImV4cCI6MjA1NDM4ODkxMX0.fJ7zZrO0jbFZRbzrN1pPgG-pJH8VGbXa_yLJEHIX0KQ
NEXT_PUBLIC_APP_URL=https://wizardmatch.vercel.app
NEXT_PUBLIC_API_URL=https://wizardmatch-backend-xyz.vercel.app
NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
```

**Important**: Replace `wizardmatch-backend-xyz.vercel.app` with your ACTUAL backend URL from Step 1.

4. Click **Deploy**

---

## 🎯 Why Two Deployments?

Vercel is designed to deploy:
- **Next.js apps** as static sites + serverless functions
- **Express apps** as serverless functions

They work differently. Trying to combine them in one project causes issues.

**But for users**, it's seamless:
- Users visit: `wizardmatch.vercel.app`
- Frontend silently calls backend API
- Users never see the backend URL

---

## ✅ Push to GitHub

Once you're ready, push the changes:

```bash
git add .
git commit -m "Fix build error and configure for Vercel deployment"
git push
```

Then follow the deployment steps above!

---

## 📖 Full Guide

See `UNIFIED_DEPLOYMENT.md` for detailed deployment instructions.
