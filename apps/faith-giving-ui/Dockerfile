# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build tools required for native modules (@parcel/watcher, etc.)
RUN apk add --no-cache python3 py3-setuptools make g++

COPY package*.json ./
RUN npm install --force || (echo "❌ npm install failed" && exit 1)

COPY . .
RUN npx nx build faith-giving-ui --configuration=production || (echo "❌ UI build failed" && exit 1)

# ── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist/apps/faith-giving-ui /usr/share/nginx/html
COPY apps/faith-giving-ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
