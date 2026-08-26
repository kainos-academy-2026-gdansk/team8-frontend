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