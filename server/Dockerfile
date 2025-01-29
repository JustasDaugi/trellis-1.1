FROM node:20.14.0-alpine3.20 AS builder

WORKDIR /app


COPY package*.json ./
COPY client/package*.json client/
COPY server/package*.json server/

RUN npm ci

COPY server/ ./server/

WORKDIR /app/server

RUN npm run build

RUN npm run migrate:latest:prod

EXPOSE 3000

ENV HOST 0.0.0.0
ENV PORT 3000

CMD ["node", "dist/index.js"]
