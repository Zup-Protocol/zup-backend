# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Generate code and build the application
RUN yarn gen
RUN yarn build

# Stage 2: Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy only the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy package files for production dependencies
COPY package.json .
COPY yarn.lock .

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["yarn", "start:prod"]