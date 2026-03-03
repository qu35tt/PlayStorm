FROM node:22-alpine AS base
WORKDIR /app

# Copy root and workspace package files for caching
COPY package*.json ./
COPY apps/backend/package*.json ./backend/
COPY apps/frontend/package*.json ./frontend/

FROM base AS backend-builder
WORKDIR /app/backend

COPY /apps/backend .
COPY /apps/backend/.env .

RUN npm install

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# FROM base AS frontend-builder

# COPY apps/frontend ./frontend
# COPY apps/frontend/*.env /frontend/

# RUN npm run build

FROM backend-builder AS backend
WORKDIR /app/backend
ENV NODE_ENV=production

EXPOSE 4000
CMD ["node", "dist/src/main.js"]