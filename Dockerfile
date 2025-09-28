FROM node:18-slim

# Install OpenSSL and other required dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set Prisma binary targets
ENV PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client with correct binary
RUN npx prisma generate

EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]