# Mapúa MCL Perfect Match 💕

A Valentine's matchmaking platform for Mapúa Malayan Colleges Laguna

## 🎯 Project Overview

Perfect Match helps Mapúa MCL students find meaningful connections through a comprehensive compatibility survey and smart matching algorithm.

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, Lucide React
- **State Management:** Zustand, React Query
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Cache:** Redis
- **Authentication:** NextAuth.js + Google OAuth
- **Email:** Nodemailer

## 📁 Project Structure

```
mapua-mcl-perfect-match/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js API server
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Google Cloud Console project (for OAuth)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mapua-mcl-perfect-match
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Frontend (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Backend (`.env`):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/perfect_match
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-app-password
```

4. **Initialize the database**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

5. **Start the development servers**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📝 Available Scripts

- `npm run dev` - Start both frontend and backend in development
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start both frontend and backend in production
- `npm run lint` - Lint all code
- `npm run test` - Run all tests
- `npm run clean` - Remove all node_modules and build artifacts

## 🎨 Design System

### Color Palette
- **Cardinal Red:** #E52037
- **Mapúa Pink:** #FFB3C1
- **Deep Pink:** #FFD6E0
- **Navy Blue:** #1E3A8A
- **Royal Blue:** #3B82F6

### Typography
- **Display:** Commissioner (headings)
- **Body:** Inter (body text)
- **Pixel:** VT323 (retro elements)

## 🔐 Features

- ✅ Google OAuth authentication
- ✅ Multi-step compatibility survey
- ✅ Smart matching algorithm
- ✅ Match dashboard with reveal system
- ✅ Admin dashboard
- ✅ Statistics and analytics
- ✅ Email notifications
- ✅ Responsive design
- ✅ Mobile-first approach

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Matching Algorithm](./docs/ALGORITHM.md)
- [Setup Guide](./docs/SETUP.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Privacy Policy](./docs/PRIVACY.md)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🎓 Made with ❤️ for Mapúa MCL Cardinals

---

*Built for Mapúa Malayan Colleges Laguna*
*Perfect Match Team © 2026*
