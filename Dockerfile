# syntax=docker/dockerfile:1

# ビルドの段は、ランナーの CPU（x86）のまま動かす（エミュレーションしない）。
# Next.js の出力（standalone）は JavaScript だけなので、実行の段（arm64）にそのまま持っていける。
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# 実行の段は、対象の CPU（linux/arm64）。RUN を使わない（エミュレーションが要らないように）。
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 8080
CMD ["node", "server.js"]
