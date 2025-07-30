# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json .
COPY yarn.lock .

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Run code generation
RUN yarn gen

# Build the application
RUN yarn build

# Stage 2: Production stage with dev dependencies for codegen
FROM node:20-alpine AS production

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the source code and package files
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/src ./src
COPY --from=builder /app/graphql-codegen.config.ts ./graphql-codegen.config.ts
COPY --from=builder /app/static ./static

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["yarn", "start:prod"]