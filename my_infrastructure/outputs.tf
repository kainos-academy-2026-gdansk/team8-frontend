output "resource_group_name" {
  description = "Name of the created Azure resource group"
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "ID of the created Azure resource group"
  value       = module.resource_group.id
}

output "location" {
  description = "Azure region the resource group was created in"
  value       = module.resource_group.location
}

output "storage_account_name" {
  description = "Name of the created storage account"
  value       = azurerm_storage_account.this.name
}

output "database_server_fqdn" {
  description = "Fully qualified domain name of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.this.fqdn
}

output "database_name" {
  description = "Name of the application database"
  value       = azurerm_postgresql_flexible_server_database.this.name
}

output "container_apps_identity_id" {
  description = "Resource ID of the managed identity used by Container Apps"
  value       = azurerm_user_assigned_identity.container_apps.id
}

output "container_apps_identity_principal_id" {
  description = "Principal ID of the managed identity used by Container Apps"
  value       = azurerm_user_assigned_identity.container_apps.principal_id
}

output "frontend_container_app_url" {
  description = "Public URL of the frontend Container App"
  value       = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}

output "backend_container_app_fqdn" {
  description = "Internal FQDN of the backend Container App"
  value       = azurerm_container_app.backend.ingress[0].fqdn
}