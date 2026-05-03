FROM node:20-slim AS build

WORKDIR /app/admin

ARG VITE_API_URL=http://localhost:5000
ARG VITE_GRAFANA_URL=http://localhost:3000
ARG VITE_GRAFANA_DASHBOARD_URL=http://localhost:3000

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GRAFANA_URL=$VITE_GRAFANA_URL
ENV VITE_GRAFANA_DASHBOARD_URL=$VITE_GRAFANA_DASHBOARD_URL

COPY admin/package*.json ./

RUN npm install

COPY admin/. .
COPY shared /app/shared

RUN npm run build

FROM nginx:1.27-alpine

COPY admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/admin/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]