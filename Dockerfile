# Development stage
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
CMD ["yarn", "start:dev"]

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --production
COPY --from=development /app/dist ./dist
CMD ["node", "dist/main"]
