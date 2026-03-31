FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_WS_HOST
ARG NUXT_PUBLIC_WS_PORT
ARG NUXT_PUBLIC_WS_SCHEME

RUN npm run build

# ---------- Production ----------
FROM node:22-slim

WORKDIR /app

COPY --from=build /app/.output .output

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
