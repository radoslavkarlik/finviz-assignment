FROM swaggerapi/swagger-ui:latest AS swagger-assets

FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY --from=swagger-assets /usr/share/nginx/html ./packages/backend/public/docs
COPY packages/backend/swagger.json ./packages/backend/public/docs/swagger.json

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ 
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --frozen-lockfile

COPY packages/backend/ ./packages/backend/

WORKDIR /app/packages/backend

FROM base AS development
RUN sed -i 's|https://petstore.swagger.io/v2/swagger.json|./swagger.json|g' ./public/docs/swagger-initializer.js
CMD [ "pnpm", "start"]

FROM base AS builder
RUN pnpm build

FROM node:24-alpine AS runner
COPY --from=base /app/packages/backend/parsed.json ./parsed.json
COPY --from=base /app/packages/backend/public/docs ./public/docs
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=base /app/packages/backend/node_modules/@electric-sql/pglite ./dist/node_modules/@electric-sql/pglite

RUN sed -i 's|https://petstore.swagger.io/v2/swagger.json|./swagger.json|g' ./public/docs/swagger-initializer.js

ENV NODE_ENV=production

CMD ["node", "./dist/index.js"]