---
description: How to run the Wizard Match site locally
---

# 🚀 Running Wizard Match Locally

This guide will teach you how to run the Wizard Match site on your local machine for development.

## 📋 Prerequisites

Before you start, make sure you have these installed:
- **Node.js 20+** (check with `node --version`)
- **PostgreSQL 15+** (your database)
- **Redis 7+** (optional, for caching)

## 🎯 Quick Start (Fastest Way)

If everything is already set up, just run:

```bash
npm run dev
```

This will start both the frontend (port 3000) and backend (port 3001) simultaneously.

## 📝 Step-by-Step Setup (First Time)

### Step 1: Install Dependencies

From the root directory (`/Users/hoon/Desktop/wizardmatch`):

```bash
npm install
```

This will install dependencies for both frontend and backend thanks to the workspace setup.

### Step 2: Set Up Environment Variables

You need two `.env` files:

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-database-url
```

**Backend** (`backend/.env`):
This file already exists! Check it to ensure it has:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/perfect_match
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 3: Set Up the Database

Navigate to the backend directory and run Prisma migrations:

```bash
cd backend
npx prisma generate
npx prisma db push
```

If you want to seed the database with sample data:
```bash
npx prisma db seed
```

### Step 4: Start the Development Servers

Go back to the root directory and start both servers:

```bash
cd ..
npm run dev
```

## 🌐 Accessing the Site

Once running, you can access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🔧 Individual Server Commands

If you want to run frontend or backend separately:

### Frontend Only
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

### Backend Only
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

## 🛑 Stopping the Servers

Press `Ctrl + C` in the terminal where the servers are running.

## 🐛 Common Issues & Solutions

### Issue: Port Already in Use
**Solution**: Kill the process using the port
```bash
# For port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# For port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### Issue: Database Connection Error
**Solution**: 
1. Make sure PostgreSQL is running
2. Check your `DATABASE_URL` in `.env` files
3. Run `npx prisma db push` in the backend directory

### Issue: Module Not Found
**Solution**: Reinstall dependencies
```bash
npm run clean
npm install
```

### Issue: Prisma Client Error
**Solution**: Regenerate Prisma client
```bash
cd backend
npx prisma generate
```

## 📦 Other Useful Commands

### Build for Production
```bash
npm run build
```

### Start Production Build
```bash
npm run start
```

### Run Linter
```bash
npm run lint
```

### Clean Everything
```bash
npm run clean
```

### View Database in Prisma Studio
```bash
cd backend
npx prisma studio
```

## 🎨 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload - changes will reflect automatically
2. **Console Logs**: Check the terminal for backend logs and browser console for frontend logs
3. **Database Changes**: After modifying `schema.prisma`, run `npx prisma db push` and `npx prisma generate`
4. **Environment Variables**: Restart servers after changing `.env` files

## 📱 Testing on Mobile

To test on your phone while on the same network:

1. Find your computer's local IP address:
   ```bash
   ipconfig getifaddr en0
   ```

2. Update `NEXT_PUBLIC_APP_URL` in `frontend/.env.local` to use your IP:
   ```env
   NEXT_PUBLIC_APP_URL=http://YOUR_IP:3000
   ```

3. Access from your phone: `http://YOUR_IP:3000`

---

**Happy coding! 🎉**
