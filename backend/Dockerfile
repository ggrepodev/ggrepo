# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy backend source code
COPY backend/ ./backend/

# Build the application
WORKDIR /app/backend
RUN npm ci && npm run build

# Clean up devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# List directory structure for debugging
RUN ls -la && ls -la dist/
# Start the application
CMD ["node", "dist/index.js"]
