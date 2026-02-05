# 🚀 Deploy Backend to Vercel

## ✅ Setup Complete!

I've configured your backend to deploy on Vercel. Here's what was done:

### Files Created/Modified:
- ✅ `backend/vercel.json` - Vercel configuration
- ✅ `backend/api/index.ts` - Serverless function handler
- ✅ `backend/src/server.ts` - Exports Express app for Vercel
- ✅ `backend/package.json` - Added `vercel-build` script

---

## 📋 Step-by-Step Deployment

### Step 1: Push Backend to GitHub (if not already)

```bash
cd /Users/hoon/Desktop/wizardmatch
git add backend/
git commit -m "Configure backend for Vercel deployment"
git push
```

### Step 2: Import Backend Project in Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**
4. Select your `wizardmatch` repository
5. **IMPORTANT**: Set Root Directory to `backend`
6. Click **"Continue"**

### Step 3: Configure Environment Variables

Add these in Vercel:

```bash
# Database
DATABASE_URL
Value: postgresql://postgres.azugptnvkvvasmumllgi:mapuamalayan2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Supabase
SUPABASE_URL
Value: https://azugptnvkvvasmumllgi.supabase.co

SUPABASE_SERVICE_ROLE_KEY
Value: sb_publishable_TUxo-6cqJ8Mm-8sRfp2lMw_9MQD5zxP

# Email (optional, for welcome emails)
EMAIL_SERVICE
Value: gmail

EMAIL_USER
Value: your-email@gmail.com

EMAIL_PASSWORD
Value: your-app-password

ADMIN_EMAIL
Value: admin@wizardmatch.ai

SUPPORT_EMAIL
Value: support@wizardmatch.ai

# URLs
FRONTEND_URL
Value: https://wizardmatch.vercel.app
(Your frontend Vercel domain)

BACKEND_URL
Value: https://wizardmatch-backend.vercel.app
(Your backend Vercel domain - update after deployment)

# Other
NODE_ENV
Value: production

RATE_LIMIT_WINDOW_MS
Value: 900000

RATE_LIMIT_MAX_REQUESTS
Value: 100

MAX_FILE_SIZE
Value: 5242880

UPLOAD_DIR
Value: /tmp/uploads

MATCH_RELEASE_DATE
Value: 2026-02-05T00:00:00Z
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. Vercel will give you a URL like: `https://wizardmatch-backend-xyz.vercel.app`

### Step 5: Update Frontend Environment Variables

1. Go to your **frontend** project in Vercel
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL`:
   ```
   https://wizardmatch-backend-xyz.vercel.app
   ```
   (Use your actual backend URL from Step 4)

4. Update `NEXT_PUBLIC_APP_URL`:
   ```
   https://wizardmatch.vercel.app
   ```

5. **Redeploy** frontend

---

## 🧪 Test Your Deployment

### Test Backend Health
```bash
curl https://wizardmatch-backend-xyz.vercel.app/health
```

Should return:
```json
{"status":"ok","timestamp":"...","environment":"production"}
```

### Test Frontend
Visit: `https://wizardmatch.vercel.app`

### Test Authentication
1. Visit `https://wizardmatch.vercel.app/auth/login`
2. Click "Sign in with Google"
3. Should work! ✅

---

## 📊 Architecture After Deployment

```
┌─────────────────────────────────────┐
│   Vercel Edge Network               │
├─────────────────────────────────────┤
│  Frontend: wizardmatch.vercel.app   │
│  (Next.js)                          │
├─────────────────────────────────────┤
│  Backend: wizardmatch-backend.      │
│  vercel.app (Express Serverless)    │
└─────────────────────────────────────┘
           ↓
    ┌──────────────────┐
    │   Supabase       │
    │   (Auth + DB)    │
    └──────────────────┘
```

---

## 🔄 Auto-Deployments

After initial setup:
- ✅ Push to `main` branch → Auto-deploys to Production
- ✅ Push to other branches → Auto-deploys to Preview
- ✅ Pull requests → Get preview URLs

---

## 💡 Benefits of This Setup

- ✅ **Free hosting** on Vercel
- ✅ **Global CDN** - Fast worldwide
- ✅ **Auto SSL** - HTTPS included
- ✅ **Zero config** - Just push code
- ✅ **Preview deployments** - Test before merging
- ✅ **Instant rollbacks** - One click revert
- ✅ **Analytics** - Built-in monitoring

---

## 🐛 Troubleshooting

### Build Fails?
- Check Build Logs in Vercel
- Make sure `vercel-build` script exists
- Verify TypeScript compiles locally first

### 504 Timeout?
- Serverless functions have 10s timeout on free tier
- Consider optimizing long-running operations

### Environment Variables Not Working?
- Make sure to select **"Production"** environment
- Redeploy after adding variables
- Check variable names (case-sensitive)

### CORS Errors?
- Make sure `FRONTEND_URL` in backend includes your Vercel domain
- Both frontend and backend should be on https://

---

## ✅ Next Steps

1. Deploy backend to Vercel
2. Get backend URL from Vercel
3. Update frontend `NEXT_PUBLIC_API_URL` in Vercel
4. Redeploy frontend
5. Test everything!

---

## 🎉 You're All Set!

Your app will now work in production with:
- ✅ Frontend: `https://wizardmatch.vercel.app`
- ✅ Backend: `https://wizardmatch-backend.vercel.app`
- ✅ Auth: Supabase OAuth
- ✅ Database: Supabase PostgreSQL
- ✅ Free hosting on Vercel

**Ready to deploy!** 🚀
