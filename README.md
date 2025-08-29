# ggrepo

Merge your next PR with 10x speed using ggrepo

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start development servers for both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend
```

## Project Structure

```
ggrepo/
├── frontend/          # Next.js 15 frontend with Tailwind CSS
│   ├── app/           # App Router (Next.js 13+)
│   │   ├── page.tsx   # Homepage
│   │   ├── layout.tsx # Root layout
│   │   └── globals.css # Global styles + design system
│   └── components/    # Reusable components
├── backend/           # Node.js TypeScript API
│   ├── src/
│   │   ├── index.ts   # Main server file
│   │   ├── db/        # Drizzle database setup
│   │   ├── utils/     # Utility functions
│   │   ├── routes/    # API routes
│   │   └── middleware/ # Express middleware
│   └── drizzle/       # Database migrations
└── package.json       # Root workspace configuration
```

## Backend Setup

1. Copy environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Update `.env` with your database credentials

3. Generate Drizzle migrations and push to database:
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   ```

## Available Scripts

### Root Level
- `npm run dev` - Start all workspaces in development mode
- `npm run build` - Build all workspaces  
- `npm run start` - Start all workspaces in production mode
- `npm run lint` - Lint all workspaces

### Frontend Specific
- `npm run dev:frontend` - Start frontend in development mode (http://localhost:3000)
- `npm run build:frontend` - Build frontend for production
- `npm run start:frontend` - Start frontend in production mode
- `npm run lint:frontend` - Lint frontend code

### Backend Specific
- `npm run dev:backend` - Start backend in development mode (http://localhost:3001)
- `npm run build:backend` - Build backend for production
- `npm run start:backend` - Start backend in production mode
- `npm run lint:backend` - Lint backend code

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js (production-grade setup)
- PostgreSQL + Drizzle ORM
- Comprehensive error handling & logging (Winston)
- Rate limiting, security middleware (Helmet, CORS)
- Health checks & graceful shutdown
- ESLint for code quality

### Frontend  
- Next.js 15 with App Router
- React 19 + TypeScript
- Tailwind CSS v4 with custom design system
- Inter font optimization
- ESLint + TypeScript strict mode
- Responsive design & accessibility

## Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Health Check**: http://localhost:3001/health
- **Database Studio**: `npm run db:studio` (backend)
