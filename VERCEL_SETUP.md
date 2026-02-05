# Vercel Deployment Setup

## ⚠️ Required: Add Environment Variables in Vercel Dashboard

Your `.env.local` file is for local development only. For Vercel deployment, you MUST add these in the Vercel Dashboard.

### Step 1: Go to Vercel Project Settings

1. Visit https://vercel.com/dashboard
2. Find your `wizardmatch` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add All Required Environment Variables

Add these variables one by one:

#### Frontend Variables:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://azugptnvkvvasmumllgi.supabase.co
Type: Public (should be visible as NEXT_PUBLIC_*)
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dWdwdG52a3Z2YXNtdW1sbGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTU1NjcsImV4cCI6MjA4NTU5MTU2N30.d3Ylw9HiGh3-UPweOGa3tg1tuCyhwOKoKxwLOA8dBkc
Type: Public
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_API_URL
Value: https://wizardmatch-backend.onrender.com (or your actual backend URL)
Type: Public
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_APP_URL
Value: https://your-frontend-domain.vercel.app
Type: Public
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_MATCH_RELEASE_DATE
Value: 2026-02-05T00:00:00Z
Type: Public
Environment: Production, Preview, Development
```

### Step 3: Important Notes

1. **ALL** environment variables starting with `NEXT_PUBLIC_` must be added to Vercel
2. The `.env.local` file is ignored by Vercel
3. Each variable needs:
   - Name
   - Value
   - Environment selections (Production, Preview, Development)

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the latest deployment
3. Click **Redeploy** (three dots → Redeploy)

### Step 5: Verify

After redeployment:
1. Check the deployment logs
2. Should see "✅ Ready" instead of errors
3. Visit your site to verify it works

## 🔍 Why This Error Occurred

The error happened because:
- Vercel builds your site (prerenders pages)
- During build, it tries to create the Supabase client
- Environment variables weren't available in Vercel
- Build failed with "supabaseUrl is required"

## ✅ After Fixing

Your Vercel deployment will:
- ✅ Build successfully
- ✅ Have access to Supabase
- ✅ Work in production

## 🚨 Common Mistakes

1. ❌ Only adding `.env.local` (doesn't work on Vercel)
2. ❌ Forgetting to select all environments (Production/Preview/Development)
3. ❌ Using local URLs (`localhost:3000`) instead of production URLs
4. ❌ Missing `NEXT_PUBLIC_` prefix (required for client-side access)

## Need Your Backend URL?

For `NEXT_PUBLIC_API_URL`, use your actual deployed backend URL:
- If backend is on Vercel: `https://your-backend.vercel.app`
- If backend is on Render: `https://your-backend.onrender.com`
- If backend is on Railway: `https://your-backend.up.railway.app`

Add the appropriate URL for your setup!
