FROM node:22-alpine AS base
WORKDIR /app

# Copy root and workspace package files for caching
COPY package*.json ./
COPY apps/backend/package*.json ./backend/
COPY apps/frontend/package*.json ./frontend/

FROM base AS backend-builder
WORKDIR /app/backend

COPY apps/backend .
COPY apps/backend/*.env .

RUN npm install

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

FROM base AS frontend-builder
WORKDIR /app/frontend

COPY apps/frontend .
COPY apps/frontend/*.env .

RUN npm install
RUN npm run build

FROM backend-builder AS backend
WORKDIR /app/backend
ENV NODE_ENV=production

EXPOSE 4000
CMD ["node", "dist/main"]

FROM nginx:alpine  AS frontend
WORKDIR /app/frontend

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80