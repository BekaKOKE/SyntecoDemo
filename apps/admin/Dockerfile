# Synteco Admin — Next.js admin panel production image
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-api-client/package.json ./packages/shared-api-client/
COPY apps/admin/package.json ./apps/admin/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

WORKDIR /app/apps/admin
RUN npx next build

# ── Production ──
FROM node:22-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-api-client/package.json ./packages/shared-api-client/
COPY apps/admin/package.json ./apps/admin/

RUN pnpm install --frozen-lockfile --prod --filter @synteco/admin

COPY --from=builder /app/apps/admin/.next ./apps/admin/.next
RUN mkdir -p /app/apps/admin/public
COPY --from=builder /app/apps/admin/next.config.ts ./apps/admin/
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/admin
ENV API_URL=http://synteco-api:3000
# Не работать от root: иначе любая уязвимость в приложении сразу даёт root
# внутри контейнера, а оттуда до хоста один шаг.
# UID/GID фиксированные (1001) — том с загрузками на хосте должен принадлежать
# этому же UID, иначе контейнер не сможет в него писать. См. infra/docker/README.md
RUN addgroup -g 1001 -S app \
    && adduser -u 1001 -S app -G app -h /home/app \
    && mkdir -p /home/app \
    && chown -R 1001:1001 /home/app /app
ENV HOME=/home/app
USER 1001:1001

EXPOSE 3002
CMD ["npx", "next", "start", "-p", "3002"]
