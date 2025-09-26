# Simple production Dockerfile
FROM node:20-alpine as base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY tsconfig.build.json tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]

