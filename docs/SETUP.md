# Mapúa MCL Perfect Match - Setup Guide

## Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+ (optional, for production caching)
- Google Cloud Project (for OAuth)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mapua-mcl-perfect-match
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up Environment Variables

#### Backend (`.env`)

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/perfect_match
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### Frontend (`.env.local`)

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
```

### 4. Set Up PostgreSQL Database

#### Using Docker (Recommended)

```bash
docker run --name perfect-match-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=perfect_match \
  -p 5432:5432 \
  -d postgres:15
```

#### Or Install Locally

- macOS: `brew install postgresql@15`
- Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
- Linux: `sudo apt-get install postgresql-15`

### 5. Initialize Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (questions, etc.)
npx prisma db seed
```

### 6. Start Development Servers

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API

### 2. Create OAuth 2.0 Credentials

1. Go to APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://your-backend-url.com/api/auth/google/callback` (production)
5. Copy Client ID and Client Secret

### 3. Configure Environment Variables

Add the Client ID and Secret to both backend `.env` and frontend `.env.local`

## Production Deployment

### Backend Deployment (e.g., AWS, DigitalOcean, Railway)

1. **Set environment variables** in your hosting platform
2. **Build the project:**

```bash
cd backend
npm run build
```

3. **Run migrations:**

```bash
npx prisma migrate deploy
```

4. **Start the server:**

```bash
npm start
```

### Frontend Deployment (Vercel)

1. **Connect your GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically deploy on push to main branch

### Database Setup (Production)

1. Use managed PostgreSQL (e.g., AWS RDS, Railway, Supabase)
2. Update `DATABASE_URL` in production environment
3. Run migrations: `npx prisma migrate deploy`
4. Seed database: `npx prisma db seed`

## Verification

1. Visit `http://localhost:3000` (frontend)
2. Click "Sign In with Google"
3. Complete OAuth flow
4. Take the survey
5. View matches (after admin generates them)

## Troubleshooting

### Database Connection Issues

- Check PostgreSQL is running: `brew services list` (macOS) or `systemctl status postgresql` (Linux)
- Verify DATABASE_URL is correct
- Check database exists: `psql -U postgres -l`

### OAuth Issues

- Verify redirect URIs match exactly
- Check Google Cloud Console has correct authorized domains
- Ensure NEXTAUTH_URL matches your domain

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Admin Access

To access admin dashboard:

1. Create a user with @mcl.edu.ph email
2. Add email to admin check in `backend/src/middleware/auth.middleware.ts`
3. Visit `/admin/dashboard`

## Support

For issues or questions, contact: perfectmatch@mcl.edu.ph
