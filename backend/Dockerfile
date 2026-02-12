FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Generate Prisma Client (uses the schema in src/prisma/schema.prisma)
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Build the application
RUN pnpm run build

EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start:prod"]
