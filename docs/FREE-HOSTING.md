# 🆓 100% FREE Deployment Guide - Mapúa MCL Perfect Match

## ✅ All Tools & Frameworks Are FREE

### **Development Tools (All FREE)**
- ✅ **Node.js** - FREE (Open Source)
- ✅ **TypeScript** - FREE (Open Source)
- ✅ **VS Code** - FREE (Optional IDE)

### **Backend (All FREE)**
- ✅ **Express.js** - FREE (Open Source)
- ✅ **PostgreSQL** - FREE (Open Source)
- ✅ **Prisma ORM** - FREE tier available
- ✅ **JWT** - FREE
- ✅ **Nodemailer** - FREE (uses Gmail)

### **Frontend (All FREE)**
- ✅ **Next.js 14** - FREE (Open Source)
- ✅ **React** - FREE (Open Source)
- ✅ **Tailwind CSS** - FREE (Open Source)
- ✅ **Framer Motion** - FREE (Open Source)
- ✅ **Radix UI** - FREE (Open Source)

---

## 🚀 100% FREE Hosting Options

### **Option 1: Render + Vercel (Recommended - Easiest)**

#### **Frontend (Vercel - FREE)**
- ✅ **100% FREE** - No credit card required
- ✅ Automatic deployments from Git
- ✅ SSL certificates included
- ✅ Custom domains supported
- **Limit:** 100GB bandwidth/month (plenty for this project)

**Deploy Frontend:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (FREE)
3. Click "New Project"
4. Import your GitHub repo
5. Select `frontend` folder as root directory
6. Add environment variables
7. Click "Deploy"

#### **Backend (Render - FREE)**
- ✅ **FREE tier** - No credit card required
- ✅ Automatic SSL
- ✅ Web service hosting
- **Limit:** 750 hours/month (enough for development)

**Deploy Backend:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (FREE)
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Set root directory to `backend`
6. Add environment variables
7. Click "Deploy"

#### **Database (Supabase - FREE)**
- ✅ **FREE tier** - 500MB storage
- ✅ PostgreSQL database
- ✅ Built-in authentication
- ✅ No credit card required

**Set Up Database:**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (FREE)
4. Create new project
5. Get your database connection string
6. Update `DATABASE_URL` in environment variables

---

### **Option 2: Railway (All-in-One - FREE)**

- ✅ **FREE tier** - $5 one-time credit
- ✅ Host frontend + backend + database together
- ✅ Automatic SSL
- ✅ GitHub integration

**Deploy with Railway:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (FREE)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Railway will detect and set up:
   - Frontend (Next.js)
   - Backend (Node.js)
   - Database (PostgreSQL)
6. Add environment variables
7. Click "Deploy"

---

### **Option 3: Fly.io (FREE)**

- ✅ **FREE allowance** - 3 VMs with 256MB RAM each
- ✅ Global deployment
- ✅ SSL certificates

**Deploy with Fly.io:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `flyctl auth signup`
3. Deploy: `flyctl launch`

---

## 🆓 FREE Database Options

### **1. Supabase (Recommended - FREE)**
- **Storage:** 500MB
- **Database:** PostgreSQL
- **Signup:** https://supabase.com
- **Best for:** Production apps, built-in auth

### **2. Neon (FREE)**
- **Storage:** 3 projects with auto-suspend
- **Database:** PostgreSQL Serverless
- **Signup:** https://neon.tech
- **Best for:** Development, serverless apps

### **3. Railway (FREE)**
- **Storage:** $5 one-time credit
- **Database:** PostgreSQL
- **Signup:** https://railway.app
- **Best for:** All-in-one hosting

### **4. PlanetScale (FREE)**
- **Storage:** 5GB
- **Database:** MySQL-compatible
- **Signup:** https://planetscale.com
- **Best for:** Large datasets

---

## 📧 FREE Email Service

**Use Gmail with Nodemailer (Already configured!)**

1. Create a Gmail account (FREE)
2. Enable 2-factor authentication
3. Generate App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate
   - Use this password in `EMAIL_PASSWORD`

---

## 🎯 Recommended FREE Stack

```
Frontend:  Vercel (FREE)
Backend:   Render (FREE)
Database:  Supabase (FREE)
Email:     Gmail + Nodemailer (FREE)
Total:     $0/month forever!
```

---

## 🚀 Step-by-Step FREE Deployment

### **Step 1: Set Up Supabase (FREE Database)**

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (FREE)
4. Create organization: "mapua-mcl-perfect-match"
5. Create new project:
   - Name: "perfect-match"
   - Database password: (generate secure password)
6. Wait for project to provision (~2 minutes)
7. Get connection string:
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your password

**Example Supabase Connection String:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### **Step 2: Deploy Backend to Render (FREE)**

1. Go to https://render.com
2. Sign up with GitHub (FREE)
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name:** `perfect-match-backend`
   - **Environment:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
6. Add environment variables:
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=generate-random-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXTAUTH_URL=your-render-backend-url
   FRONTEND_URL=your-vercel-frontend-url
   NODE_ENV=production
   ```
7. Click "Deploy Web Service"
8. Wait for deployment (~5 minutes)
9. Get your backend URL: `https://perfect-match-backend.onrender.com`

### **Step 3: Deploy Frontend to Vercel (FREE)**

1. Go to https://vercel.com
2. Sign up with GitHub (FREE)
3. Click "New Project"
4. Import your GitHub repo
5. Configure:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend`
   - **Install Command:** `npm install`
   - **Build Command:** `npm run build`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://perfect-match-backend.onrender.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=generate-random-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
   ```
7. Click "Deploy"
8. Wait for deployment (~2 minutes)
9. Get your frontend URL: `https://your-app.vercel.app`

### **Step 4: Update Google OAuth Redirect URIs**

1. Go to Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Add production redirect URIs:
   - `https://perfect-match-backend.onrender.com/api/auth/google/callback`
   - `https://your-app.vercel.app/api/auth/google/callback` (if using NextAuth)
4. Save changes

### **Step 5: Initialize Database on Supabase**

```bash
# Run this from your local machine
cd backend

# Set DATABASE_URL to your Supabase connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

Or use Supabase SQL Editor:
1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy-paste the SQL from `backend/prisma/migrations/`
4. Run the query

### **Step 6: Test Your Live App!**

1. Open your Vercel URL
2. Click "Sign In with Google"
3. Complete the survey
4. Generate matches (admin dashboard)
5. View your matches!

---

## 💰 Cost Breakdown

| Service | FREE Tier Limit | Cost |
|---------|----------------|------|
| Vercel (Frontend) | 100GB bandwidth/month | **$0** |
| Render (Backend) | 750 hours/month | **$0** |
| Supabase (Database) | 500MB storage | **$0** |
| Gmail (Email) | Free for personal use | **$0** |
| Google OAuth | Free tier | **$0** |
| **TOTAL** | | **$0/month** |

---

## 🎉 Summary

**Your entire Mapúa MCL Perfect Match platform is 100% FREE!**

- ✅ Development tools: FREE
- ✅ Frameworks: FREE
- ✅ Hosting: FREE
- ✅ Database: FREE
- ✅ Email: FREE
- ✅ Authentication: FREE

**No credit card required. No hidden fees. Forever free!**

---

## 📞 Need Help?

- **Supabase Support:** https://supabase.com/docs
- **Render Support:** https://render.com/docs
- **Vercel Support:** https://vercel.com/docs

**Made with ❤️ for free, forever!**
