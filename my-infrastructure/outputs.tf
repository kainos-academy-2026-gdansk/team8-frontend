output "resource_group_name" {
  description = "Name of the Azure resource group."
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "Resource ID of the Azure resource group."
  value       = module.resource_group.id
}

output "resource_group_location" {
  description = "Azure region containing the resource group."
  value       = module.resource_group.location
}

output "key_vault_name" {
  description = "Name of the environment Key Vault."
  value       = azurerm_key_vault.this.name
}

output "key_vault_uri" {
  description = "URI of the environment Key Vault."
  value       = azurerm_key_vault.this.vault_uri
}

output "managed_identity_id" {
  description = "Resource ID of the Container Apps managed identity."
  value       = azurerm_user_assigned_identity.container_apps.id
}

output "managed_identity_client_id" {
  description = "Client ID of the Container Apps managed identity."
  value       = azurerm_user_assigned_identity.container_apps.client_id
}

output "managed_identity_principal_id" {
  description = "Principal ID used for Azure role assignments."
  value       = azurerm_user_assigned_identity.container_apps.principal_id
}
