FROM ubuntu:24.04 AS base

# Install dependencies
RUN apt-get update && apt-get install -y \
  curl gnupg ca-certificates build-essential python3 git \
  && rm -rf /var/lib/apt/lists/*

# MongoDB is provided by a separate container in docker-compose

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create data directories
RUN mkdir -p /data/db /data/logs

WORKDIR /app

# Copy root config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# Copy packages
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
RUN pnpm build

# Production stage
FROM base AS production
# In a real setup, we'd copy only built artifacts. 
# For this monorepo with workspaces, keeping source structure is easier for now 
# or we would need to properly bundle everything.
# Assuming 'pnpm start' runs the built server.

EXPOSE 3000 5173

COPY docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

# Development stage
FROM base AS development
EXPOSE 3000 5173
COPY docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
