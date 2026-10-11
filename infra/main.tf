# TP8 — Infraestructura como Código del entorno `preprod`.
#
# Este archivo DECLARA un entorno nuevo (base en Neon + 2 servicios en Render),
# que convive con QA y PROD del TP6/TP7 sin tocarlos. El entorno nace con
# `terraform apply` y se destruye con `terraform destroy`; preprod existe
# cuando lo necesito y se va cuando no (§2.6 — las 750 hs del workspace de
# Render son compartidas con QA y PROD; con 6 servicios despiertos todo el mes
# se pasan y Render suspende PROD).
#
# Providers FIJADOS por versión (§encabezado): sin el `version =`, un día
# `terraform init` baja otra cosa y el archivo deja de compilar. Es la primera
# regla de higiene de IaC. El .terraform.lock.hcl que genera `init` se commitea.

terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.18.0" # repo archivado; el oficial va a estar en neondatabase/neon
    }
    render = {
      source  = "render-oss/render"
      version = "1.9.1"
    }
  }
}

provider "neon" {}   # lee NEON_API_KEY del entorno
provider "render" {} # lee RENDER_API_KEY + RENDER_OWNER_ID del entorno

# ───────────────────────────────────────────────────────────────────────────
# Base de datos — un proyecto PROPIO de preprod (no una base más en el de QA/PROD).
# Dos motivos:
#   - La consigna: el proyecto que uso para QA/PROD lo creé a mano, este TP no lo toca.
#   - Práctico: un proyecto aparte se puede DESTRUIR entero sin rozar nada
#     de los otros entornos.
# ───────────────────────────────────────────────────────────────────────────

resource "neon_project" "preprod" {
  name   = "miapp-preprod"
  org_id = var.neon_org_id # mi usuario está en la org "Test" — sin esto, HTTP 400

  # SIN esta línea el primer apply falla: el provider pide 86400s (1 día) por
  # defecto y el plan gratuito tope es 21600 (6 h). El error del provider no
  # te dice qué hacer — lo marca la guía §3.2.
  history_retention_seconds = 21600
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id # OJO: default_branch_id, NO branch_id
  name       = "app_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod"
  owner_name = neon_role.preprod.name
}

# ───────────────────────────────────────────────────────────────────────────
# Cadena de conexión — se DERIVA de lo que Neon devolvió. Nadie la copia y pega:
# ése era el error más caro del TP6 (§5 problemas del TP6 en decisiones.md:
# un entorno apuntando a la base de otro — fallaba en silencio).
#
# Formato: URI (Prisma lee `DATABASE_URL` en formato postgresql://).
# ───────────────────────────────────────────────────────────────────────────

locals {
  conn = "postgresql://${neon_role.preprod.name}:${neon_role.preprod.password}@${neon_project.preprod.database_host}/${neon_database.preprod.name}?sslmode=require"
}

# ───────────────────────────────────────────────────────────────────────────
# Servicios de Render — image-backed (patrón TP7): ejecutan la imagen del
# registry etiquetada por commit. NO reconstruyen del repo.
#
# IMPORTANTE: en el plan gratuito Render NO permite MODIFICAR servicios
# (error `maintenance mode can only be configured for non-free tier`).
# Por eso preprod es desechable: cambios → `destroy` + `apply`, no `apply`.
# Es la ventaja de que preprod no tenga datos valiosos — el ciclo es barato.
# ───────────────────────────────────────────────────────────────────────────

resource "render_web_service" "api" {
  name   = "miapp-api-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_api # SIN la etiqueta pegada —
      tag       = var.image_tag      # la etiqueta va en su propio campo
    }
  }

  env_vars = {
    # Prisma lee DATABASE_URL (TP6 §3.2). La cadena viene del `local.conn`
    # calculado arriba — Terraform ARMA la cadena a partir de los outputs
    # reales del proyecto de Neon recién creado. No la escribo yo.
    DATABASE_URL = { value = local.conn }
  }
}

resource "render_web_service" "front" {
  name   = "miapp-front-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_front
      tag       = var.image_tag
    }
  }

  env_vars = {
    # 🔴 La URL del backend sale de Terraform, no de un copy-paste.
    # render_web_service.api.url es `https://miapp-api-preprod.onrender.com`
    # SIN barra final — exactamente lo que la plantilla nginx del TP6 espera.
    BACKEND_URL  = { value = render_web_service.api.url }
    DNS_RESOLVER = { value = "8.8.8.8" }
  }
}
