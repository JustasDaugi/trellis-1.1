FROM node:20.14.0-alpine3.20 AS builder

WORKDIR /app

COPY package*.json ./

COPY server/package*.json ./server/

RUN npm ci

COPY . .

WORKDIR /app/server
RUN npm run build

FROM node:20.14.0-alpine3.20 AS runner

WORKDIR /app

COPY --from=builder /app/server/dist ./server/dist

COPY server/package*.json ./server/

WORKDIR /app/server

RUN npm ci --production

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
