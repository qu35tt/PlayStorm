# syntax=docker/dockerfile:1
ARG NODE_VERSION=22-bullseye
ARG GO_VERSION=1.25-trixie

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
COPY apps/frontend/package*.json apps/frontend/
RUN npm ci

FROM deps AS build-backend
COPY . .
RUN npm run --workspace apps/backend build

FROM deps AS build-frontend
COPY . .
RUN npm run --workspace apps/frontend build

FROM node:${NODE_VERSION} AS backend
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-backend /app/apps/backend/dist ./apps/backend/dist
COPY apps/backend/package*.json apps/backend/
EXPOSE 3000
RUN npm run --workspace apps/backend start:dev

FROM nginx:1.27-alpine AS frontend
COPY --from=build-frontend /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM golang:${GO_VERSION} AS media-build
WORKDIR /app
COPY apps/media-server/go.mod ./
RUN go mod download
COPY apps/media-server/ .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/media-server

FROM alpine:3.20 AS media
WORKDIR /app
COPY --from=media-build /out/media-server /app/media-server
EXPOSE 8080
CMD ["/app/media-server"]