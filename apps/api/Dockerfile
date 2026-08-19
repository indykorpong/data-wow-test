# Build context is the repo root, e.g.:
#   docker build -f apps/api/Dockerfile -t api .
# run from the repo root, so pnpm-workspace.yaml is visible.

FROM node:22-alpine AS deps
WORKDIR /app
# python3/make/g++ let bcrypt's node-pre-gyp fall back to a source build if no
# prebuilt musl binary is published for this node/arch combination.
RUN apk add --no-cache python3 make g++
RUN corepack enable
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma/schema.prisma apps/api/prisma/schema.prisma
RUN pnpm install --filter api... --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api apps/api
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

# Reuses the build stage's node_modules as-is (includes devDependencies) rather
# than a separate `--prod` reinstall: a prod-only install drops the `prisma`
# devDependency, which apps/api's own postinstall (`prisma generate`) needs.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
