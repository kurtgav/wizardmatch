# 🚀 Quick Fix Guide - Survey Questions Not Loading

## Problem: Survey Questions Not Appearing

### Solution 1: Seed Database with Questions (QUICK FIX)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `backend/prisma/seed-20-questions.sql`
3. Click **Run** to execute
4. This will create the active campaign and 20 survey questions

### Solution 2: Verify Backend is Deployed

Wait 2-3 minutes for Vercel to redeploy, then test:
```bash
curl https://wizardmatch-backend-jfrv.vercel.app/health
curl https://wizardmatch-backend-jfrv.vercel.app/api/survey/questions
```

### Solution 3: Check Supabase Connection

Go to **Supabase Dashboard** → **Settings** → **Database** and verify:
- Connection string matches: `postgresql://postgres.azugptnvkvvasmumllgi:mapuamalayan2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- Database is not paused

---

## After Seeding Questions:

1. **Clear your browser cache**
2. **Go to the survey page**
3. **Questions should load immediately!**

If still not working, open browser console (F12) and check for errors in the Network tab.
