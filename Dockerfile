FROM oven/bun:alpine AS base

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

EXPOSE 5173

CMD ["bun", "x", "vite", "dev", "--host", "0.0.0.0"]

FROM base AS builder
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "build/index.js"]