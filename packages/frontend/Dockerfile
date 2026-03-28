FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ 
COPY packages/frontend/package.json ./packages/frontend/
RUN pnpm install --frozen-lockfile

COPY packages/frontend/ ./packages/frontend/

WORKDIR /app/packages/frontend

FROM base AS development
CMD [ "pnpm", "dev", "--host"]

FROM base AS builder
RUN pnpm build

FROM nginx:stable-alpine AS runner
ENV NODE_ENV=production
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY --from=builder /app/packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
CMD sed -i "s/\${PORT}/${PORT:-80}/g" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'