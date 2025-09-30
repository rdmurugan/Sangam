# Use Node.js 18 Alpine
FROM node:18-alpine

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++ gcc

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --production --legacy-peer-deps || npm install --production --legacy-peer-deps

# Copy backend source
COPY backend/ ./

# Expose port
EXPOSE 5001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]