# Backend .env Analysis

## ✅ Variables to KEEP (Used in codebase):

### Server Config
- `NODE_ENV=development` - Environment (development/production)
- `PORT=3001` - Server port
- `API_PREFIX=/api` - API route prefix

### Database
- `DATABASE_URL=postgresql://...` - Prisma database connection (required)
- `DIRECT_URL=postgresql://...` - Prisma direct connection for migrations (required)

### Supabase Auth
- `SUPABASE_URL=https://azugptnvkvvasmumllgi.supabase.co` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY=sb_publishable_...` - Supabase service role key

### URLs
- `FRONTEND_URL=http://localhost:3000` - Frontend URL for CORS/redirects
- `BACKEND_URL=http://localhost:3001` - Backend URL for API calls

### Email Service
- `EMAIL_SERVICE=gmail` - Email service provider
- `EMAIL_USER=your-email@gmail.com` - Email username
- `EMAIL_PASSWORD=your-app-specific-password` - Email password
- `ADMIN_EMAIL=admin@wizardmatch.ai` - Admin email for notifications
- `SUPPORT_EMAIL=support@wizardmatch.ai` - Support email

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS=900000` - Rate limit window (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS=100` - Max requests per window

### File Upload
- `MAX_FILE_SIZE=5242880` - Max file size (5MB)
- `UPLOAD_DIR=./uploads` - Upload directory

### Match Release
- `MATCH_RELEASE_DATE=2026-02-05T00:00:00Z` - Match release date

## ❌ Variables to REMOVE:

### JWT (REMOVED - Using Supabase now)
```bash
JWT_SECRET=c25111a9-1cf9-473e-a769-5d5a6ddf8038  # ❌ NOT USED
JWT_EXPIRES_IN=7d  # ❌ NOT USED
```
**Reason**: We migrated to Supabase Auth, which handles authentication. These old JWT variables are no longer needed.

### Redis (NOT IMPLEMENTED)
```bash
REDIS_URL=redis://localhost:6379  # ❌ NOT IN CURRENT .ENV
```
**Reason**: Redis is configured in env.config.ts but not actually implemented in the codebase.

## 📊 Summary

**Current .env**: 39 lines
**Cleaned .env**: ~32 lines
**Removed**: 7 lines (JWT vars + comment)

**Result**: Cleaner, focused environment configuration with only what's actually used.
