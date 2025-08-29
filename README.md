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
├── frontend/          # Next.js frontend
├── backend/           # Node.js TypeScript API
│   ├── src/
│   │   ├── index.ts   # Main server file
│   │   ├── db/        # Drizzle database setup
│   │   ├── utils/     # Utility functions
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

### Backend Specific
- `npm run dev:backend` - Start backend in development mode
- `npm run build:backend` - Build backend
- `npm run start:backend` - Start backend in production mode

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL + Drizzle ORM
- ESLint
- Winston for logging

### Frontend
- Next.js (to be setup)
