# ⚡ Quick Deploy Steps - Backend to Vercel

## 🎯 What You Need to Do

### 1. Push Code to GitHub
```bash
cd /Users/hoon/Desktop/wizardmatch
git add .
git commit -m "Configure backend for Vercel deployment"
git push
```

### 2. Import Backend in Vercel

**Go to:** https://vercel.com/new

1. **Import Git Repository** → Select your repo
2. **Set Root Directory** → Type: `backend`
3. **Click "Continue"**

### 3. Add Environment Variables in Vercel

**Copy-paste these:**

```
DATABASE_URL=postgresql://postgres.azugptnvkvvasmumllgi:mapuamalayan2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

SUPABASE_URL=https://azugptnvkvvasmumllgi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_TUxo-6cqJ8Mm-8sRfp2lMw_9MQD5zxP

FRONTEND_URL=https://wizardmatch.vercel.app
BACKEND_URL=https://wizardmatch-backend.vercel.app

NODE_ENV=production
```

### 4. Click Deploy

Wait ~2-3 minutes. You'll get:
```
https://wizardmatch-backend-xyz.vercel.app
```

### 5. Update Frontend in Vercel

**Go to your Frontend Project** → Settings → Environment Variables

Edit these:

```
NEXT_PUBLIC_API_URL=https://wizardmatch-backend-xyz.vercel.app
(Use YOUR backend URL from step 4)

NEXT_PUBLIC_APP_URL=https://wizardmatch.vercel.app
(Your frontend URL)
```

### 6. Redeploy Frontend

Go to Deployments → Redeploy

---

## ✅ Done!

Your app will work at:
- **Frontend:** `https://wizardmatch.vercel.app`
- **Backend API:** `https://wizardmatch-backend-xyz.vercel.app`

All users can now signup and login! 🎉
