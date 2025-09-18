# ---------- Build stage ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
# Use ci if you have a lockfile; fall back to install otherwise
RUN npm ci --no-audit --no-fund || npm install

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine

# Install bash so you can `docker exec -it tasks_frontend bash`
RUN apk add --no-cache bash

# Serve the built app
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
# nginx image already sets the CMD to run nginx in the foreground
