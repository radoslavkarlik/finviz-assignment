FROM node:20-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ 
COPY packages/frontend/package.json ./packages/frontend/
RUN pnpm install --frozen-lockfile

COPY packages/frontend/ ./packages/frontend/

WORKDIR /app/packages/frontend

CMD [ "pnpm", "dev", "--host"]