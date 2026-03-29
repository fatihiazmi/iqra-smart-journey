FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# NEXT_PUBLIC_ vars are inlined at build time — must be real values
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
# Server-only secret — injected at runtime, placeholder for build
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# Production — standalone output
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy standalone server
COPY --from=base /app/.next/standalone ./
# Copy static assets (not included in standalone)
COPY --from=base /app/.next/static ./.next/static
# Copy public assets (icons, manifest, sw.js)
COPY --from=base /app/public ./public

EXPOSE 3000
CMD ["bun", "server.js"]
