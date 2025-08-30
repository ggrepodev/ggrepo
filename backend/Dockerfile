# Use Node.js 18 LTS
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy only backend files
COPY backend/package*.json ./
COPY backend/ ./

# Install dependencies and build
RUN npm ci && npm run build && npm prune --production

# Railway uses dynamic PORT, not 3001
EXPOSE $PORT

# Start the application - Railway provides PORT env var
CMD ["node", "dist/index.js"]
