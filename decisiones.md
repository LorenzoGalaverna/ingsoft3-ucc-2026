# Decisiones — Historial acumulado del semestre

Este archivo se acumula TP a TP: cada trabajo agrega su sección al final. El más viejo (TP1) queda al principio; el más nuevo (TP2 en adelante), abajo, para que el crecimiento sea evidente en el historial de Git.

---

## Enlaces del TP6

Todo lo que necesita quien corrige para navegar el TP6 en vivo, en un solo lugar (los paquetes y las URLs viven afuera del repo; las dos corridas son dos entre muchas — si no están acá, no se buscan).

### Entornos desplegados

- **QA**   → https://miapp-front-qa.onrender.com (y su api: https://miapp-api-qa.onrender.com)
- **PROD** → https://miapp-front-prod.onrender.com (y su api: https://miapp-api-prod.onrender.com)

⚠️ Primer request tras idle puede tardar ~1 min por el cold start del free tier de Render.

### Paquetes públicos (docker pull sin credenciales)

- `ghcr.io/lorenzogalaverna/ingsoft3-ucc-2026-backend:sha-4e2d61f474836cd0c397e9a8672e8456964b197b`
- `ghcr.io/lorenzogalaverna/ingsoft3-ucc-2026-frontend:sha-4e2d61f474836cd0c397e9a8672e8456964b197b`

Comprobable desde cualquier máquina: `docker logout ghcr.io && docker pull --platform linux/amd64 <la URL de arriba>`.

### La cadena de 3 eslabones (Tarea 1 §Entregables)

- **PR con "Entrar al registry" salteado** → [job build-backend del PR #25](https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36249474527/job/108424686218) — muestra el segundo eslabón: pasó todo y aun así no publicó, porque no era `main`.
- **Corrida de `main` con "Construir y publicar" como ÚLTIMO step** → [run 36249591947](https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36249591947) — muestra el tercer eslabón: publicar es lo último; si algo falla antes, no llega a correr.

### Evidencia del gate humano (Tarea 4 §Entregables)

- **Rechazo con motivo específico** → [run 36277553328](https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36277553328) — deploy-prod = failure. Motivo registrado: *"Este PR sólo cambia copy del front — rechazo esta corrida para dejar la evidencia obligatoria del §3.4 y aprobar el próximo PR con dos cambios juntos"*.
- **Aprobación exitosa** → [run 36277945053](https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36277945053) — deploy-prod = success, PROD live con los cambios visibles acumulados de los PRs #28 y #29.

### Release

- [v6.0.0 — TP6](https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/releases/tag/v6.0.0) — apunta al commit `4e2d61f`, el que efectivamente está corriendo en PROD.

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

---
---

# TP5 — Testing en el pipeline

**Peso: 45 % de P2** — el gemelo pesado del TP4, corrido a la capa de calidad. El TP4 puso un gate por *compilación*; el TP5 pone un gate adicional por *cobertura de tests*. Los dos jobs del TP4 ahora tienen que **construir, testear con cobertura y pasar el umbral** antes de habilitar el merge. La evidencia central son dos PRs abiertos a propósito: PR #22 (rojo → verde, cerrado) y PR #23 (rojo persistente, abierto hasta la defensa).

---

## 1. Elección del runner: **vitest** en front y back

Elegí **vitest** como test runner unificado, en vez de tener Jest en el backend y vitest en el frontend. Motivo concreto: el frontend ya venía con vitest (viene incluido en Vite y comparte config con `vite.config.js`), así que agregar Jest al backend habría significado **dos runners, dos configs de coverage, dos formatos de reporte** — y por lo tanto dos comandos en el pipeline. Con vitest unificado el pipeline corre `npm run test:ci` en las dos partes con la misma semántica y devuelve `coverage-summary.json` con el mismo shape.

Otras alternativas evaluadas:

- **Jest en las dos** — funcionaría, pero requiere babel/swc para ESM en el frontend (Vite compila con esbuild nativo) y hay que mantener dos ecosistemas de plugins.
- **node:test + node --test** (built-in de Node 22) — sin dependencias, pero sin coverage integrado a la altura de v8, sin `it.each` parametrizado, sin `vi.mock` para las funciones que llaman a Prisma. Habría que escribir helpers para las tres cosas.

**Cómo lo pienso defender**: la elección del runner no es religiosa — es de **costo de mantenimiento**. Un runner y un formato de reporte es un tercio del pipeline; dos runners son dos tercios. La regla que sigo es "menos moving parts que aún hagan lo que necesito".

---

## 2. Umbral de cobertura: **70 % líneas + 70 % branches**

El umbral está declarado en `backend/vitest.config.js` y `frontend/vite.config.js`:

```js
thresholds: { lines: 70, branches: 70, functions: 70, statements: 70 }
```

**Por qué 70 % y no 80 % o 90 %**: el enunciado del TP5 §2.4 pide "umbral realista para el proyecto"; el debate típico de cobertura (§3.4 de la guía) es que un umbral demasiado alto empuja a escribir tests decorativos — tests que ejercitan código sin verificarlo — sólo para llegar al número. En una app del tamaño de la materia, con ~10 archivos de dominio y sin código legacy heredado, el 70 % es el punto donde:

- **cualquier rama nueva sin tests baja el número** — así el gate se dispara con cambios chicos (la demo del PR #22 lo probó cayendo a 60 %),
- pero **queda margen para `src/index.js`** que se excluye a propósito (ver 3), sin obligarme a tests HTTP para todo endpoint,
- y **no incentiva tests de "cobertura decorativa"** — un `expect(fn(x)).toBeDefined()` que no verifica nada pero suma línea.

**Branches al 70 %, no al 50 %**: la crítica clásica al `--coverage lines` a secas es que un test que pasa por un `if` sin ejercitar la rama `else` cuenta como 100 % de líneas. Poner branches al **mismo** umbral que líneas es lo que fuerza que cada `if` tenga al menos dos casos. La sección 4 muestra el ejemplo concreto donde bajar sólo branches habría enmascarado un bug.

---

## 3. Qué queda fuera del reporte de cobertura y por qué

`backend/vitest.config.js` excluye estos paths:

```js
exclude: ['src/index.js', 'prisma/**', 'node_modules/**', '**/*.test.js']
```

- **`src/index.js`** — es el bootstrap del servidor Express: `app.listen()`, wiring de middlewares, el `if (import.meta.url === ...)` que evita levantar el server al importar desde tests. Tiene una sola rama y su verificación real es "el compose levanta" — está cubierto por el healthcheck del TP2, no por unit tests. Testearlo con supertest sería probar Express, no probar mi código.
- **`prisma/**`** — es código generado (`migrations/`, `seed.js` es idempotente y su verificación es "el compose arranca la 2da vez con `No pending migrations to apply`" — TP2 §2.5).
- **`**/*.test.js`** — los tests no cuentan como código a cubrir (evita el chiste de "el test se testea a sí mismo, 100 %").

En el frontend excluyo la misma lista + `src/App.jsx` + `src/main.jsx` (componentes de wiring; sus tests reales son visuales y quedan para cuando entre Playwright — fuera de scope del TP5).

**El principio**: la cobertura mide líneas de **lógica de negocio**, no de infraestructura. Cuando el TP6 agregue observability, agregaré `src/observability/` a la exclusión también — no porque no valga la pena testearlo, sino porque su prueba es el dashboard funcionando, no una assertion.

---

## 4. Cobertura alta vs. tests que atrapan bugs: ejemplo propio

El caso paradigmático del debate se puede ver en mi propio `backend/src/domain/prioridad.js`. La función tiene cinco umbrales (`< 1`, `< 3`, `< 7`, `< 30`, else). Un test único con `diasDesdeUltima = 0.5` cubre **la primera rama** y todas las líneas *hasta el primer return*. Métrica de líneas: 60 %. Métrica de branches: 20 %. **Ninguno de los otros cuatro umbrales se ejercita** — si alguien cambia `< 3` por `<= 3`, el test único no se entera.

`prioridad.test.js` (backend/src/domain/prioridad.test.js:11-28) resuelve esto con `it.each` de cinco casos, **uno por rama** — no cinco por gusto, cinco *por camino del código*. Comentario en el archivo:

> "un caso por CAMINO del código nuevo — no un caso por punto arbitrario. Si mañana alguien cambia un umbral (`< 3` por `<= 3`), uno de estos tests se pone en rojo."

Es la diferencia práctica entre 60 % de cobertura sin sentido y 100 % de branches con significado. **La regla que sigo**: cada rama del código nace con al menos un test que la ejercita. Si no, la rama no debería existir.

**Contraprueba**: `backend/src/domain/leveling.test.js` usa `it.each` con dos casos para verificar la fórmula `floor(xp/100) + 1` (xp=0 → nivel 1; xp=99 → nivel 1; xp=100 → nivel 2). Los dos casos ejercitan el borde inferior de nivel N y el salto a N+1 — no son arbitrarios. Si mañana cambio a `floor((xp+50)/100)`, los tests atrapan el bug antes del merge.

---

## 5. Demostración del gate: dos PRs, uno cerrado y uno vigente

### PR #22 — rojo → verde (patrón TP4 aplicado a cobertura)

Secuencia registrada en el PR (https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/pull/22):

1. **Commit rojo** (`d53a0ab`): agrego `backend/src/domain/prioridad.js` con dos funciones y cinco ramas, **sin ningún test**.
2. **Primera corrida** (https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36208160657): `build-backend: FAILURE`, `build-frontend: SUCCESS`. El log del `docker buildx build --target test` termina con:
   ```
   Statements   : 51.21% ( 21/41 )
   Branches     : 53.19% ( 25/47 )
   Functions    : 71.42% ( 5/7 )
   Lines        : 51.21% ( 21/41 )
   ERROR: Coverage for lines (51.21%) does not meet global threshold (70%)
   ERROR: Coverage for branches (53.19%) does not meet global threshold (70%)
   ERROR: Coverage for statements (51.21%) does not meet global threshold (70%)
   ```
   `mergeStateStatus: BLOCKED`. El compose builda, el código no tiene errores de sintaxis, todo *anda* — pero el gate del TP5 lo bloquea igual, porque la calidad bajó.
3. **Commit verde** (`31fafb5`): agrego `prioridad.test.js` con 5 casos parametrizados + 3 tests de casos borde. Los ocho tests pasan y la cobertura vuelve al 87 % líneas.
4. **Segunda corrida** (https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36208282194): los dos jobs en verde, `mergeStateStatus: CLEAN`.
5. Merge con squash (commit `bec0480` en `main`, run https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36208326547 confirma que `main` sigue verde después del merge).

Es el mismo patrón del TP4, con **una diferencia crítica**: en el TP4 la rotura era una falla de compilación (`Could not resolve "./no-existe"`), un error obvio que hasta el linter atrapa. En el TP5 la rotura es **código perfectamente compilable, ejecutable, sin errores de sintaxis** — el gate lo bloquea *sólo* porque no lo testeó. Eso es exactamente lo que un gate por calidad tiene que hacer: distinguir "compila" de "tiene tests que respaldan lo que compila".

### PR #23 — rojo persistente hasta la defensa

El enunciado §3.5 del TP5 lo pide con precisión:

> "abrí un SEGUNDO Pull Request, chiquito, con el mismo problema — y dejalo ahí, abierto y en rojo, hasta la defensa. No lo arregles."

PR #23 (https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/pull/23) agrega `backend/src/domain/racha.js` con 42 líneas y 5+ ramas, sin tests. El run https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36208536054 muestra `build-backend: FAILURE` (job específico: https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36208536054/job/108310126171) con la cobertura cayendo a **60 % líneas / 57.35 % statements** — bien por debajo del umbral. El PR queda abierto sin merge. La descripción explicita "NO MERGEAR — evidencia del gate vigente".

La diferencia entre los dos PRs no es didáctica sino **estructural**:

- **PR #22 (cerrado)** demuestra que el gate se activa y se destraba — es la película.
- **PR #23 (abierto)** demuestra que el gate **sigue vigente** después de que otro PR pasó por él — es la foto que congela el momento. Sin él, la defensa muestra un merge exitoso y ya está; con él, la defensa muestra que *ahora mismo* hay un PR que el gate rechaza y no deja mergear.

---

## 6. Stack de testing: qué elegí y para qué

| Herramienta | Para qué | Por qué esa |
|---|---|---|
| **vitest** | Runner de tests | Unificado con Vite del frontend; `it.each`, `vi.mock`, `vi.hoisted` nativos; watch mode instantáneo con esbuild |
| **@vitest/coverage-v8** | Cobertura | v8 nativo (sin instrumentación de bytecode como istanbul) — más rápido, no altera el código bajo test |
| **supertest** | Tests HTTP del backend | Levanta `app` en memoria (sin `listen()`), permite `.expect(200)` fluido. Un solo test end-to-end del handler `POST /habits/:id/complete` con Prisma mockeado |
| **vi.hoisted + vi.mock** | Mock de Prisma en `handlers.test.js` | `vi.hoisted` es la única forma limpia de compartir el mock entre la fábrica de `vi.mock` (que se ejecuta antes de los `import`s) y el test. Alternativa (top-level `let mockPrisma`) rompe porque `vi.mock` se hoistea |
| **vi.fn() (frontend)** | Stub de `fetch` en `api.test.js` | Reemplaza `global.fetch` por una función spy. Verifica el body enviado, no la respuesta real — el contrato con el servidor se prueba en integración |
| **Docker multi-stage `test` stage** | Correr tests dentro del build | Los tests corren en la **misma imagen** que después se despliega — evita el "en mi máquina anda". El stage `coverage-export` (FROM scratch) permite `--target coverage-export --output type=local` para extraer el reporte al workspace del runner sin cargar la imagen entera |

**Detalle del multi-stage que aprendí a los golpes**: buildkit **skipea stages que ninguna otra stage referencia**. La primera vez el stage `test` se salteaba entero — todo pasaba en verde porque nunca corría. Fix: en el stage `final` agregué `COPY --from=test /app/coverage /_coverage-report` — ese COPY dispara la construcción del stage `test`, y si vitest sale con exit != 0, todo el build muere. Es el mismo patrón que hace que `apk add openssl` del TP2 no se pueda "olvidar": el `RUN` está referenciado por el `CMD`, así que si falla, no hay imagen final.

---

## 7. Problemas encontrados y cómo los resolví

### a) El mock de Prisma dio `TypeError: () => mockPrisma is not a constructor`

Primer intento: `vi.mock('@prisma/client', () => ({ PrismaClient: vi.fn(() => mockPrisma) }))`. Cuando el backend hace `new PrismaClient()`, JS falla con `is not a constructor` porque `vi.fn()` devuelve una función que no puede llamarse con `new`.

**Fix**: reemplazar `vi.fn()` por una **declaración de función real**:
```js
vi.mock('@prisma/client', () => ({
  PrismaClient: function PrismaClient() { return mockPrisma; }
}));
```
Una función declarada con `function` sí soporta ser invocada con `new` (devuelve el objeto retornado, si es objeto). Lo aprendí después de leer el issue de vitest sobre `MockedClass` — la sutileza es que las arrow functions **no tienen `[[Construct]]`**, sólo `[[Call]]`.

### b) `coverage-summary.json` no se generaba

El paso del pipeline que publica el resumen en `$GITHUB_STEP_SUMMARY` usaba `jq` sobre `coverage/coverage-summary.json`, y la primera corrida falló con "no such file". El reporter default de v8 emite `lcov` y `html`, no `json-summary`.

**Fix**: agregar `'json-summary'` explícitamente al array `reporter:` en las dos configs de vitest. La lección: cada reporter que uses en CI tiene que estar en la lista — no hay default útil para pipelines.

### c) La rama de la demo `demo/gate-vigente` tuvo que quedar afuera de la protección

`strict: true` del TP4 exige que las ramas de PR estén actualizadas contra `main`. Como este PR **no se va a mergear**, va a quedar `BEHIND` naturalmente. Está bien — el gate lo bloquea por cobertura *antes* de fijarse en el estado del branch. Es la primera vez que un PR mío bloqueado por **dos** capas del gate (calidad + strict) coexisten y son visibles.

---

## 8. Declaración de uso de IA

Mismo esquema que en TP1-TP4: asistente de IA (Claude Opus 4.7 en Claude Code) con supervisión activa. En este TP la asimetría entre lo humano y lo automatizado es especialmente relevante, porque los tests son literalmente la parte del código que **decide qué es correcto**: delegar su escritura a la IA sin revisión sería delegar la definición misma de "funciona".

### Lo que decidí y controlé

- **La elección del runner** (vitest) y del umbral (70 % líneas Y branches). Comparé alternativas concretas — Jest en las dos, node:test built-in, umbral 80/90 — y descarté cada una con una razón que puedo defender (secciones 1 y 2).
- **Qué código se excluye del reporte de cobertura**. `src/index.js`, `prisma/**`, `App.jsx`, `main.jsx` — cada exclusión tiene una razón que baja al *tipo* de código que es (bootstrap vs. lógica; generado vs. escrito; wiring vs. dominio).
- **La estrategia de tests**: pure functions extraídas a `src/domain/` (backend) y `src/lib/` (frontend), un test parametrizado por rama, un test de mock por handler con efectos. La decisión de refactorear a `src/domain/` fue mía — la alternativa (tests de integración directos sobre el handler HTTP) tiene mayor superficie y no separa el problema de la lógica del problema del efecto secundario. Es la razón por la que 8 de 10 tests del backend son sobre funciones puras.
- **La demostración del gate**: elegí `prioridadDeHabito` para PR #22 y `calcularRacha` para PR #23 explícitamente porque **son código real de la app** — la próxima iteración va a usarlos. No son *strings dummy* del estilo `function foo(x) { return x + 1 }` inventados sólo para bajar la cobertura. Cuando entren al UI (TP siguiente), voy a tener que escribir los tests de `racha.js` para mergear PR #23 — es un plan real, no un truco.
- **La verificación de cada resultado**: cada `npm run test:ci` local, cada corrida del pipeline, cada valor de cobertura visible en el step summary de la corrida. La cobertura que veo en el pipeline es la que corrí primero en mi máquina — el pipeline no tiene sorpresas.

### Lo que ejecutó el asistente (bajo mi indicación)

- La escritura inicial de los tests (backend/src/domain/*.test.js, backend/src/handlers.test.js, frontend/src/lib/*.test.js) sobre la base de las funciones que ya existían. Revisé cada test antes del commit — en particular verifiqué que cada `it.each` tiene un caso *por rama*, no casos redundantes.
- La refactorización de `src/index.js` para exportar `app` sin llamar a `app.listen()` (el guard `if (import.meta.url === ...)` lo hace saltar al final sólo cuando se corre como entrypoint, no cuando se importa desde un test).
- Los comandos `docker buildx build --target test`, la extensión del `ci.yml` con el paso de coverage summary, la creación de los PRs #22 y #23.
- La redacción inicial de esta sección; la revisé porque los razonamientos de umbral, exclusiones y estrategia son literalmente lo que voy a decir en la mesa.

### Lo que vino dado por el enunciado

Que el test se corra en el mismo pipeline del TP4; que haya cobertura mínima como gate; que el reporte quede visible en el workflow; que haya una demo del rojo. El TP5 §2 y §3 lo enumera. La elección de runner, umbral y estructura sí son mías.

### La defensa oral no se delega

Todo lo que está en esta sección lo puedo explicar. En particular:

- Por qué `it.each` con **cinco casos** para `prioridadDeHabito` y no con uno que barra el rango. Respuesta: cada caso ejercita un camino distinto; un test que atraviesa el rango con un for loop cubre lo mismo pero cuando falla no te dice **qué umbral** rompió.
- Por qué `vi.hoisted` en el mock de Prisma. Respuesta: `vi.mock` se hoistea al top del archivo (antes de los imports), así que no puede usar una variable declarada abajo. `vi.hoisted` devuelve un objeto que sí es accesible desde la fábrica del mock.
- Por qué el stage `test` está entre `build` y `final` en el Dockerfile, y no fuera del multi-stage. Respuesta: quiero que los tests corran en la **misma imagen** que se despliega. Correr `npm test` fuera del Dockerfile es una segunda máquina, una segunda instalación de deps, una segunda oportunidad para que "acá anda y allá no".

**Verificaciones contra el estado real del repo**:

| Qué se afirma | Cómo se comprobó |
|---|---|
| El gate del TP5 bloquea merges por cobertura, no sólo por compilación | PR #22 corrida `36208160657` — `build-frontend: SUCCESS` (el proyecto compila) y `build-backend: FAILURE` (por umbral). Log del docker build muestra el `ERROR: Coverage for lines...` explícito |
| El gate se destraba con tests, no con hacks | Segunda corrida del PR #22 (`36208282194`) — mismo Dockerfile, mismo umbral, el único cambio entre commits es `prioridad.test.js` |
| El gate sigue vigente después de un merge exitoso | PR #23 abierto ahora, corrida `36208536054` en rojo, `mergeStateStatus: BLOCKED`. Es lo que pide §3.5 y es visible clickeando en el PR desde el listado |
| La cobertura del backend con todo el dominio testeado está sobre umbral | `npm run test:ci` local antes de PR #23 devolvió lines 87 %, branches 82 %. Después del `racha.js` sin tests: lines 60 %, branches 70.31 % (cae abajo del umbral en tres métricas) |
| Los tests corren dentro del Dockerfile, no en un step aparte | El `ci.yml` sólo tiene `docker/build-push-action` — no hay `npm test` en el YAML. La evidencia del test corriendo es el step `Build and test backend` que hace `--target test` |
| El reporte de cobertura queda visible en el workflow | El step "Publish coverage summary" arma un table de markdown en `$GITHUB_STEP_SUMMARY` con las cuatro métricas — visible en la pestaña Summary del run, no hay que bajarse el artifact |
| El artifact de coverage se sube y se puede descargar | Los steps `actions/upload-artifact@v4` con nombres `coverage-backend` y `coverage-frontend` — visible en la sección "Artifacts" del run |

**Cómo lo pienso defender**: la demostración central se hace navegando el PR #23 en vivo — mostrar que está abierto ahora, ver el check `build-backend: FAILURE` en la parte de abajo, click en "Details" y llegar al log del docker build donde vitest imprime el `ERROR: Coverage for lines (60 %) does not meet global threshold (70 %)`. Después ir al PR #22 y mostrar la secuencia rojo → verde del historial de commits: el primer commit rompió, el segundo destrabó, la diferencia es un solo archivo (`prioridad.test.js`). Y para la conversación sobre cobertura vs. calidad, abrir `prioridad.test.js` en vivo y mostrar el `it.each` de cinco casos con el comentario "un caso por CAMINO del código nuevo".

---
---

# TP6 — CD: environments, aprobaciones y deployment patterns

**Peso: 25 % de P2** — el pipeline pasa de sólo **verificar** (TP4+TP5) a **entregar**: cada cambio integrado llega automáticamente a QA, y a PROD sólo con aprobación humana explícita. Los entregables se navegan en vivo — Actions, Deployments, Releases, `docker pull` desde afuera. La lista corta de enlaces está arriba de todo en este archivo, en la sección "Enlaces del TP6".

---

## 1. El artefacto: por qué el registry es confiable

Hasta el TP5 el pipeline dejaba un tilde verde y un reporte de cobertura. Desde el TP6 deja **una imagen etiquetada por commit** en `ghcr.io`, y esa imagen es la unidad que después se despliega.

La cadena que garantiza que en el registry sólo haya imágenes verificadas **no es un control nuevo** — sale de encadenar tres cosas que ya tenía:

1. **Nada entra a `main` sin verde**: el gate de branch protection del TP4 (dos required checks: `build-backend` y `build-frontend`) sumado al umbral de cobertura del TP5 (70 % lines + branches).
2. **Sólo `main` publica**: `push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}` en el paso de `docker/build-push-action@v7`. En un PR el step corre igual (verifica que se puede construir) pero no sube nada.
3. **Publicar es el ÚLTIMO paso del mismo job que corrió los tests**: si el step "Correr tests con coverage" muere, el job muere ahí y "Entrar al registry" + "Construir y publicar" **nunca llegan a correr**. No hay ningún `if: success()` explícito porque no hace falta — la semántica default de los pasos ya lo garantiza (si algo falla antes, no se llega).

**Qué dejaría de significar el registry si publicara sin el eslabón 3**: el registry sería un depósito de "cosas que alguien construyó alguna vez", no de "cosas que pasaron la verificación completa". Es un cambio de sentido, no de forma — nadie te avisa que rompió, la cadena se disuelve en silencio. Por eso las dos evidencias del §Entregables Tarea 1 apuntan a esto:

- Un PR con "Entrar al registry" **salteado** (por `if: github.event_name == 'push'`): prueba que un cambio que **no fue integrado** no publica ([run 36249474527/job/108424686218](https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36249474527/job/108424686218)).
- Una corrida de `main` con "Construir y publicar la imagen" como el **último** paso, después de los tests ([run 36249591947](https://github.com/LorenzoGalaverna/ingsoft3-ucc-2026/actions/runs/36249591947)). En el log del job se ve el orden: 1-checkout · 2-buildx · 3-tests (target `test`) · 4-extraer coverage · 5-publicar resumen · 6-publicar artifact · 7-login ghcr · 8-**construir y publicar**.

**Honestidad honesta que va en la defensa**: la cadena garantiza lo que el **pipeline** publica, no lo que físicamente puede entrar. Yo, desde mi notebook, puedo hacer `docker push ghcr.io/…-backend:hackeado` a mano y nadie me lo impide (mientras tenga el `write:packages` token, que tengo). La disciplina de que en el registry sólo haya imágenes verificadas descansa en dos cosas: la cadena del pipeline + la disciplina del equipo de no pushear a mano. Una es técnica, la otra es cultural.

---

## 2. Continuous Integration vs Delivery vs Deployment: qué implementé

Los tres términos que la industria mezcla:

- **Continuous Integration** (TP4/TP5): cada cambio se integra y se **verifica** automáticamente. Termina en un artefacto verificado, que no va a ningún lado solo.
- **Continuous Delivery** (este TP): cada cambio verificado queda **listo para desplegarse con un click** — el pipeline llega hasta prod, pero el último paso lo autoriza un humano. El despliegue es una **decisión de negocio**.
- **Continuous Deployment**: se saca al humano — todo cambio que pasa las verificaciones llega solo a prod.

**Implementé Continuous Delivery** — QA automático + PROD detrás de aprobación. La razón concreta es de **madurez de red de seguridad**:

- Tengo tests unitarios con umbral de cobertura (TP5) → red de seguridad *decente* para verificar que el código no está totalmente roto.
- Pero **no tengo**: tests de integración end-to-end contra QA/PROD (más allá del smoke test de 3 llamadas), tests de contrato entre front y back, monitoreo real con alertas (eso es TP9), rollback probado bajo carga.

Con esa red, automatizar el approve a PROD sería **automatizar la propagación de errores**: cualquier bug que se cuele en los unit tests aparece directo en producción, sin ninguna pausa humana para atraparlo. Continuous Deployment requiere una madurez que no tengo hoy — y reconocer eso es parte del argumento profesional.

**Deploy ≠ release** es la otra distinción que se pide defender: *desplegar* es poner binarios nuevos a correr; *release* es exponer la funcionalidad a los usuarios. Con **feature flags** se puede desplegar código apagado y prenderlo después — desacoplando el riesgo técnico del riesgo de producto. Mi TP6 no implementa flags — un cambio se despliega y ya está expuesto —, pero para la app real, un flag sobre la funcionalidad de "rachas" (§8 de este documento) tendría sentido: podría llegar a prod con la lógica pero apagada, y prender para el 10 % primero.

---

## 3. Diseño de la cadena: needs, if, environments, secrets

El `ci.yml` tiene 4 jobs, en este orden:

```
build-backend  (sin needs)                           ← verifica + publica imagen
build-frontend (sin needs)                           ← verifica + publica imagen
deploy-qa      needs: [build-backend, build-frontend] ← automático, environment: qa
               if: github.ref == 'refs/heads/main'
deploy-prod    needs: deploy-qa                       ← pausado, environment: production
               concurrency: deploy-prod
```

**Por qué esta forma**:

- **`needs:` implementa la cadena con compuertas** — no hay `deploy-qa` sin CI verde, no hay `deploy-prod` sin QA verde.
- **`if: github.ref == 'refs/heads/main'` sólo en `deploy-qa`**: no lo repito en `deploy-prod` (y no es olvido). Como `deploy-prod` depende de `deploy-qa`, y `deploy-qa` sólo corre en main, en un PR ninguno de los dos arranca. La condición se hereda por la cadena.
- **`environment: qa` / `environment: production`**: cada job hereda los secrets de SU environment (los deploy hooks) y suma al historial de *Deployments* del repo (link en el sidebar de la home). QA no tiene protection rules — es automático a propósito. PROD tiene required reviewer.
- **`concurrency: { group: deploy-prod, cancel-in-progress: false }`**: evita que dos deploys a prod se pisen si llegan dos merges seguidos. La documentación de GitHub y la discusión #17401 dicen que **NO cubre el caso** de aprobar una corrida vieja después de una nueva (una corrida esperando aprobación no está "en cola", está en otro estado). La cátedra no lo midió — la mitigación real es rechazar la vieja a mano, con motivo, y aprobar la nueva.

**Alcance de secrets — los tres niveles del TP4 aplicados de verdad**:

| Secret | Alcance | Por qué |
|---|---|---|
| `GITHUB_TOKEN` | Auto (por job) | Vive lo que dura el job. Le da permiso a `docker/login-action@v4` para publicar en ghcr.io. No lo guardo yo — GitHub lo entrega |
| `RENDER_HOOK_API_QA` + `RENDER_HOOK_FRONT_QA` | Environment `qa` | Sólo un job con `environment: qa` los ve. En un PR el job de QA sale salteado por el `if` — así que en un PR estos secrets **no se cargan aunque el YAML los referencie** |
| `RENDER_HOOK_API_PROD` + `RENDER_HOOK_FRONT_PROD` | Environment `production` | Sólo un job con `environment: production` los ve **y sólo después de que un reviewer apruebe**. Sin approve, el job no arranca, y los secrets no se materializan. Es la diferencia clave con QA: acá el gate humano gobierna incluso la carga del secret |

**Qué pasaría si los secrets estuvieran en el repo** (repository secrets): cualquier job del workflow los vería, incluidos los jobs que corren sobre PRs de contributors nuevos si el flujo lo permitiera. Alguien con acceso al repo podría escribir un PR malicioso que hiciera `echo ${{ secrets.RENDER_HOOK_API_PROD }} > /tmp/…` en un step aparente inofensivo. El alcance por environment corta eso porque el job que despliega a prod está guardado por la aprobación.

**`&ref=$GITHUB_SHA` en el hook — el detalle del §3.3 que gobierna todo lo demás**: sin ese parámetro, el hook de Render deploya **la punta de la rama** en el momento de la ejecución, no el commit que el pipeline verificó. Con dos merges seguidos, la corrida del primero desplegaría el segundo — y "se promueve lo mismo que se verificó" deja de ser cierto justo donde el práctico lo enseña. En PROD el problema se agrava: entre "waiting for review" y el approve puede pasar tiempo real (horas o más), y `main` puede haberse movido varias veces — sin el ref, aprobás la corrida del commit A y a prod sube lo último, y el aprobador estaría firmando algo que no se despliega. El `&` en vez de `?` es porque el hook de Render ya trae un parámetro (la key).

---

## 4. Qué mira mi aprobador antes de aprobar (los criterios del gate)

Una aprobación **sin criterios** es teatro. Los míos, en orden:

1. **El commit del run coincide con el commit que quiero desplegar**. Chequeo el link del run y el SHA en el header. Si veo un SHA que no reconozco (porque entró otro merge en el medio y estoy aprobando una corrida vieja), **rechazo** — no es el momento de dar OK.
2. **El job `deploy-qa` salió en verde en esta misma corrida**. Si el smoke a QA cayó, PROD no debería recibir el mismo commit sin investigar por qué.
3. **Los cambios del PR no tocan cosas que necesiten una ventana** — migración de esquema, cambio de variable de entorno crítica, algo que pueda romper sesiones activas. Si tocan, coordino: aviso, hago downtime programado.
4. **Nada de esto es "viernes 7 pm no desplegamos"** — ese ejemplo es del video de la cátedra y la guía advierte que ya está tomado. Los motivos genéricos son teatro; los específicos son el gate haciendo su trabajo.

**Cuándo el gate NO agrega valor**: cuando lo tengo que apretar 20 veces al día. Ahí el humano se transforma en botón mecánico y el gate deja de discriminar — la señal se pierde en el ruido. La respuesta profesional es subir la red de seguridad automatizada (tests de integración, canary con auto-rollback por métrica, feature flags) para poder ir a Continuous Deployment de verdad.

**Lo que mi aprobador (yo) NO puede ver**: si el `/health` está mintiendo (respondiendo 200 con la BD colgada), si el bundle del front tiene un tamaño anómalo que va a romper la 3G, si algo en Neon está sobre cuota y va a colapsar en 20 minutos. Todo eso es observabilidad — es exactamente el gap que TP9 (monitoreo) cierra.

---

## 5. El free tier de Render + cómo lo maneja mi pipeline

Contrato del tier gratuito de Render (a jul-2026):

| Restricción | Número | Qué implica |
|---|---|---|
| Horas de instancia por **workspace** (todos los servicios juntos) | 750/mes | 4 servicios despiertos 24/7 se comen 2880 hs — inviable. En mi caso, los servicios duermen tras 15 min sin tráfico, así que 750 hs sobran para las corridas de deploy + demostración |
| Minutos de build por workspace | 500/mes | Cada deploy reconstruye 2 servicios × ~3-5 min = 6-10 min. 500 min ≈ 50 deploys. Suficiente para el TP; a controlar cerca de la defensa si hago muchos ciclos |
| Sleep tras idle | 15 min | Primer request post-idle acepta la conexión pero puede tardar hasta ~1 min en contestar |
| Almacenamiento y compute de Neon (BD) | 0.5 GB · 190h/mes | Sobra ampliamente para 2 databases con tablas casi vacías |

**Cómo lo maneja el pipeline**:

- **Smoke test con 30 reintentos × 20 s = 10 min máx**: absorbe el peor caso "servicio dormido + build completo en curso". Un `curl` seco daría falsos rojos.
- **`--max-time 10` en cada `curl` del smoke**: un servicio despertando puede aceptar la conexión y no contestar. Sin tope, el `curl` cuelga y el job muere por el timeout del runner (6 h), no por el timeout del entorno. El error se ve mal.
- **Sin keep-alive**: intencional. No hago ping cada 5 min para que los servicios no duerman, porque eso consumiría las 750 hs del workspace y en el peor caso me suspenderían **todos** los servicios hasta fin de mes.

**Limitación honesta que va a la defensa**: el smoke test puede dar verde contra la versión vieja mientras Render aún está buildeando. El hook responde al instante y el build corre en background — mientras tanto Render sigue sirviendo la versión anterior. La mitigación clásica (que `/health` devuelva el commit desplegado y el smoke compare) es **obligatoria en TP7**, opcional en el TP6. La otra opción es preguntarle a la API de Render por el estado del deploy con `dep-…` id — más complejo y requiere un API key.

---

## 6. Qué garantía perdemos porque Render **reconstruye** desde el repo

El §3.2 de la guía marca esto en 🚨🚨 y hay que decirlo en la defensa:

> El pipeline ya publica **la imagen que verificó** (§3.0), pero Render **vuelve a construir** tus dos contenedores desde el repositorio. Lo que corre en QA y PROD **NO es la imagen que los tests aprobaron**: es **otra construcción** del mismo commit.

¿Puede salir distinto? Sí, en tres formas concretas:

1. **Dependencias no lockeadas**: si el `npm ci` levanta una versión distinta de una transitiva porque el registro subió un patch minor. Yo tengo `package-lock.json` commiteado, así que el riesgo es bajo — pero no cero (una capa base de Node 22-alpine puede cambiar entre builds si el tag `alpine` avanzó).
2. **Imagen base**: si `node:22-alpine` o `nginx:alpine` cambió entre el build del pipeline y el build de Render. Los tags flotantes son un riesgo real.
3. **Contexto no reproducible**: si un `RUN` depende del reloj, de una API externa, de un `curl` a algo que puede fallar en el segundo build.

**En mi app hoy**: los tres riesgos son bajos (Node 22-alpine se mueve poco, `npm ci` con lock respeta lo grabado, mis Dockerfiles no llaman a nada externo). Pero la **garantía** de "se despliega exactamente lo que se probó" **no la puedo dar** — lo que puedo dar es "se despliega el mismo commit". Es una diferencia de definición.

**Lo que cierra esto es el TP7**: ahí Render deja de construir y **ejecuta la imagen del registry** — la misma que verificaron los tests. Este TP tiene el pipeline listo para eso: la imagen ya está publicada con `sha-<commit>` en ghcr, sólo falta apuntar el runtime a ella en vez de al repo.

---

## 7. Qué prueba mi smoke test y qué **no**

Prueba 3 cosas, en 3 llamadas encadenadas con `&&`:

1. `GET /health` → el proceso Node está vivo y respondiendo.
2. `GET /api/habits` → **la BD responde**. Un `/health` que sólo verifica el proceso puede dar verde con la connection string rota; el `/api/habits` obliga a que Prisma abra conexión con Neon y devuelva la lista. Si Neon está caído o la DB no existe, sale 500.
3. `GET /` del front → **nginx sirviendo el `dist/`**. Si la plantilla del `nginx.conf` explotó (por ej. envs no seteadas → `envsubst` deja `${…}` literal → nginx no arranca), el front no contesta 200.

**Qué NO prueba** (esta es la parte que la defensa pregunta):

- **NO prueba qué commit está corriendo**. Contesta verde con la versión vieja mientras Render aún buildea. Solución en TP7: `/health` que devuelva el `git.sha` incrustado como env var al build; el smoke lo compara con `github.sha`.
- **NO prueba las rutas de escritura**. Sólo GETs. Un `POST /api/habits` con un token vencido podría fallar y no me entero.
- **NO prueba flujos multi-request** (crear un hábito → completarlo → verificar XP). Sólo verifica que las 3 rutas puntuales devuelvan 2xx.
- **NO prueba performance ni carga**. Si `/api/habits` tarda 8 segundos en devolver, el smoke pasa igual. Un p95 alto en prod pasa por acá sin señal.

El smoke es un **latido de vida**, no una suite de aceptación. Para aceptación real hay que agregar tests de integración e2e — quedan para cuando la app crezca.

---

## 8. Deployment pattern para producción real + rollback

**Para esta app en una producción real con usuarios elegiría rolling con feature flags para features riesgosas.** Justificación por dimensión:

| Pattern | Fit para mi app | Por qué |
|---|---|---|
| **Recreate** | ❌ | Downtime — inaceptable para una app con usuarios activos escribiendo hábitos |
| **Rolling** | ✅ | Sin downtime, sin duplicar infra. Reemplaza instancias de a tandas — perfecto para una app stateless (mi backend lo es: toda la persistencia va a Neon) |
| **Blue-green** | ➖ | Excelente rollback (segundos), pero cuesta 2× infra. Overkill para el estado actual — vale la pena para apps con SLA de disponibilidad estricto |
| **Canary** | ➖ | Requiere métricas y observabilidad reales para decidir cuándo cortar el canario. Sin monitoreo (TP9 pendiente), es ruleta |
| **Feature flags** | ✅ (complementario) | Perfecto para desacoplar deploy de release en features como "rachas" o "bosses" — desplegar código apagado y prenderlo por usuario o % |

**Combo**: rolling para la infraestructura de despliegue + flags para las features nuevas. Es el patrón más común en la industria para SaaS de tamaño mediano.

**Qué me falta hoy para hacer canary en serio**: (1) métricas de negocio (tasa de completions por sesión, error rate por endpoint), (2) sistema de flags externo (LaunchDarkly, Unleash, o incluso una tabla en la BD que se lea en cada request), (3) alertas que digan "el canario sangra" — sin eso el canary es una ruleta con más pasos.

### Plan de rollback actual — cronometrado en vivo

Si un deploy aprobado a PROD sale mal, mi plan es **disparar los mismos hooks con el SHA del último deploy bueno anterior**. Como el deploy se dispara con `&ref=$GITHUB_SHA` desde el pipeline, es la simetría exacta — sólo cambia el SHA.

**Comandos exactos**:

```bash
export SHA_ANTERIOR=$(git rev-list -n1 v6.0.0)      # el tag apunta al último bueno
read -rs HOOK_API_PROD && export HOOK_API_PROD      # copia del secret de Render (no queda en historial)
read -rs HOOK_FRONT_PROD && export HOOK_FRONT_PROD
INICIO=$(date +%s)
curl -fsS "$HOOK_API_PROD&ref=$SHA_ANTERIOR"
curl -fsS "$HOOK_FRONT_PROD&ref=$SHA_ANTERIOR"
# … esperar a que Render → Deploys muestre ese commit como Live en los 2 servicios
echo "rollback: $(( $(date +%s) - INICIO )) s"
```

**Cronometrado el 2026-09-26**:

- **Contexto**: PROD estaba en `706aeeb` (PR #30, cambio del bar caption a "para el nivel"). Rollback a `v6.0.0` = `4e2d61f`.
- **Hooks disparados**: 20:07:49.
- **PROD live con `4e2d61f`**: 20:08:30 — polling contra `https://miapp-front-prod.onrender.com/` detectó que la referencia al bundle cambió de `assets/index-BdXrYBdZ.js` (build del commit `706aeeb`) a `assets/index-BhdAvlUf.js` (build del commit `4e2d61f`), y el texto "hasta nivel" (viejo, del v6.0.0) volvió a estar presente en el bundle nuevo.
- **Tiempo total del rollback: `41` segundos.**

**Nota honesta sobre el número** — 41 s es sospechosamente rápido para un rollback en Render. La explicación probable: Render **cacheó el build de `4e2d61f`** porque ese commit ya se había buildeado ~30 min antes (para el deploy del PR #29). Un rollback "en frío" a un commit que Render no tuvo nunca puede tardar 3-5 minutos (build completo + cold start). 41 s es el mejor caso — el peor real esperado es ~5 min. Para la defensa: el número mide **rollback con cache tibio en la infraestructura del proveedor**, no el peor caso en frío.

**Qué se pudo medir con este método (bundle JS del front cambia)**: el rollback del **front** — que es donde vive el cambio visible.

**Qué el rollback NO deshace** — la respuesta clave que la defensa busca:

- **Los datos escritos con la versión mala** siguen ahí. Si el commit mergeado corrompió los `xp` de todos los users, revertir el código no restaura los valores previos — hay que hacer un data fix aparte (script + verificación) o restaurar la BD desde backup.
- **Las migraciones de esquema aplicadas**. Si el commit malo agregó una columna nueva y el rollback vuelve al código que no la conoce, la columna sigue existiendo (inofensiva mientras el código no la use). Si el commit malo **borró** una columna, esa columna ya no está — y el rollback no la trae de vuelta. Es un caso concreto de por qué las migraciones destructivas son peligrosas y hay que planearlas con "rollback plan de datos" aparte del rollback de código.
- **Cambios en configuración externa** (env vars de Render seteadas manualmente, hooks nuevos, servicios agregados): el rollback de código no los revierte. En este TP no cambio esas cosas por deploy, pero en producción real es un riesgo real.

**Métrica DORA que estoy ejercitando**: **MTTR (Mean Time To Restore)** — la 4ta métrica de DORA. Medir mi tiempo de rollback en frío es la única forma de convertirla de estimación a número.

---

## 9. Si Render desaparece mañana: qué sobrevive y qué migra

**Sobrevive sin cambios**:

- La imagen publicada en ghcr.io (`ghcr.io/lorenzogalaverna/…-{backend,frontend}:sha-<commit>`) — es un artefacto identificable con SHA, portable a cualquier runtime que corra contenedores.
- El pipeline entero hasta el paso de "publicar la imagen" — build, test, coverage gate, publish, tag: es genérico.
- Los environments `qa` y `production` de GitHub con sus reglas de protección — no dependen de Render.
- La cadena `needs: [build-*] → deploy-qa → deploy-prod` — es del YAML, no del destino.
- Los archivos `default.conf.template` del nginx con `${BACKEND_URL}` — funcionan igual con cualquier proveedor.

**Hay que migrar** (cambio de dirección, no de concepto):

- Los 4 servicios de Render → 4 servicios equivalentes en otro proveedor (Fly.io, Railway, Azure Web Apps F1, o self-hosted runner + docker-compose del §3.6).
- Los deploy hooks de Render → el mecanismo del nuevo proveedor (Fly usa `flyctl deploy --image`, Railway `railway up`, Azure `az webapp deploy`, K8s `kubectl set image`).
- La connection string de Neon → otra base Postgres (RDS, Cloud SQL, Supabase, o cualquiera).

**Lo que hace posible la migración barata** es exactamente lo que este TP me obligó a hacer: (a) sacar la config afuera de la imagen (`DATABASE_URL`, `BACKEND_URL`), (b) usar una imagen inmutable con SHA, (c) tener el deploy disparado por el pipeline (no por el proveedor). Nada de eso está atado a Render.

---

## 10. Problemas encontrados y cómo los resolví

### a) `error writing layer blob: not_found` al publicar la imagen del frontend

La primera vez que la corrida del `feature/deploy-qa` corrió, `build-frontend` falló con:

```
#19 ERROR: error writing layer blob: not_found
ERROR: failed to build: failed to solve: error writing layer blob: not_found
```

**Causa**: los dos steps del job de frontend (`Correr tests con coverage` y `Construir y publicar la imagen`) escribían al mismo `cache-to: type=gha,scope=frontend`, y colisionaron. El primero llenaba el cache; el segundo intentaba reescribirlo con capas del stage final, y buildkit tiró error de concurrencia.

**Fix**: quité el `cache-to` del step de publicar y dejé sólo `cache-from`. El step de tests es el que llena el cache; el de publicar sólo lo lee. Sin contención, y de yapa ahorro un upload de cache por corrida. Aplicado también al backend por consistencia (aunque en backend no había fallado — cuestión de suerte).

### b) `Construir y publicar` corre pero `push: false` en el PR — no publica

El paso `docker/build-push-action@v7` con `push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}` **corre** en el PR (para verificar que la imagen se construye) pero **no publica**. Al principio pensé que iba a salir salteado como "Entrar al registry", pero la action tiene su propia semántica: el `if:` del step decide si corre; el `push:` decide si empuja.

**No es un bug, es cómo funciona la action** — y es la parte que dice la guía §3.0: "En los Pull Requests no se publica nada, y está bien. Con `push:` atado al evento, la corrida del PR construye y verifica igual, pero no sube nada". El evidence link #1 de la Tarea 1 es el step "Entrar al registry" salteado — ése sí se saltea de verdad.

### c) Cancelé el workflow por error en vez de rechazar el deploy

Mid-flujo, al llegar al primer gate de PROD, apreté "Cancel workflow" (botón arriba del run) en vez de "Review deployments". El run quedó como `cancelled`. **No se perdió nada** — hice un "Re-run all jobs" que arrancó una nueva corrida con el mismo SHA, y esta vez completé el flujo correctamente (rechazo → PR nuevo → aprobación).

**Lección práctica que va al defensa**: la UI de GitHub tiene tres botones cerca cuando hay un deploy pausado ("Cancel workflow" arriba a la derecha, "Re-run all jobs" arriba a la izquierda, "Review deployments" arriba del job pausado). El correcto para el gate es **Review deployments** — el del medio. Los otros dos parecen razonables pero son otra cosa.

### d) La primera vez aprobé cuando quería rechazar (no leí el motivo del texto)

Además de (c), en otro run apreté "Approve and deploy" sin poner motivo cuando el plan era rechazar. Se me pasó que el modal tenía dos botones y elegí el verde por reflejo.

**Fix operativo**: para la próxima corrida (PR #28, que sí rechacé correctamente) me detuve, leí el modal completo, redacté un motivo específico antes de tocar, y confirmé el botón rojo. La UI no cambia por explicarla — la que cambia es la disciplina de leer antes de clickear.

### e) El bar-caption del front no cambia el hash del bundle si Vite lo optimiza distinto

Cuando arranqué el polling para cronometrar el rollback, la primera versión del script comparaba el HTML del front — no sirvió porque el SPA de React sirve el mismo `index.html` con distintas referencias al bundle. La solución fue comparar el nombre del bundle `assets/index-<hash>.js` — cada build de Vite genera un hash único (a menos que el contenido sea idéntico byte-por-byte, cosa que no pasa entre commits distintos).

---

## 11. Declaración de uso de IA

Mismo esquema que en TP1-TP5: asistente de IA (Claude Opus 4.7 en Claude Code) con supervisión activa. Este TP tiene la característica de que la mitad del trabajo la ejecuté yo en la UI de GitHub y de Render (aprobaciones, rechazos, configuración de env vars, creación de servicios) — la IA no puede tocar esas cosas, así que la línea entre "yo" y "asistente" fue especialmente nítida.

### Lo que decidí y controlé

- **La elección de proveedor**: Render + Neon, sobre las alternativas de Fly.io (pide tarjeta), Railway (trial), Koyeb (dejó de ser garantizado) y self-hosted (fallback del §3.6). Elegí Render+Neon porque es el canónico de la guía y no requiere tarjeta.
- **Cada acción con blast radius sobre la infra**: crear los 4 servicios en Render, setear `DATABASE_URL` con la connection string de Neon correcta en cada uno, marcar Auto-Deploy = OFF, cambiar `BACKEND_URL` en los dos fronts a la URL correcta del entorno (crítico — pisar una por otra deja PROD hablando con la BD de QA sin ningún error visible).
- **Cada aprobación y rechazo del gate humano**: yo entré a la UI de GitHub, leí el modal, redacté el motivo del rechazo, y confirmé el botón. El asistente no puede aprobar deployments — el gate literalmente no lo alcanza.
- **La decisión de rotar o no los deploy hooks después de haberlos pegado en el chat**: opté por asumir el riesgo (bajo — el chat no se comparte, y el peor daño sería que alguien me dispare deploys y me consuma minutos de build). Registrado como decisión consciente, no como omisión.
- **El motivo específico del rechazo**: lo redacté yo, sin usar el ejemplo del video de la cátedra ("viernes 7pm no desplegamos"). Está registrado en el run 36277553328 y es defendible en la mesa.
- **Los 4 PRs de UI + el commit del rollback**: cada cambio de texto lo elegí yo — no son cambios inventados por el asistente sobre placeholder, son textos que quiero en la app.

### Lo que ejecutó el asistente (bajo mi indicación)

- La escritura del `ci.yml` con los 4 jobs, y en particular el diseño del gate (needs, if, environment, concurrency, `&ref=$GITHUB_SHA`) — cada línea la puedo explicar (§3 de este documento).
- El refactor de `nginx.conf` → `default.conf.template` + los cambios del `Dockerfile` del front para procesar templates. Verifiqué localmente con `sed` que los defaults del compose no se rompen.
- Los comandos `gh api` para crear el environment `production` con reviewer + prevent_self_review=false, y los `gh secret set --env` para setear los 4 hooks.
- El script del rollback cronometrado con polling contra el bundle del front.
- La redacción inicial de esta sección; revisé cada afirmación contra el estado real del pipeline y de Render.

### Lo que vino dado por el enunciado

Que sea GitHub Actions + environments; que haya QA automático y PROD con aprobación; que el smoke reintente; que la release se etiquete `v6.0.0`; que haya evidencia de un rechazo con motivo específico; que el rollback tenga tiempo medido. Todo en el §Entregables del TP6.

### La defensa oral no se delega

Todo lo que está en esta sección lo puedo explicar. En particular las tres respuestas clave del §Defensa:

- **"¿Cómo probás que lo que está publicado es exactamente lo que pasó la verificación?"** → No es un control, son 3 encadenados: main protegida por 2 checks required + strict; sólo main publica (if en el evento y la rama); publicar es el último step del job que testea (si algo falla antes, no llega). La cadena se lee en la configuración, no se demuestra con un ejemplo — y no es infalible porque yo, con acceso al repo, puedo publicar a mano.
- **"¿Por qué QA se despliega solo y PROD no?"** → Porque a QA se le rompe todo el tiempo y está bien (es un entorno para probar). A PROD no se puede llegar sin un humano que mire: (a) el timing de negocio, (b) qué cambia este deploy, (c) que quede registrado quién autorizó.
- **"PROD está roto tras un deploy aprobado: ¿qué hacés?"** → Curl a los 2 hooks de prod con `&ref=$(git rev-list -n1 v6.0.0)`. Cronometrado hoy: **41 segundos** (con Render cacheando el build de ese commit — en frío esperaría 3-5 min). Y lo que **no** deshace el rollback: los datos que la versión mala escribió, y las migraciones destructivas.

