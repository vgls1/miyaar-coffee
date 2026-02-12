FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy application source
COPY . .

# Generate Prisma Client (uses the schema in src/prisma/schema.prisma)
# We need to set a dummy DATABASE_URL for the generate step if it validates the connection
ARG DATABASE_URL
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN ./node_modules/.bin/prisma generate --schema=src/prisma/schema.prisma

# Build the application
RUN pnpm run build

EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start:prod"]
