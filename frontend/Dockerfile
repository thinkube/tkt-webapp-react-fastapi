# Build stage - use optimized base from library
ARG CONTAINER_REGISTRY
FROM ${CONTAINER_REGISTRY}/library/node:24-alpine AS build-stage
WORKDIR /app

# thinkube-style is installed straight from its git repository
RUN apk add --no-cache git

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# Runtime stage - minimal image for serving built files
ARG CONTAINER_REGISTRY
FROM ${CONTAINER_REGISTRY}/library/nginx:stable-alpine AS runtime-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
