# Synteco API — NestJS production image
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-api-client/package.json ./packages/shared-api-client/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api
RUN npx prisma generate && npx nest build

# ── Production ──
FROM node:22-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-api-client/package.json ./packages/shared-api-client/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --prod --filter @synteco/api

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/shared-types ./packages/shared-types
COPY --from=builder /app/packages/shared-api-client ./packages/shared-api-client

WORKDIR /app/apps/api
RUN pnpm prisma generate

# Не работать от root: иначе любая уязвимость в приложении сразу даёт root
# внутри контейнера, а оттуда до хоста один шаг.
# UID/GID фиксированные (1001) — том с загрузками на хосте должен принадлежать
# этому же UID, иначе контейнер не сможет в него писать. См. infra/docker/README.md
RUN addgroup -g 1001 -S app \
    && adduser -u 1001 -S app -G app -h /home/app \
    && mkdir -p /home/app \
    && mkdir -p /app/apps/api/uploads \
    && chown -R 1001:1001 /app/apps/api/uploads \
    && chown -R 1001:1001 /home/app /app
ENV HOME=/home/app
USER 1001:1001

EXPOSE 3000
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]
