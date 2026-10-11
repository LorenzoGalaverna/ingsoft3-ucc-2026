# Variables NO secretas — van con default en un archivo versionado.
# Los secretos (API keys) viajan por variables de entorno de la shell,
# nunca por tfvars.

# Imágenes publicadas por el pipeline del TP7 en ghcr.io. SIN etiqueta
# — la etiqueta va en su campo propio (image_tag). Esto permite cambiar
# el tag sin tocar la base URL.
variable "image_repo_api" {
  description = "Repo de la imagen del backend en ghcr.io (sin tag)"
  type        = string
  default     = "ghcr.io/lorenzogalaverna/ingsoft3-ucc-2026-backend"
}

variable "image_repo_front" {
  description = "Repo de la imagen del frontend en ghcr.io (sin tag)"
  type        = string
  default     = "ghcr.io/lorenzogalaverna/ingsoft3-ucc-2026-frontend"
}

# Etiqueta de la imagen a desplegar en preprod. Default: el sha-<commit> del
# v7.0.0 — el que está corriendo en PROD. Si querés probar otro commit en
# preprod, pisá este default: `terraform apply -var image_tag=sha-<otro>`.
variable "image_tag" {
  description = "Etiqueta sha-<commit> de la imagen (publicada por el pipeline)"
  type        = string
  default     = "sha-c37076dbb834127983b9d627c7df36328f8e04d3"
}

# Región de los servicios de Render. Ohio es la más cercana al Postgres de
# Neon us-east-1 (que es donde está mi proyecto de QA/PROD) → latencia baja.
variable "region" {
  description = "Región de Render (frankfurt | ohio | oregon | singapore | virginia)"
  type        = string
  default     = "ohio"
}

# Organización de Neon — mi usuario pertenece a la org "Test". El provider
# exige este id al crear proyectos (sin él: HTTP 400 "org_id is required").
# No es secret: es el id público que aparece en la URL del dashboard.
variable "neon_org_id" {
  description = "ID de la organización de Neon donde se crea el proyecto"
  type        = string
  default     = "org-dark-glade-67202490"
}
