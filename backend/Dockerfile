# ---- Etapa 1: build (con todas las deps + genera el Prisma Client) ----
FROM node:22-alpine AS build
WORKDIR /app

# Prisma detecta la versión de OpenSSL para elegir el binario del engine.
# Alpine no la trae por defecto — sin esto, `prisma generate` falla al arrancar
# con "Prisma failed to detect the libssl/openssl version".
RUN apk add --no-cache openssl

# El lockfile primero: capa cacheada — solo se rehace si cambian package*.json
COPY package*.json ./
RUN npm ci

# Schema antes que el resto del código: prisma generate solo depende de él
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

# ---- Etapa 2: TESTS (TP5) ----
# La suite corre con vitest --coverage sobre la etapa build. Si algún test falla
# o la cobertura no llega al umbral de vitest.config.js, `docker build` falla
# entera → el job del pipeline se pone rojo → el gate del TP4 bloquea el merge.
FROM build AS test
COPY vitest.config.js ./
RUN npm run test:ci
# El reporte de coverage queda en /app/coverage. La etapa `final` lo copia (aunque
# no lo use) sólo para forzar a buildkit a construir `test` antes de `final` —
# sin esta dependencia, buildkit saltearía la etapa entera y los tests no correrían.

# ---- Etapa 2b: coverage-export (solo para extraer el reporte en el CI) ----
# `docker buildx build --target coverage-export --output type=local,dest=./x`
# escribe SOLO el contenido de esta etapa en el filesystem del runner.
# En runtime (compose) esta etapa no se usa — es un anexo para el pipeline.
FROM scratch AS coverage-export
COPY --from=test /app/coverage /

# ---- Etapa 3: runtime (mismo Node, sin cache de npm, sin código de dev) ----
FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL en runtime también: Prisma lo usa al aplicar migraciones y al conectar.
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# El cliente generado (motores nativos + JS) viaja tal cual: regenerarlo en
# runtime obligaría a bajar el binario de la CPU del contenedor otra vez.
COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src ./src

# Copiamos el reporte de coverage — el archivo no se usa en runtime, pero fuerza
# a buildkit a construir la etapa `test` (que corre los tests) antes que `final`.
COPY --from=test /app/coverage /_coverage-report

EXPOSE 8080

# Aplica migraciones + seed idempotente + arranca la API. `migrate deploy` es
# la variante de producción: aplica las migraciones ya versionadas, no crea
# ninguna nueva (a diferencia de `migrate dev`).
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node src/index.js"]
