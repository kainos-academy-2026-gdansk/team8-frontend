output "resource_group_name" {
  description = "Name of the Azure resource group."
  value       = azurerm_resource_group.team8.name
}

output "resource_group_id" {
  description = "Resource ID of the Azure resource group."
  value       = azurerm_resource_group.team8.id
}

output "resource_group_location" {
  description = "Azure region containing the resource group."
  value       = azurerm_resource_group.team8.location
}
