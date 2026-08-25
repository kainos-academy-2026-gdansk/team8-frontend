variable "resource_group_name" {
  description = "Base name for the resource group."
  type        = string
}

variable "location" {
  description = "Azure region where the resource group will be created."
  type        = string
}

variable "environment" {
  description = "Deployment environment used in the resource group name."
  type        = string

  validation {
    condition     = contains(["dev", "test", "prod"], lower(var.environment))
    error_message = "Environment must be dev, test, or prod."
  }
}