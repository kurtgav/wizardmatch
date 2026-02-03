# 🚀 Deployment Status & Troubleshooting Guide

## Current Status

### ✅ What's Working
- [x] Backend deployed on Render: `https://wizardmatch-api.onrender.com`
- [x] Frontend deployed on Vercel
- [x] Database (PostgreSQL) created
- [x] Redis created

### ❌ What's NOT Working
- [ ] Google OAuth authentication (Error 400: invalid_request)
- [ ] Frontend-Backend connection
- [ ] Student access

---

## 🔧 Fix Steps (Do These Now)

### Step 1: Verify Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required variables:**
```
NEXT_PUBLIC_API_URL=https://wizardmatch-api.onrender.com
NEXTAUTH_URL=https://your-vercel-url.vercel.app
NEXTAUTH_SECRET=<YOUR_NEXTAUTH_SECRET>
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
NODE_ENV=production
```

**CRITICAL**: Replace `your-vercel-url.vercel.app` with your actual Vercel URL!

After adding/updating, click **"Redeploy"** in the Deployments tab.

---

### Step 2: Update Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

Click on your OAuth 2.0 Client ID and add these **Authorized redirect URIs**:

```
http://localhost:3001/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
https://wizardmatch-api.onrender.com/api/auth/google/callback
https://your-vercel-url.vercel.app/api/auth/callback/google
https://your-vercel-url.vercel.app/api/auth/google/callback
```

**IMPORTANT**: Replace `your-vercel-url.vercel.app` with your actual Vercel URL!

Click **Save**.

---

### Step 3: Update Render Environment Variables

Go to Render Dashboard → wizardmatch-api → Environment

**Add/Update these:**
```
GOOGLE_CALLBACK_URL=https://wizardmatch-api.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-vercel-url.vercel.app
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

After saving, Render will auto-redeploy.

---

### Step 4: Test the Deployment

1. **Get your Vercel URL**:
   - Go to Vercel Dashboard → Deployments
   - Copy the production URL (e.g., `https://wizardmatch-abc123.vercel.app`)

2. **Share this URL with students**: This is the URL they'll use to access the app

3. **Test login**:
   - Visit the Vercel URL
   - Click "Sign in with Google"
   - If it works → ✅ Deployment successful!
   - If it fails → Check the error and continue below

---

## 🐛 Common Issues & Fixes

### Issue 1: "Error 400: redirect_uri_mismatch"
**Fix**: The redirect URI in Google Cloud Console doesn't match your Vercel URL
- Go to Google Cloud Console
- Add the exact Vercel URL to Authorized redirect URIs
- Wait 5 minutes for changes to propagate

### Issue 2: "Cannot connect to backend"
**Fix**: Frontend environment variable is wrong
- Check `NEXT_PUBLIC_API_URL` in Vercel
- It should be: `https://wizardmatch-api.onrender.com`
- Redeploy after fixing

### Issue 3: "Database connection failed"
**Fix**: Check Render logs
- Go to Render → wizardmatch-api → Logs
- Look for database connection errors
- Verify `DATABASE_URL` is set correctly

### Issue 4: "Page not found (404)"
**Fix**: Vercel deployment failed
- Go to Vercel → Deployments
- Check the latest deployment logs
- Look for build errors

---

## 📋 Quick Verification Checklist

Run through this checklist:

- [ ] Vercel shows "Ready" status (green checkmark)
- [ ] Render shows "Live" status (green dot)
- [ ] `NEXT_PUBLIC_API_URL` in Vercel = `https://wizardmatch-api.onrender.com`
- [ ] `NEXTAUTH_URL` in Vercel = Your actual Vercel URL
- [ ] Google Cloud Console has ALL redirect URIs (including Vercel URL)
- [ ] Render has `FRONTEND_URL` = Your Vercel URL
- [ ] Can access Vercel URL in browser (doesn't show 404)
- [ ] Can access `https://wizardmatch-api.onrender.com/health` (should return OK)

---

## 🎯 What Students Need

**Share this with students:**

1. **URL**: `https://your-vercel-url.vercel.app` (replace with actual URL)
2. **Login**: Click "Sign in with Google" and use any Google account
3. **Complete survey**: Fill out the matching survey
4. **Wait for results**: Results will be released on Feb 5, 2026

---

## 🆘 Still Not Working?

If you've done all the above and it's still broken, check:

1. **Vercel Deployment Logs**: Look for build errors
2. **Render Logs**: Look for runtime errors
3. **Browser Console**: Open DevTools (F12) and check for errors
4. **Network Tab**: Check if API calls are reaching the backend

Share the error messages and I'll help you fix them!

---

**Last Updated**: Feb 4, 2026
