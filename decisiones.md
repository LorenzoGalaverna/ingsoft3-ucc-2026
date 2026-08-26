# Decisiones — Historial acumulado del semestre

Este archivo se acumula TP a TP: cada trabajo agrega su sección al final. El más viejo (TP1) queda al principio; el más nuevo (TP2 en adelante), abajo, para que el crecimiento sea evidente en el historial de Git.

---

# TP1 — Git colaborativo

---

## 1. Por qué Git no pudo resolver el conflicto solo

### Qué pasó exactamente

Las dos ramas nacieron del **mismo** commit de `main` (`7a9ba74`, el merge del PR #1 con la sección de instalación):

```
                    ┌── 1fc8960  feature/titulo-a   "# Proyecto IngSoft3 - versión A"
7a9ba74 (main) ─────┤
                    └── bc1662f  feature/titulo-b   "# Proyecto IngSoft3 - versión B"
```

Las dos reescribieron la **línea 1** del `README.md`. Cuando `feature/titulo-a` se mergeó (PR #2), `main` pasó a tener `versión A`. Al intentar integrar `feature/titulo-b` (PR #3), Git hizo lo que hace siempre: un merge de 3 vías, comparando las dos puntas contra el **ancestro común** (`7a9ba74`, donde la línea decía `# ingsoft3-tp01`).

El resultado de esa comparación fue:

| | Línea 1 del README |
|---|---|
| Ancestro común (`7a9ba74`) | `# ingsoft3-tp01` |
| `main` (después del PR #2) | `# Proyecto IngSoft3 - versión A` |
| `feature/titulo-b` | `# Proyecto IngSoft3 - versión B` |

**Las dos ramas cambiaron la misma línea respecto del ancestro, y la cambiaron distinto.** Ahí Git se detiene. No es una limitación técnica que se pueda mejorar con un algoritmo más listo: Git compara texto, no entiende de qué habla el texto. No existe ninguna regla mecánica que le permita decidir si el título del proyecto es "versión A" o "versión B", porque esa respuesta no está en los archivos — está en la cabeza del equipo.

Por eso Git hace lo único honesto que puede: **escribe las dos versiones en el archivo, marca dónde empieza y termina cada una, y le devuelve la decisión a una persona.** El conflicto no es un error de Git; es Git negándose a inventar una respuesta que no tiene.

La prueba de que el criterio es "misma línea" y no "mismo archivo" está en la captura 3: la sección `## Instalación`, en el mismo `README.md`, **se fusionó sola**. Ninguna de las dos ramas la había tocado, así que no había nada que decidir.

### Qué habría tenido que pasar para que nunca apareciera

Tres caminos, de más realista a más ilusorio:

1. **Integrar antes.** Si `feature/titulo-b` se hubiera creado *después* de mergear `feature/titulo-a` —o hubiera hecho `git pull` de `main` antes de tocar el README—, habría partido de un `main` que ya tenía `versión A`. Su cambio habría sido una edición secuencial, no paralela: sin conflicto. Esta es la razón concreta por la que la investigación DORA insiste con integrar a *trunk* al menos una vez por día. **Ramas cortas no evitan los conflictos: los hacen chicos y triviales.** El *merge hell* es lo que pasa cuando una rama vive tres semanas.

2. **Que las dos ramas no tocaran la misma línea.** Si el trabajo estuviera repartido de manera que cada rama toca una zona distinta del archivo, Git fusiona sin preguntar (como pasó con `## Instalación` del PR #1). Es un argumento a favor de dividir el trabajo por archivo o por sección, no de que dos personas editen el mismo párrafo en paralelo.

3. **Que alguien decidiera antes de escribir.** El conflicto de Git es el síntoma; la causa es que dos personas tomaron decisiones incompatibles sobre lo mismo sin hablar. Ninguna herramienta arregla eso.

Vale decir lo obvio: en este TP el conflicto **se fabricó a propósito**, siguiendo la §4.6 de la guía. El objetivo no era evitarlo sino provocarlo en un entorno controlado, que es mucho mejor que encontrárselo por primera vez en un repositorio de trabajo.

---

## 2. Qué problemas encontré y cómo los solucioné

### a) El push rechazado (que no es un problema, pero lo parece)

`git push` devolviendo `! [remote rejected] main -> main (protected branch hook declined)` es el resultado **buscado**, no un error a arreglar: es la prueba de que la protección funciona. Lo anoto porque la primera reacción natural frente a un `error:` en rojo es intentar dar vuelta la configuración, y acá el rojo era el éxito. El commit local se descartó con `git reset --hard HEAD~1`.

### b) Las aprobaciones obligatorias, que la guía avisa y conviene no olvidar

La protección se creó con `required_approving_review_count: 0` a propósito. GitHub **no permite que el autor de un PR apruebe su propio PR** —no es configurable, la opción aparece deshabilitada, y por API devuelve `422 Can not approve your own pull request`—, así que en un TP individual pedir aunque sea 1 aprobación deja los PRs imposibles de mergear, con un mensaje de error que no señala la causa real. En un equipo real ese número va en 1 o más; acá va en 0 y la revisión la hago yo, leyendo el diff antes de apretar el botón.

---

## 3. Declaración de uso de IA

Trabajé con un asistente de IA (Claude Opus 4.7 en Claude Code) durante este TP, con supervisión activa: cada acción con impacto en el repo pasó por una aprobación mía explícita, y ninguna decisión de diseño quedó en manos del agente. La distinción entre lo que hice yo y lo que ejecutó el asistente se traza así.

### Lo que decidí y controlé

- **El contenido del conflicto**. Antes de fabricarlo dejé escrito que ganara la **versión B**, y **cómo** resolverlo: a mano, borrando los marcadores del `README.md`, no con *Accept current change* ni con `git checkout --ours`. Ese era el punto del ejercicio; automatizar la resolución lo habría vaciado.
- **La aprobación de cada acción con blast radius**: la creación del repo público, el `gh api PUT` de la protección de rama, cada tag y la release publicada. El clasificador de permisos del asistente fue redundante con mi propia revisión — todas pasaron por dos gates, no uno.
- **Las tres capturas de la UI de GitHub (2, 3, 4)**. Las saqué yo desde el navegador ya logueado. El asistente intentó automatizarlas (extensión Chrome, headless, AppleScript) pero cada camino chocó con auth o permisos; delegar en él las capturas de una sesión logueada como yo no era un atajo — era un problema.
- **La revisión del diff de cada PR antes del squash-merge**. El PR obligatorio del TP1 no exige aprobación (no puede — GitHub no deja aprobar tu propio PR), pero sí obliga a que el cambio pase por la pantalla del PR. Leí el diff completo de cada uno antes de apretar merge.

### Lo que ejecutó el asistente (bajo mi indicación)

- Los comandos concretos de Git y de la CLI de GitHub (`switch`, `merge`, `tag`), la aplicación del JSON de protección de rama a la API, la apertura de los Pull Requests, el borrado de las ramas después del merge.
- La redacción inicial de las descripciones de los PRs y de este archivo, sobre la base de las decisiones anteriores. Revisé cada texto antes de commitearlo — cuando algo no me representaba, lo corregí (esta misma sección la reescribí porque la primera versión minimizaba mi rol).

### Lo que vino dado por el enunciado

La plataforma (GitHub), la visibilidad del repo (público, requisito §4), la protección de `main` sin bypass, la estrategia squash merge, la convención `feature/<descripción>`. Nada de eso lo eligió el asistente ni yo — lo pide la guía §4.4-§4.9.

### La defensa oral no se delega

Todo lo que está acá escrito tengo que poder explicarlo yo. Este archivo no reemplaza haber entendido el ejercicio: lo documenta.

### Cómo verifiqué cada resultado contra el estado real del repositorio

El criterio fue no darle por cierto al agente **ninguna** afirmación sobre el estado del repositorio. Todo lo que se afirma acá y en `evidencias.md` está verificado contra la fuente real —la API de GitHub y el repositorio local—, no contra el relato de lo que se hizo:

| Qué se afirma | Cómo se comprobó |
|---|---|
| `main` está protegida, sin bypass, con 0 aprobaciones | `GET /repos/LorenzoGalaverna/ingsoft3-tp01/branches/main/protection` → `enforce_admins.enabled=true`, `required_approving_review_count=0`, `allow_force_pushes=false`, `allow_deletions=false` |
| El push directo se rechaza de verdad | Se intentó realmente, con `main` ya protegida. La imagen 1 renderiza la **salida literal** de esa ejecución (guardada en `/tmp/push-output.txt`). El rechazo lo emite el servidor con `remote: error: GH006` |
| Todos los cambios entraron por PR mergeado con squash | `gh pr list --state merged` devuelve 3 PRs; `git log --oneline main` muestra un commit por PR (`(#1)`, `(#2)`, `(#3)`) y ningún commit en `main` sin PR salvo los dos administrativos anteriores a la protección (Initial commit y el `.gitignore`) |
| Las ramas A y B partieron del mismo commit | `git merge-base origin/feature/titulo-a origin/feature/titulo-b` → `7a9ba74`, el mismo commit que era la punta de `main` después del PR #1. Si hubieran estado encadenadas no habría habido conflicto y el ejercicio no probaría nada |
| El PR #3 tuvo conflicto real | La API devolvió `mergeable=CONFLICTING` y `mergeStateStatus=DIRTY` **antes** de resolverlo, y `MERGEABLE / CLEAN` después. La captura 2 se sacó en la ventana entre esos dos estados |
| El conflicto se resolvió a mano y ganó B | El commit de resolución (`80833a4 fix: resuelve conflicto de título del proyecto (gana versión B)`) está en el historial del PR #3, y la línea 1 del `README.md` en `main` dice `# Proyecto IngSoft3 - versión B`. Se verificó además que no quedara ningún marcador (`grep -nE '^(<{7}\|={7}\|>{7})' README.md` → sin resultados) |
| El tag y la release existen y apuntan a la punta de `main` | `git cat-file -p v1.0.0` muestra el objeto tag anotado `fa0b8c6` apuntando al commit `a906376`; `GET /repos/.../releases/tags/v1.0.0` devuelve `target_commitish=main` y `published_at=2026-08-09T22:49:43Z`. El commit `a906376` es la punta de `main` |
| Las capturas muestran lo que dicen mostrar | Las abrí y las miré una por una antes de comitear |

Esa última fila es la que resume el método. El agente puede reportar que un paso salió bien y haber, sin mentir, producido un artefacto inservible. La verificación no consiste en preguntarle si funcionó: consiste en ir a mirar el estado real, que en este TP es la API de GitHub, el historial de Git y las imágenes abiertas de a una.

---
---

# TP2 — Contenedores

---

## 1. Qué app elegí y por qué

**Habit Tracker con mecánica de RPG** (tipo Habitica minimal): hábitos que dan XP al completarse, niveles que se calculan desde XP, y un mismo hábito no se puede completar dos veces el mismo día. Tres pantallas conceptuales (Hoy / Mis hábitos / Bosses), aunque el walking skeleton del TP2 solo implementa la primera.

Contra los cinco criterios de `elegir-app.md`:

| Criterio | Cómo lo cumple |
|---|---|
| **1. Corre local hoy** | El walking skeleton se levanta en dos comandos (`cp .env.example .env` + `docker compose up -d`) y responde en `:8080/:3000` en menos de 20 segundos |
| **2. Comandos de build claros** | Backend: `npm ci` + `prisma generate` (build) → `node src/index.js` (runtime). Frontend: `npm ci` + `vite build` → nginx sirve `dist/` |
| **3. DB por env var** | `DATABASE_URL` para Prisma, `POSTGRES_PASSWORD` para el contenedor de PG. En dev apunta a `localhost:5432`, en compose apunta a `db:5432` — misma imagen, distinta configuración |
| **4. Reglas para el TP5** | Las tengo ya identificadas (ver README §API): validación de `name`, `xpReward` default 10, `xp += reward` en cada completion, `level = floor(xp/100)+1`, unique `(habitId, dayKey)` bloquea doble-completion, autorización por `userId`, soft-visibility solo del usuario propio. **Alcanzan de sobra para 8 tests backend** |
| **5. Puedo modificarla** | La escribí — cada línea es defendible. Cambios típicos que puedan pedir en la mesa (fórmula de XP exponencial, hábito negativo que resta XP, streak que se rompe por día perdido) son ediciones chicas y localizadas |

**Por qué no elegí una app existente de GitHub**: quería una donde las reglas de negocio salieran de mis decisiones, no de las de un tercero. Elegí un problema concreto (habit tracking gamificado) y lo minimicé al walking skeleton más chico que aún tuviera reglas verificables. Un CRUD puro no habría pasado el criterio 4.

**Historia del repo**: este repositorio arrancó como `ingsoft3-tp01` (el del TP1) y fue renombrado a `ingsoft3-ucc-2026` cuando la app entró — GitHub redirige la URL vieja, así que el historial completo (protecciones, PRs del TP1, tags `tp1` y `v1.0.0`) queda intacto.

---

## 2. Decisiones de contenerización

### 2.1 Imágenes base

| Etapa | Imagen | Por qué |
|---|---|---|
| Backend build | `node:22-alpine` | Alpine para que la etapa final chica no herede glibc; Node 22 porque es la LTS actual (mayo 2024–abril 2027). npm ci determinista requiere lockfile v3, que Node 22 escribe por default |
| Backend runtime | `node:22-alpine` | La misma — no vale la pena bajar a `distroless` en el TP2: perdés `sh` y el `sh -c "prisma migrate deploy && node …"` del CMD deja de funcionar |
| Frontend build | `node:22-alpine` | Solo tiene que correr `vite build` — cualquier Node moderno alcanza |
| Frontend runtime | `nginx:alpine` | Sirve estáticos y hace de proxy para `/api`. Es la elección obvia para una SPA — 5 MB comprimidos |
| Base | `postgres:16-alpine` | Postgres 16 es la última major LTS. Alpine para consistencia |

### 2.2 Multi-stage builds

Backend: la etapa `build` instala **todas** las deps (incluidas las de Prisma para poder correr `prisma generate`); la etapa `final` hace `npm ci --omit=dev` sobre `package.json` **y encima** copia `node_modules/@prisma` y `node_modules/.prisma` de la etapa anterior — así el cliente generado (con sus engines binarios) viaja tal cual y no hay que regenerarlo en runtime. Ganancia: `node_modules` de runtime tiene solo prod deps, no las de test/build.

Frontend: idéntico al patrón del sample de la cátedra — Vite emite `dist/`, nginx la sirve. La etapa final no ve una sola línea de Node: es puramente HTML+CSS+JS estático + un `nginx.conf`.

**Tamaño final** (con el `--omit=dev` + capas cacheables):

| Imagen | Disco (`docker images`) | Contenido |
|---|---|---|
| `habit-tracker-backend:v0.1.1` | 446 MB | 123 MB |
| `habit-tracker-frontend:v0.1.1` | 92 MB | 26 MB |
| Base `node:22-alpine` | 217 MB | 68 MB |

El backend supera al base porque incluye Prisma + los engines nativos + Express + los módulos de PG (prod deps pesan ~50 MB en Node más los engines de Prisma que son binarios de 30 MB c/u).

### 2.3 Configuración por variable de entorno (crítico)

**Todo** lo específico del entorno entra por `env`, no por código:

- `DATABASE_URL` — dev apunta a `localhost:5432`, compose apunta a `db:5432`, TP6 va a apuntar a una base gestionada. **La misma imagen** vale para los tres.
- `DB_PASSWORD` — solo vive en `.env` (ignorado por git). El `docker-compose.yml` la interpola en dos lugares (`POSTGRES_PASSWORD` de la base y `DATABASE_URL` del backend).
- `PORT` (opcional, default 8080) — para dev en máquinas con el 8080 ocupado.

Nada de esto está hard-codeado en `src/index.js` ni en `schema.prisma`. Ese es exactamente el requisito del criterio 3 de `elegir-app.md` y el gancho que hace que el TP6 (deploys a QA/PROD) sea barato.

### 2.4 nginx.conf: el archivo que la guía advierte que se olvida

Dos cosas clave:

1. **`proxy_pass` sin barra al final**. `proxy_pass $backend_api;` (donde `$backend_api = http://backend:8080`). Si le pongo `/` al final, nginx reescribe el prefijo y `/api/tareas` llega al backend como `/tareas` → 404 en todo. Lo advierte la guía §3.5 con rojo, y ya me habría pasado si no hubiera leído.
2. **Un solo `resolver 127.0.0.11`** (el DNS interno de Docker). Agregar un DNS público adicional ("por las dudas") produce 502 intermitentes porque nginx alterna entre los dos y el público no sabe qué es `backend`.

### 2.5 Compose: healthcheck + `service_healthy` + volumen nombrado

- **`healthcheck` en `db`** con `pg_isready -U postgres` cada 5s. Sin esto, `depends_on` solo garantiza que el contenedor de PG **arrancó**, no que esté listo — y el backend de Node arrancaría antes de que PG acepte conexiones y crashearía. Con `condition: service_healthy` el backend espera de verdad.
- **Volumen nombrado `db_data`**, no bind mount. Los volúmenes nombrados los administra Docker (en Mac quedan dentro de la VM de Docker) y son notablemente más rápidos que un bind mount del `/var/lib/postgresql/data` en Mac/Windows.
- **`POSTGRES_DB: habits`** en la variable — sin esto, PG nace con la BD `postgres` default, `DATABASE_URL` apunta a `.../habits`, y el backend explota con `database habits does not exist`. La guía §3.6 lo tiene bien marcado.
- **Migraciones en el `CMD` del backend** (`npx prisma migrate deploy && node prisma/seed.js && node src/index.js`). `migrate deploy` es idempotente y solo aplica las migraciones ya versionadas en `prisma/migrations/` (no crea nuevas, a diferencia de `migrate dev`). El seed es un `upsert`, así que también es idempotente. Cada `up` recorrista el pipeline, y en el segundo run `deploy` responde `No pending migrations to apply` en 200 ms.

### 2.6 Registry: ghcr.io con tag semver y multi-arch (parcial)

Elegí ghcr por lo que dice la guía §3.7: token del propio GitHub, aparece pegado al código, y en el TP7 el pipeline se autentica sin secretos con el `GITHUB_TOKEN`. Publicadas como:

- `ghcr.io/lorenzogalaverna/habit-tracker-backend:v0.1.1`
- `ghcr.io/lorenzogalaverna/habit-tracker-frontend:v0.1.1`

**Advertencia honesta sobre arquitectura**: se construyeron en una Mac M-series (ARM), así que solo funcionan en máquinas ARM. En x86 (los runners de CI del TP7, por ejemplo) van a decir `no matching manifest for linux/amd64`. En el TP7 vamos a resolver esto con `docker buildx build --platform linux/amd64,linux/arm64 --push`, que arma un manifiesto multi-arch en el mismo tag.

---

## 3. Problemas encontrados y cómo los resolví

### a) Prisma no arrancaba en Alpine — `Prisma failed to detect the libssl/openssl version`

Al levantar el backend containerizado por primera vez, el contenedor moría con:

```
prisma:warn Prisma failed to detect the libssl/openssl version to use, and may not work as expected.
Error: Could not parse schema engine response: SyntaxError: Unexpected token 'E', "Error load"... is not valid JSON
```

Alpine no viene con OpenSSL — solo con `libssl` embebido en musl, y Prisma no lo detecta como una versión reconocida. Los engines de Prisma están compilados contra `openssl-1.1.x` o `openssl-3.0.x` y necesitan que la lib esté presente.

**Fix**: `RUN apk add --no-cache openssl` en **las dos etapas** del Dockerfile (build y final). Podría haber puesto solo en la final, pero prefiero que las dos etapas sean lo más parecidas posible — si en el futuro corriera `prisma generate` en la etapa final también, no me sorprendería.

**Trampa que sí evité**: la primera versión publicada (v0.1.0) no tenía el fix. La descubrí probando el `docker-compose.registry.yml` — el sistema levantaba db + frontend pero el backend crasheba. La imagen local (rebuildeada con el fix) andaba, pero la del registry no. Es un caso concreto de por qué **la única prueba de que una imagen sirve es correrla desde el registry**, no desde la caché local. Bumpé a v0.1.1 y republiqué.

### b) `docker tag` no copió — mismo ID, dos nombres

`docker tag habit-tracker-backend:dev ghcr.io/.../habit-tracker-backend:v0.1.1` completa en milisegundos y `docker images` muestra las dos entradas con el **mismo `IMAGE ID`**. Es el matiz que la guía §3.7 subraya: `docker tag` **no copia bytes**, solo agrega un nombre a una imagen existente. Que después el `rmi` tenga que llevar los dos nombres al hacer limpieza es consecuencia directa de esto: si borrás solo uno, Docker responde `Untagged` y no libera nada.

### c) El backend del compose se mataba silenciosamente el primer día

Al primer `docker compose up -d --build`, `docker compose ps` mostraba solo `db` y `frontend` levantados. Ni error ni warning en el terminal — hay que ir a mirar con `docker compose ps -a` (nótese el `-a`) para ver los contenedores exited. Era el mismo bug de OpenSSL (b), pero el modo de descubrimiento es el interesante: **`ps` sin `-a` esconde los muertos** — es la primera cosa que hay que aprender a mirar en compose. Lo agregué al mental checklist "cuando algo del compose parece no arrancar".

**Fix estándar**: bucle `until curl -sf http://localhost:8080/health >/dev/null; do sleep 1; done` antes del curl real. La guía §3.6 tiene esto en un aviso naranja — vale igual para todos los TPs que vienen (CI, e2e, monitoreo).

---

## 4. Declaración de uso de IA

Mismo esquema de trabajo que en el TP1: asistente de IA (Claude Opus 4.7 en Claude Code) con supervisión activa, todas las decisiones de diseño y cada acción con impacto en el repo aprobadas por mí.

### Lo que decidí y controlé

- **La elección de la app y del stack**. Habit Tracker con mecánica de RPG fue mi decisión, después de descartar tres alternativas que el asistente me propuso (polla entre amigos, escape room digital, fantasy F1). El stack —Node/Express + Prisma + React/Vite— lo elegí explícitamente sobre .NET y Python por familiaridad, y para tener una sola cadena de tooling entre back y front.
- **Todas las reglas de negocio** que están en el código las definí antes de escribir una línea. Los umbrales (`XP_PER_LEVEL = 100`), la fórmula del nivel (`floor(xp/100) + 1`), la regla "un hábito por día" implementada como índice único `(habitId, dayKey)`, la validación de `name`, `xpReward` default 10, la autorización por `USER_ID` — cada una tiene un porqué que puedo defender, y ninguna la inventó el asistente.
- **Decisiones de arquitectura que pesan**: `USER_ID = 1` hardcodeado (walking skeleton, la auth queda para más adelante); una sola pantalla implementada (Hoy) en vez de las tres del diseño (Mis hábitos y Bosses llegan cuando los TPs las requieran); el commit de las migraciones de Prisma al repo (para que `migrate deploy` en el contenedor tenga qué aplicar); Prisma movido de `devDependencies` a `dependencies` (para que corra en el runtime con `npm ci --omit=dev`).
- **La política de secretos**: `.env` en `.gitignore`, `.env.example` versionado, `DB_PASSWORD` interpolada en el compose. El asistente ejecutó el `git check-ignore .env` pero la política la definí yo.
- **El rename del repo** de `ingsoft3-tp01` a `ingsoft3-ucc-2026` y el bump de `v0.1.0` → `v0.1.1` cuando descubrimos el bug de OpenSSL en Alpine — los dos con confirmación explícita.
- **La verificación en vivo**: cada `docker compose up -d` que hicimos lo abrí en el navegador (`http://localhost:3000`), creé un hábito, lo completé, vi la XP subir, y refresqué para confirmar que persistía. Todas las capturas que están en `img/tp2-*.png` (los siete PNGs con las evidencias) las validé abriéndolas antes de commitear.

### Lo que ejecutó el asistente (bajo mi indicación)

- Los comandos de Git y GitHub (rama, push, tags, PRs), los de Docker (`build`, `run`, `push`, `compose up/down/logs/ps`), y los de npm/prisma (`ci`, `migrate deploy`, `generate`).
- La escritura inicial del código del walking skeleton (`src/index.js`, `App.jsx`, `styles.css`, `schema.prisma`, `seed.js`, ambos `package.json`) a partir de las reglas de negocio que le pasé. Revisé cada archivo antes de commitearlo — los edits que hice sobre lo que produjo están en el historial del PR #5.
- La escritura inicial de los dos Dockerfiles multi-stage y los `.dockerignore`, del `nginx.conf`, del `docker-compose.yml` y del `docker-compose.registry.yml`, siguiendo el patrón del sample de la cátedra que hicimos primero como práctica (§3.2 de la guía) — así verifiqué que entendía cada línea antes de aplicarlo a mi app.
- La redacción inicial de este archivo, del `evidencias.md`, y del `README.md` de arranque.

### Lo que vino dado por el enunciado

La estructura multi-stage, el patrón nginx-como-proxy con `/api`, el healthcheck con `pg_isready` y el `condition: service_healthy`, ghcr como registry, `type=gha` como backend de cache. Todo eso está en la guía §3.4-§3.7 y no fue elección ni del asistente ni mía.

### La defensa oral no se delega

Todo lo que está en este archivo lo tengo que poder explicar yo — y en particular, cualquier línea de código que muestre en la mesa. Sé qué hace `docker compose down -v` vs `down`, por qué las capas del multi-stage se llaman así, y por qué el nombre `db` en la connection string resuelve al servicio homónimo.

### Cómo verifiqué cada resultado contra el estado real del repositorio

Mismo criterio que en el TP1: **ninguna afirmación del agente sobre el estado real vale sin comprobación directa**. Ni "la imagen se subió", ni "el compose levantó", ni "las tres capas están en el registry". Todo se contrasta contra el estado observable:

| Qué se afirma | Cómo se comprobó |
|---|---|
| Los tres servicios levantan con `docker compose up -d` | `docker compose ps` muestra `db (healthy)`, `backend (Up)`, `frontend (Up)` |
| El backend habla con la DB por el nombre `db` | `docker compose logs backend` muestra `Datasource "db": PostgreSQL database "habits", schema "public" at "db:5432"` — el hostname resuelto es literalmente `db`, no una IP |
| El healthcheck espera de verdad, no da falsos OK | En los logs del compose se ve la secuencia `db Started → db Waiting → db Healthy → backend Starting` — el backend arranca **después** del healthy |
| El volumen persiste entre `down` y `up` | Prueba manual documentada en `evidencias.md`: creé hábito → completé → `down` → `up` → el hábito y la XP siguen. Con `down -v` no siguen |
| Las imágenes están en ghcr.io como públicas | Anonymous token check: `curl -s "https://ghcr.io/token?scope=repository:lorenzogalaverna/habit-tracker-backend:pull&service=ghcr.io"` devuelve un token no vacío (privadas no lo hacen) |
| El sistema arranca desde el registry sin código local | Hice el ejercicio completo: `docker compose down --rmi local -v` + `docker rmi ...` + `docker builder prune -af` + `docker logout ghcr.io` + `docker compose -f docker-compose.registry.yml up -d` — vi las capas bajar en vivo y los tres servicios subir. Después probé el flow: crear hábito via `/api/habits`, completarlo, ver la XP subir. Todo correcto |
| El `.env` está ignorado por git | `git check-ignore .env` devuelve `.env` (existe, ignorado); `git status` no lo lista |
| Las migraciones de Prisma están commiteadas | `ls backend/prisma/migrations/20260812201946_init/` — el `migration.sql` está ahí; sin esto `migrate deploy` en el contenedor no tendría qué aplicar |
| El multi-stage funciona (imagen final chica) | `docker images | grep -E 'sdk|aspnet|habit-tracker|node:22-alpine'` compara tamaños. El backend final (446 MB en disco / 123 MB contenido) supera al base `node:22-alpine` (217 MB / 68 MB) por 100 MB de deps + engines de Prisma. Sin multi-stage y con devDeps encima serían ~700 MB |
| El registry v0.1.0 tenía el bug y v0.1.1 lo arregla | Los dos tags conviven en ghcr; v0.1.0 crashea al arrancar (`Prisma failed to detect the libssl`) y v0.1.1 arranca limpio — verificable ejecutando `docker run --rm ghcr.io/lorenzogalaverna/habit-tracker-backend:v0.1.0` vs `:v0.1.1` con la misma env |

Esa última fila es específica del semver: publicar dos tags a propósito y probar que uno rompe y el otro no es la prueba concreta de que la disciplina de versionado sirve para algo — no es decorativa.

---
---

# TP3 — Planificación DevOps

**URL del Project (público)**: https://github.com/users/LorenzoGalaverna/projects/1

En este TP no hay `evidencias.md`: el Project es público y quien corrige abre la URL y ve la jerarquía, el sprint, el WIP limit y el PR que cerró la tarea. Estas decisiones justifican los tres números que sí elegí yo.

---

## 1. Duración del sprint: **1 semana**

Alineado con el ritmo de la materia: **1 clase = 1 TP**, y a partir del TP2 cada TP es una capa concreta sobre la app del semestre. Un sprint de una semana calza exactamente con la unidad de entrega que ya existe (el TP semanal) — sprint = TP. Alternativas que descarté:

- **2 semanas** (default clásico de la industria) — más aire por historia, pero desalineado con el calendario semanal de la cursada: cerraría a mitad de un TP y arrancaría otro con dos capas mezcladas. Perdería la propiedad más útil del sprint semanal: **cada review cae encima de un checkpoint real de la materia** (el TP entregado).
- **3 semanas** — cubriría TP3+TP4 aproximadamente, sirve para planificar el bloque P1 completo. Pero eso ya lo hace la épica (el "objetivo del semestre"): duplicar el mismo horizonte en el sprint diluye el foco de corto plazo, que es exactamente para lo que existe el sprint.

**Cómo lo pienso defender**: la duración del sprint no tiene "número correcto" — tiene que ser **la unidad más chica en la que el equipo entrega algo verificable**. Acá esa unidad es la clase semanal. En un equipo de producto con release quincenal, dos semanas. En un equipo de infra con canary continuo, quizá una.

---

## 2. Límite de trabajo en progreso: **2**

Regla de la guía §3.3: **cantidad de personas + 1**. Trabajando solo, WIP = 2. El "+1" es la válvula para cuando algo queda esperando (una review, una respuesta, la ejecución de un pipeline) y necesitás mover otra cosa para no quedar parado. Sin el "+1" el WIP se vuelve un candado que penaliza los tiempos de espera legítimos; con más de "+1" el límite deja de limitar y el board se llena de cosas empezadas y no terminadas — que es exactamente lo que un WIP limit existe para evitar.

Alternativas que descarté:

- **WIP = 1** ("terminar antes de empezar" al extremo): teórico bonito, práctico frustrante. Si el `docker compose up -d` está corriendo tests durante 3 minutos, no podés arrancar a leer el próximo issue sin infringir el límite. En la práctica se termina rompiendo el límite y perdiendo la disciplina; mejor tener un número que puedas respetar y ajustar con datos.
- **WIP = 3+**: dejo margen para paralelizar, pero pierdo la señal. Con 3 tarjetas simultáneas nunca voy a **alcanzar** el límite, y la regla de la guía dice literalmente: *"si nunca lo alcanzás, está demasiado alto"*. Un límite que nunca aprieta no está limitando.

**Cómo lo pienso defender**: el WIP es un **experimento**, no un dogma. Empiezo en 2 (personas + 1); si veo que **nunca lo alcanzo**, bajo a 1 y muevo la "válvula de espera" a otro mecanismo (columna Waiting explícita). Si veo que lo alcanzo cada semana y termino postergando cosas urgentes por eso, subo a 3 y anoto el motivo. La respuesta correcta acá **no es el número**: es tener criterio para moverlo con datos.

---

## 3. Diagnóstico de la historia mal escrita

La historia del ejercicio de §3.2 es *"Como desarrollador quiero crear la tabla usuarios para guardar los datos"*.

**Qué tiene de malo, en un renglón**: es una **tarea disfrazada de historia** — el rol ("como desarrollador") y el beneficio ("para guardar los datos") describen implementación técnica, no valor observable por alguien; ningún usuario ni cliente **quiere** una tabla, quiere lo que la tabla habilita.

**Cómo la reescribiría**: subiendo el nivel al valor real. Ejemplo: *"Como visitante quiero registrarme con mi email para poder guardar mi progreso entre sesiones"*. Ahora se ve el rol de verdad (usuario final, no desarrollador), la capacidad observable (registrarse), el beneficio (mantener progreso), y **cae natural una tabla `users` como tarea técnica hija** — junto con el endpoint, la validación de email, la vista de registro. La regla mental: si el "para" describe cómo lo hacés en vez de qué le da al usuario, es tarea, no historia.

---

## 4. Problemas encontrados y cómo los resolví

### a) `gh 2.88` no tiene `--add-sub-issue` (la guía asume 2.94+)

La guía sugiere `gh issue edit <epica> --add-sub-issue <historia>` para armar la jerarquía. Mi `gh --version` era **2.88.1**; el flag apareció en **2.94** (junio 2026). En vez de actualizar gh solo para tres comandos, usé la API REST directa: `POST /repos/{owner}/{repo}/issues/{parent}/sub_issues` con header `X-GitHub-Api-Version: 2022-11-28`.

**Gotcha adicional**: la primera vuelta pasé el `sub_issue_id` con `-f` (string) y devolvió `422 Invalid property /sub_issue_id: "..." is not of type integer`. Se resuelve con `-F` (integer). Documentado en el request, fácil de pasar por alto.

### b) La creación del campo Iteration no se puede hacer por CLI

`createProjectV2Field` de la API GraphQL solo acepta `TEXT / NUMBER / DATE / SINGLE_SELECT` — no `ITERATION`. Los iteration fields requieren configuración adicional (fecha de inicio, duración, iteraciones generadas hacia adelante) y solo se crean via web. La **asignación** de items a un sprint sí se puede hacer por GraphQL (`updateProjectV2ItemFieldValue` con `iterationId`), y así lo hice.

Lo mismo pasa con el WIP limit de la columna: no hay API pública. Es config visual del board view, se hace en la web.

Aprendizaje: los Projects v2 tienen una API GraphQL rica pero incompleta. Para automatizar del todo el setup del board hay que combinar CLI + un par de clicks en la web.

### c) La primera vez el issue quedó cerrado pero fuera del Sprint

Al principio la tarea que iba a cerrar el PR estaba sin sprint asignado. Cuando se cerró vía `Closes`, en el Board apareció directo en **Done** — pero fuera del Sprint 1, así que "no salió del sprint" (nunca entró). Lo detecté mirando la lista de items del project: `Status=Done, Sprint=null`. Corregido asignando el sprint **antes** de mergear el PR. Aprendizaje operativo: para que la vuelta plan↔código valga como evidencia, el issue tiene que **estar en el sprint** cuando entra a *In Progress* — no basta con cerrarlo.

---

## 5. Declaración de uso de IA

Mismo esquema que en TP1 y TP2: asistente de IA con supervisión activa. En este TP la asimetría entre lo humano y lo automatizado es especialmente clara, porque el 100% de la nota depende de tres decisiones que sólo puedo defender si las razoné yo.

### Lo que decidí y controlé

- **Los tres números defendibles** — duración del sprint = 1 semana, WIP = 2, y el diagnóstico de la historia mal escrita. Cada uno lo decidí comparando alternativas concretas (2 y 3 semanas para el sprint; 1 y 3+ para el WIP; qué escribiría en lugar del ejemplo malo) y anoté el razonamiento en las secciones 1-3 de arriba. Son literalmente las respuestas de la defensa oral (§3.3 del enunciado los enumera como preguntas típicas).
- **El contenido de los issues**: título, cuerpo, criterios de aceptación de la historia #7, descripción del bug #10 con el patrón "qué pasa · qué esperaba · cómo reproducirlo". El asistente propuso los primeros drafts sobre la base del video, los edité para que reflejen mi app real (por ejemplo, el bug #10 es un caso concreto del arranque de mi compose, no un genérico).
- **La estructura de la jerarquía**: qué cuelga de qué (historia bajo épica; tareas bajo historia; bug al costado). Es explícitamente lo que la guía §3.2 y §3.3 discuten como decisión de equipo — no es config default.
- **La verificación final** en el navegador: abrí el Project en modo incógnito para confirmar que era realmente público, y navegué a mano la trazabilidad #8 → PR #11 → commit → subir jerarquía, para asegurarme de que la demo en vivo iba a funcionar tal como la voy a mostrar.

### Lo que ejecutó el asistente (bajo mi indicación)

- Los comandos `gh` (`project create`, `label create`, `issue create`, `project item-add`, `project edit --visibility PUBLIC`) y las llamadas GraphQL para las asignaciones al Sprint 1.
- La llamada REST a `POST /repos/.../issues/{parent}/sub_issues` para armar la jerarquía (porque `gh 2.88` no tiene `--add-sub-issue`).
- La escritura del `.github/workflows/ci.yml` esqueleto y la apertura del PR #11 con `Closes #8` en la descripción.
- La redacción inicial de esta sección; los razonamientos de los tres números (secciones 1-3) los revisé línea por línea porque son literalmente lo que voy a decir en la mesa.

### Lo que vino dado por el enunciado

Que sea GitHub Projects (riel canónico); que haya 1 épica + 1 historia + 2 tareas + 1 bug; que la jerarquía sea con sub-issues y no task-lists; que la trazabilidad sea vía `Closes #N` en la descripción del PR. Todo en la guía §3.

Verificaciones concretas contra el estado real del Project, no contra el reporte del agente:

| Qué se afirma | Cómo se comprobó |
|---|---|
| El Project es público | `gh project view 1 --owner "@me" --format json` → `public: true`. Además el chequeo real: abrí la URL en incógnito y renderiza sin login |
| La jerarquía es navegable con sub-issues (no task-lists) | `gh api /repos/.../issues/6` devuelve `sub_issues_summary.total = 1`; issue #7 devuelve `parent_issue_url` apuntando a #6 y `sub_issues_summary.total = 2`. Los task-lists no crean estos campos |
| El bug NO cuelga de la jerarquía | Issue #10 no tiene `parent_issue_url`; su `sub_issues_summary.total = 0`. Está al costado, como pide §3.2 |
| Historia + 2 tareas asignadas al Sprint 1, épica y bug sin sprint | Query GraphQL a `projectV2.items.fieldValues`: #7/#8/#9 devuelven `title: "Sprint 1"`; #6 y #10 no tienen valor de iteration |
| El PR cerró la tarea vía `Closes #N` | `gh issue view 8 --json state,closedAt` → `state: CLOSED`. El timeline del issue muestra el PR #11 como "closed via" |
| El workflow "Item closed → Done" movió la tarjeta | Query GraphQL al item #8 → `Status = Done` — no lo moví a mano |
| El PR entró por la protección del TP1 (no directo a main) | `gh pr view 11 --json state,mergedBy,baseRefName,mergeCommit` → `state: MERGED`, `baseRefName: main`. El historial de `main` muestra un solo commit squasheado por el PR |

**Cómo lo pienso defender**: la trazabilidad completa se prueba en vivo entrando al issue #8 → ver que su timeline dice "closed by PR #11" → click en el PR → ver el commit `8ed8a6e` que agregó `ci.yml` → ver que ese commit está en `main`. De ahí para arriba: issue #8 → sub-issue de #7 (barra 1/2) → sub-issue de #6 (barra 1/1 aún abierta porque la historia sigue viva). Es exactamente la vuelta que la guía §3.4 pide poder navegar.

---
---

# TP4 — CI: Pipelines as Code

**Peso: 45 % de P1** — el más pesado del bloque. El entregable central son cuatro cosas en el repo: el workflow, el gate del PR, la demostración del gate actuando (rojo → verde) y el badge en el README. Todas visibles en `main` y en la pestaña *Actions*.

---

## 1. Estructura del pipeline: por qué esos jobs y por qué en paralelo

Elegí **dos jobs** (`build-backend` y `build-frontend`), uno por Dockerfile, corriendo **en paralelo** en runners independientes. La razón no es cosmética: cada job arranca en una máquina Ubuntu limpia y no comparte filesystem con la otra, así que **paralelizar cuesta lo que dura el job más largo, no la suma**. Para esta app hoy el más largo es `build-backend` (Prisma + engines nativos, ~90 s en la primera corrida; ~75 s con cache); el frontend cierra en ~65 s. En serie el pipeline daría ~150 s; en paralelo, ~90 s. La ganancia crece con cada dependencia que se le agrega al backend.

Otra alternativa era **un solo job** con dos steps consecutivos de build. Ventaja: un solo runner, un solo *setup-buildx*, un solo cache warmup. Desventaja: si el backend rompe, el step del frontend no llega a correr — y perdés la información de que el frontend estaba bien. Con dos jobs, el `build-backend: FAILURE` convive con `build-frontend: SUCCESS`, y el log dice **dónde** está el problema sin más navegación. Para un TP con dos Dockerfiles separados, dos jobs es la elección correcta.

**El pipeline no compila por su cuenta**, y esto es de fondo: usa **los mismos Dockerfiles del TP2**. Si el workflow tuviera `dotnet build` por un lado y `docker build` por el otro (o `npm run build` para el front sin Docker), habría **dos definiciones de build** — el `docker build` que corre en la nube y el `docker compose` que corre en mi máquina — que tarde o temprano divergen. Y estarías verificando una compilación distinta de la que después desplegás. Este es exactamente el problema que resuelve el patrón *"si no está en el repo, no existe"* aplicado al proceso de construcción: la definición vive en el Dockerfile del TP2 y **el pipeline lo consume**, no lo replica.

---

## 2. Cache: qué se guarda, qué se reutiliza, y qué pasa si desaparece

**Qué se cachea**: las **capas** que produce el `docker build`. Cada instrucción del Dockerfile que toca el filesystem (`RUN`, `COPY`, `ADD`) deja una capa; el resto son metadatos. Si la capa que instala dependencias no cambió respecto a la corrida anterior, se reutiliza en vez de rehacerse — por eso el Dockerfile del TP2 copia primero `package*.json` / `Backend.sln` y **después** el código, para que un cambio en el código no invalide la capa que instaló dependencias.

**Dónde se guarda**: en el **cache de GitHub Actions** (`type=gha`). No es el Docker local (que se destruye con el runner), ni el de mi máquina, ni un registry. Es un almacén cifrado que administra GitHub, con límite de 10 GB por repo y desalojo automático (last-recently-used).

**Cuánto se reutiliza en la segunda corrida** (medido acá, con un commit vacío entre las dos):

| Job | Capas con `CACHED` en la corrida 2 |
|---|---|
| `build-backend` | 14 |
| `build-frontend` | 7 |

La asimetría refleja los dos Dockerfiles: el del backend es multi-stage con dos rondas de `npm ci` + `apk add openssl` + `prisma generate`, así que son más capas discretas para reutilizar. El frontend tiene menos porque el runtime (nginx sirviendo estáticos) es casi todo la imagen base y una sola capa de `COPY /app/dist`.

**Tres detalles del cache que me importan poder defender**:

1. **`scope` distinto por job es obligatorio, y su ausencia no da error**: sin `scope`, los dos jobs usan el default (`buildkit`) y **se pisan** — el último en terminar sobreescribe el cache del otro. Lo que ves en corridas siguientes es un job `CACHED` y otro no, y cuál cambia según cuál terminó último. No es aleatorio: es que están compartiendo estante. Lo puse `scope=backend` / `scope=frontend` para separarlos.
2. **`setup-buildx-action@v4` es necesario, no decorativo**. El constructor de fábrica de Docker (`docker` driver) **no sabe exportar capas** a un almacén externo — las guarda solo en el disco de la máquina, que en el runner se destruye. `setup-buildx-action` monta otro constructor (`docker-container` driver) que sí sabe hablar con `type=gha`. Si me lo olvido, el build **falla** en el paso de build con `Cache export is not supported for the docker driver` (no queda silencioso — es de los pocos errores que dicen exactamente qué falta).
3. **`mode=max` guarda todas las capas, incluyendo intermedias** (las de las etapas anteriores del multi-stage). Con `mode=min` (el default) sólo guarda las de la imagen final, y reutilizás mucho menos. Para el backend multi-stage es la diferencia entre reutilizar 14 capas o reutilizar 3.

**Qué pasa si el cache desaparece**: nada — el pipeline sigue funcionando, sólo tarda como la primera vez. GitHub puede desalojar el cache en cualquier momento (por LRU o por límite de tamaño). La propiedad que hay que entender es la contrapuesta: **si el pipeline FALLA sin cache, no tenías un cache — tenías una dependencia escondida**, y eso es un bug. En este pipeline probé la propiedad indirectamente: la primera corrida (con cache vacío) construyó las dos imágenes en verde. Si mañana el cache se desaloja, la próxima corrida hace exactamente lo mismo — nada más lento.

**Detalle honesto sobre el cronómetro**: no medí que la 2da corrida fuera más rápida. En esta app el cache no cambia el tiempo de forma perceptible (probablemente sea incluso levemente más lento por el costo de subir/bajar del almacén cifrado). El cache paga cuando construir es caro de verdad (instalar cientos de dependencias, compilar algo grande); para un proyecto de la materia la ganancia es chica. **La evidencia que se pide es la palabra `CACHED`** en el log — no el reloj — y esa está: 14 + 7 capas reutilizadas.

---

## 3. El pipeline como gate: cerrando el círculo con el TP1

En el TP1 se protegió `main` con la regla "nada entra sin pasar por PR". En este TP se agrega la segunda regla: **el PR no se puede mergear si el pipeline no está en verde**. Las dos reglas juntas son lo que la materia llama *"si no pasó por el pipeline, no existe"*.

Configuración concreta (via `gh api PUT`, porque reescribe la protección entera y me obliga a re-declarar lo del TP1):

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build-backend", "build-frontend"]
  },
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "enforce_admins": true,
  "restrictions": null
}
```

- **`contexts`**: los nombres de los dos jobs. Es literal el `id` del job en el YAML — si le pongo un `name:` distinto al job en el YAML, el check pasa a llamarse así y el gate espera un check que ya no existe y bloquea todo. Los dejé sin `name:` para que el nombre visible sea el `id`.
- **`strict: true`**: el efecto de esta línea se demostró abriendo un **segundo PR** (#15) en paralelo al de la demo del gate (#14). Al mergear #14, `main` avanzó. En el PR #15 apareció el botón **"Update branch"**, porque su verde había quedado "viejo" — se sacó contra un `main` que ya no existe, y `strict` exige que la rama esté al día antes de mergear. Es el mecanismo que evita que dos PRs verdes en paralelo, al mergearse los dos, produzcan un `main` roto por interacción entre cambios que nunca se testearon juntos.
- **`enforce_admins: true`**: el gate me alcanza también a mí. Sin esto, siendo dueño del repo podría saltear la regla — que es exactamente lo que la protección viene a prevenir.
- **0 approvals**: mismo motivo que en el TP1 — GitHub no deja aprobar el propio PR (no es configurable), y como trabajo solo, poner 1 dejaría todo imposible de mergear. Lo que bloquea acá **no es una aprobación**: son los checks required.

---

## 4. Demostración del gate: PR #14

La secuencia completa quedó registrada en el historial del PR #14:

1. **Rotura a propósito**: `import { NADA } from './no-existe'` en `frontend/src/App.jsx`, con un uso simulado (`const _forceUse = NADA`) para que Rollup no lo tree-shake y falle de verdad. El backend quedó sin tocar — un solo check en rojo alcanza para bloquear el merge, y separar en dos jobs deja visible **dónde** falla.
2. **Primera corrida**: `build-backend: SUCCESS`, `build-frontend: FAILURE` con el mensaje del log: `Could not resolve "./no-existe" from "src/App.jsx"` (Rollup, durante `vite build`, dentro del step del Dockerfile). `mergeStateStatus: BLOCKED, mergeable: MERGEABLE` — o sea, no hay conflicto de merge, pero el gate no lo deja pasar.
3. **Fix con segundo commit**: sacar las tres líneas del import. Pipeline vuelve a correr solo (evento `pull_request` con `synchronize` — no hace falta reabrir el PR).
4. **Segunda corrida**: los dos en verde, `mergeStateStatus: CLEAN`. Merge con squash, delete branch.

El PR queda en el historial con **sus dos corridas** (la roja y la verde), su fix, y su squash-merge. Esa es la evidencia central del TP4 y lo que se muestra en la mesa.

---

## 5. Problemas encontrados y cómo los resolví

### a) La 2da corrida no tardó menos, aunque el cache reutilizó

La expectativa (mala) era que ver `CACHED` en el log significara "más rápido en el cronómetro". No pasó — la 2da corrida del backend tardó *más* que la primera (75 s vs 90 s si tomás wallclock; con margen del runner que varía entre corridas). El motivo lo explica la guía §3.2: para una app del tamaño de la materia, el costo de subir/bajar el cache cifrado es comparable a lo que se ahorra reutilizando. El cache paga cuando construir es caro (cientos de dependencias, compilaciones largas). Lo evité tomar como bug — leí el log, vi los 14 + 7 `CACHED`, y sé que la evidencia del TP es esa palabra, no el reloj.

### b) `gh api PUT` de la protección: cuidado con lo que ya estaba

Cuando pasé de "sin required checks" a "con required checks", tuve que usar `gh api PUT` en vez de `PATCH`, porque la API de protección de rama solo tiene PUT, y PUT **reescribe la protección entera**. Todo lo que estaba en el TP1 (0 approvals, enforce_admins, allow_force_pushes=false, allow_deletions=false) tuvo que ser re-declarado en el mismo JSON, o se perdía. Lo verifiqué con `gh api ...protection --jq` **antes y después**, y el resultado confirma que la protección quedó con las **dos capas**: la del TP1 (bypass prohibido, PR obligatorio) y la del TP4 (dos jobs required + strict). Es la operación que más fácil pisa configuración por accidente.

### c) `gh pr view --json statusCheckRollup` a veces devuelve `UNKNOWN`

Inmediatamente después de mergear el PR #14, consulté el estado del PR #15 (el filler) y devolvió `mergeStateStatus: UNKNOWN, mergeable: UNKNOWN`. No era que no hubiera cambiado nada: GitHub calcula la mergeabilidad **en background**, y unos segundos después devolvió `BEHIND, MERGEABLE` — exactamente lo que esperaba de `strict: true`. Mismo patrón que ya me había pasado en TP2 con la detección de conflictos. Regla ya interiorizada: **la primera respuesta después de un evento puede ser UNKNOWN; esperar y re-preguntar**, no capturar y suponer.

---

## 6. Declaración de uso de IA

Mismo esquema que en TP1-TP3: asistente de IA con supervisión activa. Este TP tiene el peso más alto del bloque (45%), y las decisiones que se juzgan son cinco: por qué dos jobs, por qué en paralelo, por qué `scope` distinto, por qué `mode=max`, y por qué construir con el Dockerfile en vez de compilar aparte. Las cinco las razoné yo antes de escribir el YAML.

### Lo que decidí y controlé

- **La estructura del pipeline**: dos jobs (`build-backend`, `build-frontend`), en paralelo, cada uno con su `scope` de cache. Consideré la alternativa de un solo job con dos steps y la descarté por un motivo concreto: si el build del backend rompe, el step del frontend no llega a correr — y perdés la información de que el frontend estaba bien. La sección 1 de arriba lo justifica en detalle.
- **La política de cache**: `type=gha` (no `type=registry` ni `type=local`) porque es el default recomendado, no requiere secrets y es gratis para repos públicos. `mode=max` en vez de `min` porque los Dockerfiles son multi-stage y quiero cachear también las capas intermedias del build stage (que son las más caras — `npm ci`, `prisma generate`). `scope=backend` y `scope=frontend` porque sin scope los dos jobs se pisan (leído en la doc de Docker antes de escribirlo — es fácil no notarlo).
- **La configuración del gate**: `required_status_checks` con `strict: true`, contextos exactos `["build-backend", "build-frontend"]`, y sobre todo la re-declaración de todo lo del TP1 (0 approvals, `enforce_admins: true`, no force-push, no delete) dentro del mismo PUT — porque el PUT reescribe la protección entera y omitir es borrar.
- **La demostración del gate**: elegí romper el frontend (`import { NADA } from './no-existe'` en `App.jsx`) porque es un fallo garantizado en Rollup y el mensaje de error es autoexplicativo. Elegí abrir el PR #15 filler en paralelo al #14 explícitamente para demostrar `strict: true` — sin dos PRs abiertos al mismo tiempo, el efecto no se ve.
- **La verificación del cache**: no confié en el timing (que efectivamente no bajó — anoté que la 2da corrida tardó 75s vs 90s de la primera, poca diferencia por el overhead del cache cifrado). Fui al log y conté con `grep -c CACHED`: 14 en backend, 7 en frontend. La evidencia del cache no es el reloj, es la palabra.

### Lo que ejecutó el asistente (bajo mi indicación)

- Los tres PRs del TP4 (#13 workflow, #14 demo del gate, #16 badge) y el filler #15 para la demo de `strict:true`, con sus commits, pushes, y merges por squash.
- Los comandos `gh` para monitorear las corridas y el `gh api PUT` para aplicar la nueva protección (con el JSON que armé combinando lo del TP1 con las líneas nuevas).
- La escritura inicial del `ci.yml` (siguiendo el patrón de la guía §3.1-§3.2 palabra por palabra), del snippet del badge en el README, y de esta sección.

### Lo que vino dado por el enunciado

Que la CI sea GitHub Actions, que el workflow viva en `.github/workflows/ci.yml`, que use `docker/build-push-action@v7` + `docker/setup-buildx-action@v4`, que el cache sea `type=gha`, que el gate sea `required_status_checks` con `strict: true`. Todo en la guía §3.

### La defensa oral no se delega

Todo lo que está en esta sección lo puedo explicar en vivo, incluyendo por qué el mensaje del build roto dice "Could not resolve" (Rollup, no Vite: Rollup es el bundler que Vite usa por debajo, y es el que resuelve los imports estáticos durante el build).

**Verificaciones contra el estado real del repo, no contra el reporte del agente**:

| Qué se afirma | Cómo se comprobó |
|---|---|
| Los dos jobs corren en paralelo en cada PR a `main` | `gh pr view <N> --json statusCheckRollup` devuelve los dos como items separados; sus timestamps de inicio están dentro de segundos entre sí |
| El pipeline construye con los Dockerfiles del TP2 (no compila por su cuenta) | El YAML sólo tiene `docker/build-push-action` — no hay ningún `dotnet build`, `npm run build`, ni step de compilación fuera del Dockerfile |
| El cache reutiliza capas en la 2da corrida | `gh run view <RUN_ID> --log --job=<JOB_ID> \| grep -c CACHED` devuelve `14` para el backend y `7` para el frontend en la run #32994535009 |
| El gate está activo con los dos jobs required y strict:true | `gh api repos/.../branches/main/protection --jq '{contexts: .required_status_checks.contexts, strict: .required_status_checks.strict}'` → `{"contexts":["build-backend","build-frontend"],"strict":true}` |
| El gate frenó un merge real | PR #14: `mergeStateStatus: BLOCKED` durante la corrida en rojo, `CLEAN` después del fix. El botón *Merge* estuvo deshabilitado |
| `strict: true` obligó a actualizar la rama del PR #15 | Inmediatamente después de mergear #14, `gh pr view 15 --json mergeStateStatus` devolvió `BEHIND`. Ejecuté `gh pr update-branch 15`, corrió el pipeline sobre la mezcla, y volvió a `CLEAN` |
| El badge del README muestra el estado real de `main` | Se agregó en PR #16 mergeado; el `badge.svg` es servido por GitHub y refleja el resultado del último workflow sobre `main` |
| El TP1 sigue funcionando (nada se rompió al cambiar la protección) | La misma llamada a `gh api ...protection` devuelve `enforce_admins.enabled: true`, `required_approving_review_count: 0`, `allow_force_pushes: false` — o sea que las tres reglas del TP1 sobrevivieron al PUT del TP4 |

**Cómo lo pienso defender**: la demostración central se hace navegando el PR #14 en vivo — mostrar la 1ra corrida en rojo (los dos jobs listados, uno FAILURE con el log del "Could not resolve"), ver el botón de merge deshabilitado, mostrar el 2do commit del fix, ver la 2da corrida en verde con los dos SUCCESS, y el merge finalmente habilitado. Todo en la pestaña *Conversation* del PR — no hace falta salir de ahí. Y para `strict: true`, mostrar el PR #15 (cerrado, no mergeado) con su historial: `Update branch` disparó la 3ra corrida que quedó en verde antes del close.

