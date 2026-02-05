# 🚀 Wizard Match Deployment Guide

## 🏗️ Architecture
- **Frontend**: Next.js (Vercel)
- **Backend**: Go (Render)
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (Google OAuth)

---

## 1. Backend (Render)
The backend is deployed as a Docker container on Render.

### Environment Variables
| Key | Value / Note |
|-----|--------------|
| `DATABASE_URL` | Check Supabase Connection String (Session Mode) |
| `JWT_SECRET` | Secret string for internal tokens |
| `FRONTEND_URL` | `https://wizardmatch.vercel.app` (plus other domains) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_REDIRECT_URL` | `https://wizardmatch-go-api.onrender.com/api/auth/google/callback` |
| `ADMIN_EMAIL` | Comma-separated admin emails |

### Health Check
- URL: `https://wizardmatch-go-api.onrender.com/health`
- Expected response: `{"status":"ok", ...}`

---

## 2. Frontend (Vercel)
The frontend is a static export/Next.js app on Vercel.

### Environment Variables
| Key | Value / Note |
|-----|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `NEXT_PUBLIC_API_URL` | `https://wizardmatch-go-api.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | `https://wizardmatch.vercel.app` |

### Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `next build`

---

## 3. Database (Supabase)
- **Auth**: Enable Google Provider.
- **Redirect URL**: `https://azugptnvkvvasmumllgi.supabase.co/auth/v1/callback`
- **Tables**: Ensure `users`, `survey_responses`, etc. are created via `migrations/001_init.sql`.

---

## 🔄 Deployment Workflow
1. **Push to GitHub**: `git push origin main`
2. **Backend**: Render automatically rebuilds and deploys the Go service.
3. **Frontend**: Vercel automatically rebuilds and deploys the Next.js app.
