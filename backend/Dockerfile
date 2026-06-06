#Base image node versi 20, pakai alpine biar ringan (~5MB vs ~900MB)
FROM node:20-alpine AS builder

# Set working directory di dalam container
WORKDIR /app

# Copy package.json duluan supaya layer cache npm install
# tidak diulang kalau codenya berubah tapi dependency tidak
COPY package*.json ./

# Install dependency, skip devDependency
RUN npm install --omit=dev

# ── Stage 2: Runtime ──────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy hasil install dari stage builder, bukan dari host
# Ini inti dari multi-stage image final tidak bawa tool build
COPY --from=builder /app/node_modules ./node_modules

# Copy source code
COPY . .

# Dokumentasi port yang dipakai (tidak otomatis buka port)
EXPOSE 3001

# Command yang jalan saat container start
CMD ["node", "index.js"]