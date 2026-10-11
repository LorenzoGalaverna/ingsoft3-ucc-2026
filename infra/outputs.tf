# Outputs — valores que Terraform IMPRIME después de aplicar.
# No hay secretos acá: la cadena de conexión (que SÍ es sensible) nunca sale
# por output — viaja directo del `local.conn` al env var del servicio.

output "db_host" {
  description = "Host del proyecto de Neon de preprod"
  value       = neon_project.preprod.database_host
}

output "database" {
  description = "Nombre de la base dentro del proyecto"
  value       = neon_database.preprod.name
}

output "api_url" {
  description = "URL pública de la api de preprod en Render"
  value       = render_web_service.api.url
}

output "front_url" {
  description = "URL pública del front de preprod en Render"
  value       = render_web_service.front.url
}
