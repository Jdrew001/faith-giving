# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build tools required for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 py3-setuptools make g++

COPY package*.json ./
RUN npm install --force || (echo "❌ npm install failed" && exit 1)

COPY . .
RUN npx nx build faith-giving-api --configuration=production || (echo "❌ API build failed" && exit 1)

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Build tools (still needed for native module install in production stage)
RUN apk add --no-cache python3 py3-setuptools make g++

# Install pm2 globally
RUN npm install -g pm2

# Copy built output (includes generated package.json with only required deps)
COPY --from=builder /app/dist/apps/faith-giving-api ./

# Install only the deps the build actually needs
RUN npm install --omit=dev --force || (echo "❌ Production npm install failed" && exit 1)

# Copy pm2 config
COPY apps/faith-giving-api/ecosystem.config.js ./

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]
