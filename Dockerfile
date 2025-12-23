# Multi-stage build for StoryGenApp

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend . 
RUN npm run build

# Stage 2: Build and run backend with frontend assets
FROM node:18-alpine

WORKDIR /app

# Install system dependencies for ffmpeg and better-sqlite3
RUN apk add --no-cache python3 make g++ ffmpeg

# Copy backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy backend source
COPY backend/src ./src
COPY backend/data ./data

# Copy frontend build output to backend public folder
RUN mkdir -p /app/backend/public
COPY --from=frontend-builder /app/frontend/dist /app/backend/public

WORKDIR /app/backend

# Expose ports
EXPOSE 3005 5180

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start backend
CMD ["npm", "start"]
