FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy package files and .npmrc
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy application source
COPY . .

# Generate Prisma Client
ARG DATABASE_URL
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN ./node_modules/.bin/prisma generate --schema=src/prisma/schema.prisma

# Build the application
RUN pnpm run build

# --- Production Stage ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy only necessary files from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main"]
