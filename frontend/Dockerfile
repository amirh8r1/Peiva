# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production with nginx
FROM nginx:1.25-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
