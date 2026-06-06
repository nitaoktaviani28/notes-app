# ── Stage 1: Build ────────────────────────────────
# Pakai node alpine untuk build dulu
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

# ── Stage 2: Runtime ──────────────────────────────
# Pakai nginx alpine super ringan (~23MB) sebagai web server
FROM nginx:alpine

# Copy hasil build ke folder default nginx
COPY --from=builder /app/index.html /usr/share/nginx/html/index.html

# Port 80 adalah port default HTTP nginx
EXPOSE 80

# -g "daemon off" → jalankan nginx di foreground
# Kalau daemon mode (background), container langsung exit karena
# Docker butuh ada 1 proses yang jalan di foreground
CMD ["nginx", "-g", "daemon off;"]