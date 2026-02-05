# 🚀 Fix Vercel Deployment - Production URLs

## ⚠️ Problem: Your app is pointing to localhost

Your `.env.local` file has:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # ❌ Wrong for Vercel
NEXT_PUBLIC_APP_URL=http://localhost:3000   # ❌ Wrong for Vercel
```

These URLs only work on your local machine. On Vercel, you need your **actual production URLs**.

---

## 🔧 Step-by-Step Fix

### Step 1: Find Your Vercel URLs

1. Go to https://vercel.com/dashboard
2. Find your **frontend** project
3. Copy your domain (looks like `wizardmatch-xyz.vercel.app`)

**Your frontend URL will be something like:**
```
https://wizardmatch.vercel.app
```
or
```
https://your-custom-domain.com
```

### Step 2: Go to Vercel Environment Variables

1. In your Vercel project
2. Go to **Settings** → **Environment Variables**

### Step 3: Add/Update These Variables

**For Frontend (Vercel project):**

```bash
# Variable 1: FRONTEND URL
Name: NEXT_PUBLIC_APP_URL
Value: https://wizardmatch.vercel.app
(Use YOUR actual Vercel domain)
Environments: ✅ Production ✅ Preview ✅ Development

# Variable 2: API URL (pointing to your backend)
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-domain.com
(Your backend's production URL)
Environments: ✅ Production ✅ Preview ✅ Development

# Variable 3: Supabase URL
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://azugptnvkvvasmumllgi.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development

# Variable 4: Supabase Key
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✅ Production ✅ Preview ✅ Development

# Variable 5: Match Release Date
Name: NEXT_PUBLIC_MATCH_RELEASE_DATE
Value: 2026-02-05T00:00:00Z
Environments: ✅ Production ✅ Preview ✅ Development
```

### Step 4: Where is Your Backend Deployed?

You need to specify your **backend's production URL** in `NEXT_PUBLIC_API_URL`.

#### Options:

**A. Backend on Vercel:**
```
https://wizardmatch-backend.vercel.app
```

**B. Backend on Render:**
```
https://wizardmatch-backend.onrender.com
```

**C. Backend on Railway:**
```
https://wizardmatch-backend.up.railway.app
```

**D. Custom domain:**
```
https://api.yourdomain.com
```

**E. No backend deployment yet?**
- Deploy backend first, then add the URL
- Or use Vercel Serverless Functions

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click latest deployment
3. Click **Redeploy** (three dots → Redeploy)

---

## 📝 Complete Example

Let's say your URLs are:
- Frontend: `https://wizardmatch.vercel.app`
- Backend: `https://wizardmatch-backend.onrender.com`

**Vercel Environment Variables:**

```bash
NEXT_PUBLIC_APP_URL=https://wizardmatch.vercel.app
NEXT_PUBLIC_API_URL=https://wizardmatch-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://azugptnvkvvasmumllgi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
```

---

## 🎯 What About Backend Environment Variables?

If your backend is also deployed (on Render, Railway, etc.), you need to set backend env vars too:

**Backend .env or Environment Variables:**

```bash
NODE_ENV=production
DATABASE_URL=your-supabase-database-url
SUPABASE_URL=https://azugptnvkvvasmumllgi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_TUxo...
FRONTEND_URL=https://wizardmatch.vercel.app  # Your Vercel frontend URL
BACKEND_URL=https://your-backend-url.com      # Your backend URL
```

---

## ✅ Verification

After deployment and adding environment variables:

1. **Visit your frontend**: `https://wizardmatch.vercel.app`
2. **Open browser DevTools** → Console
3. **Type**: `console.log(process.env.NEXT_PUBLIC_APP_URL)`
4. **Should see**: `https://wizardmatch.vercel.app` ✅
5. **NOT**: `http://localhost:3000` ❌

---

## 🐛 Common Mistakes

### ❌ Wrong:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Only works locally!
```

### ✅ Right:
```bash
NEXT_PUBLIC_APP_URL=https://wizardmatch.vercel.app  # Production URL!
```

---

## 🚀 Quick Checklist

- [ ] Found your Vercel domain name
- [ ] Added `NEXT_PUBLIC_APP_URL` with Vercel domain
- [ ] Added `NEXT_PUBLIC_API_URL` with backend URL
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Selected all environments (Production/Preview/Development)
- [ ] Redeployed
- [ ] Tested on production URL

---

## Need Your Backend Deployed Too?

If your backend isn't deployed yet, you can:

### Option A: Deploy Backend to Vercel (Serverless Functions)
- Add backend API routes as Vercel functions
- Everything on one domain

### Option B: Deploy Backend Separately
- **Render**: https://render.com (free tier available)
- **Railway**: https://railway.app
- **Fly.io**: https://fly.io
- **DigitalOcean**: https://digitalocean.com

Then add that URL to `NEXT_PUBLIC_API_URL` in Vercel!

---

## 📞 Still Having Issues?

1. Check Vercel deployment logs
2. Verify environment variables are in Vercel Dashboard
3. Make sure to check "Production" environment when adding vars
4. Redeploy after adding/changing variables
5. Clear browser cache (Ctrl+Shift+R)
