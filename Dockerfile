FROM node:20-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/

RUN npm ci --workspace=shared --workspace=server

COPY shared/ shared/
COPY server/ server/
COPY tsconfig.base.json ./

RUN npm run build -w shared
RUN npm run build -w server

FROM node:20-slim
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/shared/package.json shared/
COPY --from=builder /app/server/package.json server/
RUN npm ci --workspace=shared --workspace=server --omit=dev

COPY --from=builder /app/shared/ shared/
COPY --from=builder /app/server/dist/ server/dist/

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
