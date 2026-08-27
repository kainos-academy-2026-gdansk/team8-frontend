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

variable "database_name" {
  description = "Name of the application database"
  type        = string
  default     = "team8_backend"
}

variable "database_admin_username" {
  description = "Administrator username for PostgreSQL"
  type        = string
  default     = "team8admin"
}

variable "database_admin_password" {
  description = "Administrator password for PostgreSQL; provide through TF_VAR_database_admin_password"
  type        = string
  sensitive   = true
}

variable "container_registry_id" {
  description = "Resource ID of the existing Azure Container Registry"
  type        = string
  default     = null
  nullable    = true
}

variable "container_registry_login_server" {
  description = "Login server of the existing Azure Container Registry"
  type        = string
  default     = null
  nullable    = true
}

variable "frontend_image" {
  description = "Frontend image repository and tag in ACR"
  type        = string
  default     = "team8-frontend:latest"
}

variable "backend_image" {
  description = "Backend image repository and tag in ACR"
  type        = string
  default     = "team8-backend:latest"
}

variable "feature_flag_enabled" {
  description = "Feature flag passed to the frontend Container App"
  type        = bool
  default     = false
}

# Temporary troubleshooting switch only; the backend must stay private by default.
variable "backend_public_ingress" {
  description = "Expose the backend Container App to the internet"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default = {
    project    = "team8-frontend"
    managed_by = "terraform"
  }
}
