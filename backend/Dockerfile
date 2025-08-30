FROM node:18-alpine AS deps
WORKDIR /app

RUN apk add --no-cache curl

# 1) Install deps (no lockfile, so use install)
COPY backend/package*.json ./
RUN npm install

# 2) Build TypeScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./
# Ensure tsconfig.json exists and "outDir": "dist"
RUN npm run build

# 3) Runtime image (small, prod-only)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Keep curl for Railway health checks / debugging (optional)
RUN apk add --no-cache curl

# Copy package files and node_modules, then drop dev deps
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

# Copy built JS and any runtime assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Railway sets PORT dynamically
EXPOSE 3001

# Helpful debug + start server
CMD sh -c "echo 'Container starting...' \
    && echo 'PORT:' \"$PORT\" \
    && echo 'NODE_ENV:' \"$NODE_ENV\" \
    && echo 'Files in dist:' && ls -la dist/ \
    && node dist/index.js"
