# 🚀 ULTRA PRO MAX: WizardMatch GoLang + Supabase Migration Prompt

> **Copy this entire prompt to Antigravity (Opus 4.5) or Gemini 3 Pro (High)**
> This is a complete migration guide to consolidate WizardMatch to GoLang backend + Supabase only.

---

## 📋 MISSION OBJECTIVE

**Migrate the WizardMatch project to run ONLY on:**
1. **GoLang Backend** (Gin framework + pgx/v5 for PostgreSQL + SQLC for type-safe queries)
2. **Supabase** (PostgreSQL database + Auth + Storage)
3. **Next.js Frontend** (Keep as-is, update only API endpoints if needed)

**REMOVE ALL:**
- TypeScript/Express backend (`/backend/src/*`)
- Prisma ORM (replace with SQLC or raw pgx queries)
- Any Node.js backend dependencies not needed for frontend

---

## 🎨 FRONTEND & UI/UX PROTECTION (CRITICAL)

> ⚠️ **DO NOT TOUCH ANY FRONTEND CODE UNLESS ABSOLUTELY NECESSARY**

### Protected Frontend Files (DO NOT MODIFY):
```
/frontend/
├── src/app/          # ❌ DO NOT MODIFY - All pages and layouts
├── src/components/   # ❌ DO NOT MODIFY - All UI components
├── src/contexts/     # ❌ DO NOT MODIFY - React contexts
├── src/hooks/        # ❌ DO NOT MODIFY - Custom hooks
├── tailwind.config.ts # ❌ DO NOT MODIFY
├── globals.css       # ❌ DO NOT MODIFY
└── All UI/styling    # ❌ DO NOT MODIFY
```

### Only Allowed Frontend Changes:
| File | When to Modify |
|------|----------------|
| `src/lib/api.ts` | ONLY if API endpoint paths change |
| `src/lib/supabase.ts` | ONLY if Supabase config changes |
| `.env.local` | Update API URL if backend port changes |

### API Contract Preservation (MANDATORY):

The frontend expects these EXACT API response formats. **GoLang must match these exactly:**

```typescript
// Standard success response format
{ success: true, data: {...} }

// Standard error response format  
{ success: false, error: "message" }

// List response format
{ success: true, data: [...], count: number }
```

### Critical API Endpoints to Preserve:
| Endpoint | Request | Response | Frontend Usage |
|----------|---------|----------|----------------|
| `GET /api/users/profile` | Bearer token | `{ success, data: { id, email, firstName, lastName, ... }}` | Profile page |
| `PUT /api/users/profile` | JSON body | `{ success, data: updatedUser }` | Profile editor |
| `GET /api/survey/questions` | Bearer token | `{ success, data: [questions] }` | Survey page |
| `POST /api/survey/responses` | `{ questionId, answer }` | `{ success }` | Survey submit |
| `GET /api/matches` | Bearer token | `{ success, data: [matches], count }` | Matches page |
| `POST /api/crush` | `{ crushEmail }` | `{ success, data: crush }` | Crush list |
| `GET /api/admin/*` | Admin token | Various | Admin dashboard |

### If API Response Format Differs:
1. **FIRST OPTION**: Modify GoLang handler to match expected format
2. **LAST RESORT ONLY**: Create thin adapter layer in `api.ts` to transform response
3. **NEVER**: Modify frontend components to handle different API format

---

## 📁 CURRENT PROJECT ARCHITECTURE

```
/Users/hoon/Desktop/wizardmatch/
├── backend/                     # ❌ TO BE REMOVED (TypeScript/Express)
│   ├── src/                     # Express routes, controllers, services
│   │   ├── routes/              # 10 route files (auth, survey, matches, etc.)
│   │   ├── controllers/         # 10 controller files
│   │   ├── services/            # 6 service files
│   │   └── middleware/          # 3 middleware files
│   ├── prisma/                  # ⚠️ SCHEMA REFERENCE ONLY (use for data model)
│   │   └── schema.prisma        # 9 models: Campaign, User, Question, etc.
│   ├── package.json             # Express, Prisma, bcrypt, etc.
│   └── go.mod                   # Duplicate GoLang setup (partial migration)
│
├── backend-go/                  # ✅ KEEP & COMPLETE (GoLang/Gin)
│   ├── cmd/
│   │   ├── api/main.go          # Main entry point (working)
│   │   └── seed/                # Database seeder
│   ├── internal/
│   │   ├── config/              # Environment config
│   │   ├── db/                  # Database connection (pgx/v5)
│   │   ├── handler/             # 15 handler files (all routes)
│   │   │   ├── auth.go          # Auth handlers
│   │   │   ├── user.go          # User profile handlers
│   │   │   ├── survey.go        # Survey handlers
│   │   │   ├── campaigns.go     # Campaign handlers
│   │   │   ├── matches.go       # Match handlers
│   │   │   ├── messages.go      # Messages handlers
│   │   │   ├── crush.go         # Crush list handlers
│   │   │   ├── admin.go         # Admin handlers
│   │   │   ├── analytics.go     # Analytics handlers
│   │   │   └── public.go        # Public testimonials
│   │   ├── repository/          # 16 SQLC-generated files
│   │   │   ├── queries/         # 13 SQL query files
│   │   │   ├── users.sql.go
│   │   │   ├── campaigns.sql.go
│   │   │   ├── survey.sql.go
│   │   │   ├── matches.sql.go
│   │   │   ├── messages.sql.go
│   │   │   ├── crush.sql.go
│   │   │   ├── analytics.sql.go
│   │   │   └── models.go        # SQLC models
│   │   ├── middleware/          # JWT auth, CORS
│   │   └── http/                # Router setup
│   ├── migrations/              # Goose migrations
│   └── sqlc.yaml                # SQLC configuration
│
├── frontend/                    # ✅ KEEP (Next.js + Tailwind)
│   ├── src/
│   │   ├── app/                 # App router pages
│   │   ├── components/          # React components
│   │   ├── lib/
│   │   │   ├── api.ts           # API client (update URLs if needed)
│   │   │   └── supabase.ts      # Supabase client for auth
│   │   ├── contexts/            # React contexts
│   │   └── hooks/               # Custom hooks
│   └── package.json
│
└── package.json                 # Root monorepo (update scripts)
```

---

## 🗄️ DATABASE SCHEMA (From Prisma - Replicate in GoLang/SQLC)

The Prisma schema at `/backend/prisma/schema.prisma` defines these 9 models:

### Core Models:
| Model | Description | Key Fields |
|-------|-------------|------------|
| **Campaign** | Valentine's campaign | id, name, surveyOpenDate, surveyCloseDate, resultsReleaseDate, isActive |
| **User** | Student profiles | id, email, studentId, firstName, lastName, program, yearLevel, gender, seekingGender, profilePhotoUrl, bio, instagramHandle, facebookProfile, surveyCompleted |
| **Question** | Survey questions | id, campaignId, category, questionText, questionType, options (JSON), weight, orderIndex |
| **SurveyResponse** | User answers | id, userId, campaignId, questionId, answerText, answerValue, answerType |
| **Match** | Match results | id, campaignId, user1Id, user2Id, compatibilityScore, matchTier, rankForUser1, rankForUser2, isRevealed, isMutualCrush, messagingUnlocked |
| **Interaction** | Match actions | id, matchId, userId, interactionType, metadata |
| **Message** | Chat messages | id, matchId, senderId, recipientId, content, isRead |
| **CrushList** | Crush entries | id, userId, campaignId, crushEmail, crushName, isMatched, isMutual |
| **AdminSetting** | Config settings | id, settingKey, settingValue (JSON) |
| **Testimonial** | Success stories | id, name, heading, content, isApproved, isPublished |

---

## 🔧 MIGRATION TASKS

### Phase 1: Clean Up TypeScript Backend (REMOVE)

```bash
# Files/Folders to DELETE:
rm -rf /backend/src/                    # Express routes, controllers, services
rm -rf /backend/node_modules/
rm -rf /backend/dist/
rm /backend/package.json
rm /backend/package-lock.json
rm /backend/tsconfig.json
rm /backend/Dockerfile                  # Create new one for GoLang
rm /backend/vercel.json
rm /backend/*.ts                        # verify-db.ts, verify-questions.ts

# KEEP these from /backend/ for reference:
# - /backend/prisma/schema.prisma (reference for data model)
# - /backend/.env, /backend/.env.example (copy env vars to backend-go)
```

### Phase 2: Consolidate GoLang Backend

**Move `backend-go/` contents to `backend/`:**
```bash
# After cleaning /backend/:
mv /backend-go/* /backend/
rm -rf /backend-go/
```

**OR keep `backend-go/` as the sole backend and update all references.**

### Phase 3: Verify GoLang Backend Completeness

Check that ALL API endpoints from the TypeScript backend exist in GoLang:

#### Required API Routes (verify in `/backend-go/internal/handler/`):

| Route Group | Endpoints | Handler File |
|-------------|-----------|--------------|
| **Auth** | `POST /api/auth/session`, `POST /api/auth/callback` | `auth.go` ✅ |
| **Users** | `GET /api/users/profile`, `PUT /api/users/profile` | `user.go` ✅ |
| **Survey** | `GET /api/survey/questions`, `POST /api/survey/responses`, `GET /api/survey/progress`, `POST /api/survey/complete` | `survey.go` ✅ |
| **Matches** | `GET /api/matches`, `GET /api/matches/:id`, `POST /api/matches/:id/reveal`, `POST /api/matches/interest/:userId`, `POST /api/matches/pass/:userId` | `matches.go` ✅ |
| **Messages** | `GET /api/messages/:matchId`, `POST /api/messages/:matchId` | `messages.go` ✅ |
| **Crush** | `GET /api/crush`, `POST /api/crush`, `DELETE /api/crush/:id` | `crush.go` ✅ |
| **Admin** | `GET /api/admin/users`, `PUT /api/admin/users/:id`, `GET /api/admin/analytics`, `GET /api/admin/testimonials`, `PUT /api/admin/testimonials/:id` | `admin.go` ✅ |
| **Analytics** | `GET /api/analytics/overview`, `GET /api/analytics/programs`, `GET /api/analytics/year-levels` | `analytics.go` ✅ |
| **Public** | `GET /api/public/testimonials`, `POST /api/public/testimonials` | `public.go` ✅ |
| **Campaigns** | `GET /api/campaigns/active`, `GET /api/campaigns/:id` | `campaigns.go` ✅ |

### Phase 4: Update Root package.json

Replace the root `package.json` scripts:

```json
{
  "name": "wizardmatch",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && go run cmd/api/main.go",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && go build -o main cmd/api/main.go",
    "start": "concurrently \"npm run start:frontend\" \"npm run start:backend\"",
    "start:frontend": "cd frontend && npm start",
    "start:backend": "cd backend && ./main",
    "seed": "cd backend && go run ./cmd/seed",
    "test": "cd backend && go test ./...",
    "clean": "rm -rf node_modules frontend/node_modules frontend/.next backend/main"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### Phase 5: Update Frontend API Configuration

**File: `/frontend/src/lib/api.ts`**

The frontend already uses a generic API client. Ensure:
1. `NEXT_PUBLIC_API_URL` points to GoLang backend
2. All API paths match GoLang routes

```typescript
// No changes needed if paths match. Verify:
// - Auth: /api/auth/session
// - Users: /api/users/profile
// - Survey: /api/survey/questions, /api/survey/responses
// - Matches: /api/matches, /api/matches/:id
// - etc.
```

### Phase 6: Environment Variables

**Backend `.env` (GoLang):**
```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth (optional, for OAuth callback)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URL=http://localhost:3001/api/auth/callback
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Phase 7: Dockerfile for GoLang Backend

Create `/backend/Dockerfile`:
```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 3001
CMD ["./main"]
```

---

## ⚠️ CRITICAL MIGRATION RULES

1. **DO NOT DELETE** anything that is connected to the project flow but IS GoLang or Supabase
2. **IF REMOVING** a TypeScript feature, **FIRST CHECK** if the same feature exists in GoLang handlers
3. **IF NOT EXISTS** in GoLang, **MIGRATE THE LOGIC** to equivalent GoLang code
4. **PRESERVE** all database schema relationships (Prisma schema is the reference)
5. **TEST AFTER** each major change by running both frontend and backend

---

## 🧪 VERIFICATION CHECKLIST

After migration, verify:

- [ ] `cd backend && go run cmd/api/main.go` starts successfully
- [ ] `cd frontend && npm run dev` starts successfully
- [ ] Login/Auth works via Supabase
- [ ] User profile loads/saves correctly
- [ ] Survey questions load
- [ ] Survey responses save
- [ ] Matches display
- [ ] Crush list works
- [ ] Admin panel works
- [ ] Messages work

---

## 📌 SUPABASE INTEGRATION DETAILS

The project uses **Supabase for:**
1. **Authentication** - Google OAuth via `@supabase/supabase-js`
2. **PostgreSQL Database** - Connected via `pgx/v5` in GoLang
3. **Row-Level Security** - Verify policies are set in Supabase dashboard

**Frontend Auth Flow:**
1. Frontend uses `supabase.auth.signInWithOAuth()` for Google login
2. Frontend gets JWT token from Supabase session
3. Frontend sends `Authorization: Bearer <token>` to GoLang backend
4. GoLang backend validates JWT against Supabase

**GoLang Auth Middleware** (`/backend-go/internal/middleware/auth.go`):
- Verifies JWT tokens
- Extracts user info from token claims
- Sets user context for handlers

---

## 🚀 EXECUTION COMMANDS

Start by exploring the codebase:
```bash
# List TypeScript backend to identify what to migrate/remove
ls -la /Users/hoon/Desktop/wizardmatch/backend/src/

# List GoLang backend to verify completeness
ls -la /Users/hoon/Desktop/wizardmatch/backend-go/internal/handler/

# Check Prisma schema for data model reference
cat /Users/hoon/Desktop/wizardmatch/backend/prisma/schema.prisma
```

---

## 🎯 FINAL GOAL

After this migration:
- **Only** `/backend/` (or `/backend-go/`) contains the GoLang API server
- **Only** Supabase is used for database and authentication
- **Frontend** connects to GoLang backend + Supabase auth
- **No TypeScript/Express/Prisma** backend code remains
- **All existing features** work exactly as before

---

**Good luck, Agent! 🔮✨**
