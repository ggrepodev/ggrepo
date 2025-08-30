# Use Node.js 18 LTS
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY backend/package*.json ./

# Install dependencies using npm install (not ci since we don't have package-lock in backend)
RUN npm install

# Copy backend source code
COPY backend/ ./

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Railway uses dynamic PORT
EXPOSE $PORT

# Start the application
CMD ["node", "dist/index.js"]
