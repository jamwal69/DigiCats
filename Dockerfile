# Multi-stage Docker build for production deployment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production
RUN cd frontend && npm ci --only=production

# Copy source code
COPY . .

# Build the frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine AS production

# Install serve for static file serving
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built frontend
COPY --from=builder /app/frontend/build ./build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S react -u 1001
USER react

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
