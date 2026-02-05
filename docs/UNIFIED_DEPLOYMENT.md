# 🚀 Vercel Deployment Guide

## Understanding the Setup

Your project has **two parts**:
- **Frontend**: Next.js app (wizardmatch.vercel.app)
- **Backend**: Express API (wizardmatch-backend.vercel.app)

**For users**, everything works from **ONE URL**: `wizardmatch.vercel.app`

The frontend calls the backend API behind the scenes - users don't need to know about the backend URL.

---

## 📋 Deployment Steps

### Step 1: Deploy Backend First

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. **Important**: Set Root Directory to `backend`
4. Add Environment Variables:

```bash
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
6. Wait for deployment to finish
7. Copy your backend URL (e.g., `https://wizardmatch-backend-xyz.vercel.app`)

---

### Step 2: Deploy Frontend

1. Go to https://vercel.com/new
2. Import your GitHub repo (same repo)
3. Set Root Directory to `.` (root)
4. Add Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://azugptnvkvvasmumllgi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dWdwdG52a3Z2YXNtdW1sbGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MTI5MTEsImV4cCI6MjA1NDM4ODkxMX0.fJ7zZrO0jbFZRbzrN1pPgG-pJH8VGbXa_yLJEHIX0KQ

# URLs - UPDATE THIS WITH YOUR ACTUAL BACKEND URL FROM STEP 1
NEXT_PUBLIC_APP_URL=https://wizardmatch.vercel.app
NEXT_PUBLIC_API_URL=https://wizardmatch-go-api.onrender.com

# Match Date
NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
```

**Important**: Replace `wizardmatch-backend-xyz.vercel.app` with your actual backend URL from Step 1.

5. Click **Deploy**
6. Wait for deployment to finish

---

## ✅ After Deployment

### Test Your Deployment

1. **Frontend**: Visit `https://wizardmatch.vercel.app`
2. **Auth**: Click "Sign in with Google" - should work with Supabase OAuth
3. **API**: Backend API is at `https://wizardmatch-backend-xyz.vercel.app/api/*`

---

## 📊 Architecture

```
Users Access: https://wizardmatch.vercel.app
                        ↓
              ┌─────────────────┐
              │  Next.js        │
              │  Frontend       │
              └─────────────────┘
                        ↓ API Calls
              ┌─────────────────┐
              │  Express        │
              │  Backend        │
              └─────────────────┘
                        ↓
              ┌─────────────────┐
              │  Supabase       │
              │  (Auth + DB)    │
              └─────────────────┘
```

---

## 🎯 Why This Approach?

- ✅ **Native Vercel Support**: Both frameworks are deployed using Vercel's strengths
- ✅ **Independent Scaling**: Frontend and backend scale separately
- ✅ **Faster Builds**: Smaller, faster builds for each
- ✅ **Smooth UX**: Users access from ONE URL
- ✅ **Free Hosting**: Both on Vercel free tier

---

## 🔄 Updates & Redeployments

After you push to GitHub:
- Both deployments auto-redeploy
- Frontend updates at `wizardmatch.vercel.app`
- Backend updates at `wizardmatch-backend-xyz.vercel.app`
- No action needed!

---

## 🐛 Troubleshooting

### Build Fails?
- Check environment variables are added in Vercel Dashboard
- Make sure all required variables are set

### Auth Not Working?
- Verify Supabase Google OAuth is enabled in Supabase Dashboard
- Check Supabase URL and keys are correct

### CORS Errors?
- Make sure `FRONTEND_URL` in backend includes your Vercel domain
- Both should be on https://

---

## ✅ You're Done!

Your app is now live with:
- **Frontend**: `https://wizardmatch.vercel.app`
- **Backend**: `https://wizardmatch-backend-xyz.vercel.app`
- **Auth**: Supabase OAuth (Google)

All users can signup and login smoothly! 🎉
