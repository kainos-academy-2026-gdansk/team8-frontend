variable "resource_group_name" {
  description = "Base name for the Azure resource group."
  type        = string
  default     = "rg-team8-rafal"

  validation {
    condition     = length(var.resource_group_name) >= 3 && length(var.resource_group_name) <= 80 && can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.resource_group_name))
    error_message = "The resource group base name must be 3-80 characters, use lowercase letters, numbers, and hyphens, and start and end with a letter or number."
  }
}

variable "location" {
  description = "Azure region where the resource group will be created."
  type        = string
  default     = "West Europe"
}

variable "environment" {
  description = "Deployment environment used in the resource group name."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], lower(var.environment))
    error_message = "Environment must be one of: dev, test, or prod."
  }
}

variable "key_vault_base_name" {
  description = "Base name for the environment Key Vault."
  type        = string
  default     = "kv-team8-rafal"

  validation {
    condition     = length(var.key_vault_base_name) >= 3 && length(var.key_vault_base_name) <= 19 && can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.key_vault_base_name))
    error_message = "The Key Vault base name must be 3-19 characters, use lowercase letters, numbers, and hyphens, and start and end with a letter or number."
  }
}

variable "managed_identity_base_name" {
  description = "Base name for the Container Apps managed identity."
  type        = string
  default     = "id-team8-rafal"
}

variable "container_app_environment_base_name" {
  description = "Base name for the Container Apps environment."
  type        = string
  default     = "cae-team8-rafal"
}

variable "log_analytics_workspace_base_name" {
  description = "Base name for the Log Analytics workspace used by Container Apps."
  type        = string
  default     = "law-team8-rafal"
}

variable "state_storage_account_name" {
  description = "Globally unique Azure Storage Account name for Terraform state."
  type        = string
  default     = "stteam8rafaltf2026"

  validation {
    condition     = can(regex("^[a-z0-9]{3,24}$", var.state_storage_account_name))
    error_message = "The storage account name must be 3-24 lowercase letters and numbers with no hyphens."
  }
}
