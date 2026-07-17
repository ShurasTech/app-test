# Multi-stage build: compile the static PWA, then serve it with nginx.
# See docker-compose.yml for how this image is wired to the dedicated
# app-test Traefik (AD-2, AD-7, AD-8 in the architecture spine).

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
