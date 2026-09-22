FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321
# `apk upgrade` aplica as correcoes ja publicadas pelo Alpine mesmo quando a imagem-base
# em cache esta velha (Trivy 22/09/2026: libssl3/libcrypto3 3.5.7-r0 -> 3.5.8-r0).
# npm/npx/corepack nao rodam em runtime (o container so executa `node`), e as deps
# embutidas do npm (tar, pacote, sigstore, ip-address) trazem CVEs para o scan da
# imagem — o Trivy de 22/09/2026 acusou tar 7.5.11 como CRITICAL por causa delas.
RUN apk upgrade --no-cache \
    && apk add --no-cache curl \
    && addgroup -S astro \
    && adduser -S astro -G astro \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
       /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn*
COPY --from=build --chown=astro:astro /app/dist ./dist
COPY --from=build --chown=astro:astro /app/node_modules ./node_modules
COPY --from=build --chown=astro:astro /app/package.json ./package.json
USER astro
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD curl --fail --silent --show-error http://127.0.0.1:4321/health || exit 1
CMD ["node", "./dist/server/entry.mjs"]
