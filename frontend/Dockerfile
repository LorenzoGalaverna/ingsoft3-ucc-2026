# ---- Etapa 1: build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                 # ci, no install: respeta el lockfile
COPY . .
RUN npm run build

# ---- Etapa 2: TESTS (TP5) ----
# vitest --coverage con thresholds de vite.config.js. Si algún test falla o la
# cobertura no llega al umbral, `docker build` falla → job rojo → gate bloquea merge.
FROM build AS test
RUN npm run test:ci

# ---- Etapa 2b: coverage-export (solo para extraer el reporte en el CI) ----
FROM scratch AS coverage-export
COPY --from=test /app/coverage /

# ---- Etapa 3: nginx sirve los estáticos ----
FROM nginx:alpine
# La plantilla va a /etc/nginx/templates/ — la imagen oficial procesa esos
# archivos con envsubst al arrancar (TP6 §3.3): reemplaza ${BACKEND_URL} y
# ${DNS_RESOLVER} por los valores del env y deja el conf final en /etc/nginx/conf.d/.
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Defaults pensados para docker compose local: 'backend' es el nombre del
# servicio, 127.0.0.11 el DNS interno de Docker. En Render los pisan las
# variables del servicio (BACKEND_URL con la URL pública, DNS_RESOLVER=8.8.8.8).
ENV BACKEND_URL=http://backend:8080 \
    DNS_RESOLVER=127.0.0.11
# Copiamos el reporte de coverage sólo para forzar a buildkit a construir la
# etapa `test` (que corre los tests) antes que la final — sin esto, buildkit
# la saltearía porque `final` no depende de `test`.
COPY --from=test /app/coverage /_coverage-report
EXPOSE 80
