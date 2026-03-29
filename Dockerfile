FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
ENV NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# Production
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./

EXPOSE 3000
CMD ["bun", "run", "start"]
