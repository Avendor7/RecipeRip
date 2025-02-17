# Use Node.js image with required system dependencies
FROM node:22-bookworm-slim

# Install cmake and ffmpeg
RUN apt-get update && apt-get install -y \
    cmake \
    ffmpeg \
    redis-server\
    wget\
    curl\
    build-essential\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json files
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies for both client and server
WORKDIR /app/client
RUN npm install

WORKDIR /app/server
RUN npm install

# Copy source code
WORKDIR /app
COPY client ./client
COPY server ./server

# Build client
WORKDIR /app/client
RUN npm run build

# Build server
WORKDIR /app/server
RUN npm run build

# Expose only the web port (assuming Vite's default port 80 for production)
EXPOSE 8002
EXPOSE 3000

# Create start script
RUN echo '#!/bin/sh \n redis-server /etc/redis/redis.conf \n cd /app/server && node dist/server.js & cd /app/client && npm run preview' > /app/start.sh

RUN chmod +x /app/start.sh

# Set working directory back to app root
WORKDIR /app

# Start both services
CMD ["/app/start.sh"]