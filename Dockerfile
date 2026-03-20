FROM node:24-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:1.28.2-alpine

ENV INCUS_BACKEND=https://127.0.0.1:8443
ENV INCUS_TLS_VERIFY=off

COPY docker/nginx/default.conf.template /etc/incus-ui/default.conf.template
COPY docker/nginx/render-config.sh /docker-entrypoint.d/40-render-incus-ui-config.sh
RUN chmod +x /docker-entrypoint.d/40-render-incus-ui-config.sh

COPY --from=build /app/build/ui /usr/share/nginx/html/ui
COPY --from=build /app/build/index.html /usr/share/nginx/html/index.html

EXPOSE 5566