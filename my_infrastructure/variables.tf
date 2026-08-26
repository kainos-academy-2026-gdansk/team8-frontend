variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "rg-team8-frontend"
}

variable "location" {
  description = "Azure region to deploy resources into"
  type        = string
  default     = "UK South"
}

variable "environment" {
  description = "Deployment environment (dev, test, or prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "environment must be one of: dev, test, prod."
  }
}

variable "project_name" {
  description = "Short project name used for tagging and naming resources"
  type        = string
  default     = "team8-frontend"
}

variable "storage_account_name" {
  description = "Globally unique name for the storage account (lowercase letters and numbers only, 3-24 characters)"
  type        = string
  default     = "sateam8frontend"

  validation {
    condition     = can(regex("^[a-z0-9]{3,24}$", var.storage_account_name))
    error_message = "storage_account_name must be 3-24 characters, lowercase letters and numbers only."
  }
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default = {
    project    = "team8-frontend"
    managed_by = "terraform"
  }
}
