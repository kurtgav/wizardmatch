# Supabase Authentication Setup Guide

This guide will help you configure Supabase Authentication for your Wizard Match application.

## Prerequisites

- A Supabase project (create one at https://supabase.com)
- Your Supabase project URL and credentials

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (looks like `https://azugptnvkvvasmumllgi.supabase.co`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (this is your `SUPABASE_SERVICE_ROLE_KEY` - keep this secret!)

## Step 2: Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need to set up Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new OAuth 2.0 client ID
   - Add authorized redirect URI: `https://azugptnvkvvasmumllgi.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret to Supabase

## Step 3: Update Environment Variables

### Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Match Configuration
NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z

# Environment
NODE_ENV=development
```

### Backend (.env)

```bash
NODE_ENV=development
PORT=3001
API_PREFIX=/api

# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:password@aws-0-region.supabase.com:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT (for other uses, not auth)
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Email Recipients
ADMIN_EMAIL=admin@wizardmatch.ai
SUPPORT_EMAIL=support@wizardmatch.ai

# Frontend
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

## Step 4: Test the Setup

1. Start your backend server:
   ```bash
   cd backend
   npm run dev:node
   ```

2. Start your frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/auth/login`

4. Click "Sign in with Google"

5. Complete the Google OAuth flow

6. You should be redirected back to your app and authenticated!

## How It Works

### Authentication Flow

1. User clicks "Sign in with Google" on the login page
2. Frontend calls Supabase Auth's `signInWithOAuth()` method
3. Supabase handles the Google OAuth flow
4. User is redirected back with a valid Supabase session
5. Frontend stores the Supabase session token
6. Backend validates Supabase tokens on protected routes
7. Users are automatically created/synced in your database

### Backend Token Validation

The backend now validates Supabase tokens instead of custom JWTs:

```typescript
// Old way (removed)
const decoded = jwt.verify(token, config.jwtSecret);

// New way
const { data: { user }, error } = await supabase.auth.getUser(token);
```

### User Sync

When a user signs in via Supabase:
1. Their email is extracted from the Supabase user object
2. Backend checks if user exists in the database
3. If not, a new user is created with default values
4. User profile is returned to the frontend

## Migration Notes

### What Changed

**Removed:**
- ❌ Google Passport.js OAuth implementation
- ❌ Custom JWT generation
- ❌ Backend OAuth routes (`/api/auth/google`, `/api/auth/google/callback`)
- ❌ Dev login bypass
- ❌ Render deployment configuration

**Added:**
- ✅ Supabase Auth integration
- ✅ Supabase token validation
- ✅ Automatic user sync on first login
- ✅ Environment-based Supabase configuration

### Database

Your existing database schema remains unchanged. Supabase Auth handles authentication separately from your database.

### Existing Users

Existing users in your database will continue to work. When they sign in with Supabase using the same email, their existing account will be used.

## Troubleshooting

### "Invalid token" errors

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct in backend `.env`
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct in frontend `.env.local`

### Google OAuth not working

- Verify Google OAuth is enabled in Supabase Dashboard → Authentication → Providers
- Check that the redirect URI in Google Console matches: `https://your-project.supabase.co/auth/v1/callback`
- Ensure Client ID and Secret are correctly entered in Supabase

### User not created in database

- Check backend logs for any database errors
- Ensure `DATABASE_URL` is correct and connects to your Supabase PostgreSQL

### Session issues

- Clear browser localStorage and try again
- Check browser console for any Supabase errors
- Verify Supabase project URL is correct

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the frontend
3. **Use environment-specific configs** for development vs production
4. **Enable Row Level Security (RLS)** in Supabase for additional security
5. **Regularly rotate** your Supabase keys

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Auth Guide: https://supabase.com/docs/guides/auth
- GitHub Issues: https://github.com/supabase/supabase/issues
