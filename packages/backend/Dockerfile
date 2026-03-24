FROM node:24-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ 
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --frozen-lockfile
RUN pnpm install -g nodemon

COPY packages/backend/ ./packages/backend/

WORKDIR /app/packages/backend

CMD [ "pnpm", "start"]