# Build context is the repo root, e.g.:
#   docker build -f apps/web/Dockerfile -t web .
# run from the repo root, so pnpm-workspace.yaml is visible.

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter web... --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web apps/web
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so this
# must be set before `next build` rather than at container runtime.
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter web build

# `output: "standalone"` (apps/web/next.config.ts) traces the workspace root via
# pnpm-lock.yaml, so the bundle under apps/web/.next/standalone mirrors the repo
# layout (apps/web/server.js + a trimmed root node_modules). Static assets and
# public/ aren't part of the standalone output and must be copied in separately.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
# Output file tracing drops @swc/helpers' esm/ files (only cjs/ survives) under
# pnpm's symlinked node_modules, crashing next start at runtime. Overlay the
# full package from the build stage to guarantee it's complete. The version
# below must match @swc/helpers' resolved version in pnpm-lock.yaml.
COPY --from=build /app/node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers ./node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers
WORKDIR /app/apps/web
ENV PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]
