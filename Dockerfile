# ==========================================
# STAGE 1: Base & Development
# ==========================================
FROM oven/bun:alpine AS base

WORKDIR /app

# Copy berkas dependensi terlebih dahulu (memanfaatkan Docker cache)
COPY package.json bun.lock ./

# Install seluruh dependensi
RUN bun install

# Copy seluruh source code proyek
COPY . .

# Expose port dev bawaan Vite
EXPOSE 5173

# Jalankan dev server dengan flags --host agar bisa diakses dari luar container
CMD ["bun", "x", "vite", "dev", "--host", "0.0.0.0"]


# ==========================================
# STAGE 2: Production Build
# ==========================================
FROM base AS builder
RUN bun run build


# ==========================================
# STAGE 3: Production Runner
# ==========================================
FROM oven/bun:alpine AS runner
WORKDIR /app

# Salin hasil build dan dependensi produksi saja
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV NODE_ENV=production

# Jalankan aplikasi menggunakan Node Adapter hasil build
CMD ["bun", "build/index.js"]