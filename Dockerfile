FROM node:20-slim

# Install OpenSSL and other required dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    # Add postgresql-client for future debugging/startup scripts if needed
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set Prisma binary targets (keep this)
ENV PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# NOTE: Removed 'RUN npx prisma generate'. 
# In development with volumes, this is often run locally or moved to the entrypoint.

EXPOSE 3000

# Development command. You can add the prisma generate here if you ensure it runs *after* dependencies_on:service_healthy
# However, since you are volume mounting, `npm run dev` usually handles the client generation automatically, or you run it manually.
CMD ["npm", "run", "dev"]
