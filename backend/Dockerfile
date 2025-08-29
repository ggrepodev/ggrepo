# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory to backend
WORKDIR /app

# Copy backend package files only
COPY backend/package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build the application
RUN npm ci & npm run build

# Clean up devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
