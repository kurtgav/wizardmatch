# 🚀 Quick Start Guide - Mapúa MCL Perfect Match

## ✅ What's Already Done

- ✅ All dependencies installed
- ✅ Prisma client generated
- ✅ Environment files created (you just need to fill them in)
- ✅ Complete codebase ready

## 📝 What You Need to Do

### Step 1: Install PostgreSQL

#### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Or use Docker (Easiest)
```bash
docker run --name perfect-match-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=perfect_match \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add these Authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 3: Fill in Environment Variables

#### Backend (`backend/.env`)

Edit these lines with your values:

```bash
# Database (if using Docker, keep as-is)
DATABASE_URL=postgresql://postgres:password@localhost:5432/perfect_match

# JWT Secret (generate a random string)
JWT_SECRET=change-this-to-a-random-secret-key

# Google OAuth (paste your credentials)
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

#### Frontend (`frontend/.env.local`)

Edit these lines with your values:

```bash
# Google OAuth (same as backend)
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

### Step 4: Initialize Database

```bash
cd backend

# Run database migrations
npx prisma migrate dev --name init

# Seed database (survey questions, etc.)
npx prisma db seed
```

### Step 5: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### Step 6: Test the App

1. Open http://localhost:3000
2. Click "Sign In with Google"
3. Complete the OAuth flow
4. Take the survey (30 questions)
5. Go to admin dashboard to generate matches:
   - Make sure your email includes @mcl.edu.ph
   - Visit http://localhost:3000/admin/dashboard
   - Click "Generate Matches"
6. View your matches at http://localhost:3000/matches

## 🔑 Environment Variables Reference

### Required Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/perfect_match` |
| `JWT_SECRET` | Random secret for JWT tokens | `abc123xyz...` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456-abcde.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-abc123...` |

### Optional Variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | NextAuth secret | Auto-generated if empty |
| `EMAIL_USER` | Email for notifications | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email app password | `your-app-password` |

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@15

# Or check Docker container
docker ps | grep perfect-match-db
```

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### OAuth Error
- Make sure redirect URIs match exactly
- Check that NEXTAUTH_URL is correct
- Verify Client ID and Secret are correct

### Database Not Seeding
```bash
cd backend
npx prisma studio  # Open Prisma Studio to view database
```

## 📚 Next Steps

Once everything is running:

1. **Create an admin account** - Sign up with @mcl.edu.ph email
2. **Generate matches** - Use admin dashboard
3. **Customize questions** - Edit `backend/prisma/seeds/seed.ts`
4. **Adjust algorithm** - Modify `backend/src/services/matching.service.ts`
5. **Deploy to production** - See `docs/SETUP.md`

## 🆘 Need Help?

- Check the full setup guide: `docs/SETUP.md`
- Review API documentation: `docs/API.md`
- Contact: perfectmatch@mcl.edu.ph

---

**Project location:** `/Users/hoon/Desktop/wizardmatch/`

**Status:** ✅ Ready for your environment variables!
