terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-team8-tfstate"
    storage_account_name = "satfstateteam8"
    container_name       = "tfstate"
    key                  = "team8-frontend.tfstate"
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {}

locals {
  name_prefix          = "${var.project_name}-${var.environment}"
  storage_account_name = "sa${replace(var.project_name, "-", "")}${var.environment}"
  database_server_name = "team8-postgres-${var.environment}"
}

module "resource_group" {
  source   = "./modules/resource-group"
  name     = local.name_prefix
  location = var.location
  tags     = merge(var.tags, { environment = var.environment })
}

resource "azurerm_storage_account" "this" {
  name                     = local.storage_account_name
  resource_group_name      = module.resource_group.name
  location                 = module.resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = merge(var.tags, { environment = var.environment })
}

resource "azurerm_postgresql_flexible_server" "this" {
  name                          = local.database_server_name
  resource_group_name           = module.resource_group.name
  location                      = var.location
  version                       = "16"
  zone                          = "1"
  administrator_login           = var.database_admin_username
  administrator_password        = var.database_admin_password
  storage_mb                    = 32768
  sku_name                      = "B_Standard_B1ms"
  backup_retention_days         = 7
  public_network_access_enabled = true
  tags                          = merge(var.tags, { environment = var.environment })

  lifecycle {
    ignore_changes = [zone]
  }
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.this.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_postgresql_flexible_server_database" "this" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.this.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_user_assigned_identity" "container_apps" {
  name                = "${var.project_name}-${var.environment}-identity"
  resource_group_name = module.resource_group.name
  location            = var.location
}

resource "azurerm_key_vault" "this" {
  name                       = "${var.project_name}-${var.environment}-kv"
  location                   = var.location
  resource_group_name        = module.resource_group.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  purge_protection_enabled   = false
  soft_delete_retention_days = 7
}

resource "azurerm_role_assignment" "container_apps_key_vault_secrets_user" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.container_apps.principal_id
}

resource "azurerm_role_assignment" "container_apps_acr_pull" {
  count                = var.container_registry_id == null ? 0 : 1
  scope                = var.container_registry_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.container_apps.principal_id
}

resource "azurerm_container_app_environment" "this" {
  name                = "${local.name_prefix}-env"
  location            = var.location
  resource_group_name = module.resource_group.name
}

resource "azurerm_container_app" "backend" {
  name                         = "${local.name_prefix}-backend"
  container_app_environment_id = azurerm_container_app_environment.this.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_apps.id]
  }

  registry {
    server   = var.container_registry_login_server
    identity = azurerm_user_assigned_identity.container_apps.id
  }

  ingress {
    external_enabled = false
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  secret {
    name                = "session-secret-ref"
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/SessionSecret"
    identity            = azurerm_user_assigned_identity.container_apps.id
  }

  secret {
    name                = "database-url-ref"
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/DatabaseUrl"
    identity            = azurerm_user_assigned_identity.container_apps.id
  }

  secret {
    name                = "jwt-secret-ref"
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/JWT-SECRET"
    identity            = azurerm_user_assigned_identity.container_apps.id
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "backend"
      image  = "${var.container_registry_login_server}/${var.backend_image}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret-ref"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url-ref"
      }

      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret-ref"
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }
}

resource "azurerm_container_app" "frontend" {
  name                         = "${local.name_prefix}-frontend"
  container_app_environment_id = azurerm_container_app_environment.this.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_apps.id]
  }

  registry {
    server   = var.container_registry_login_server
    identity = azurerm_user_assigned_identity.container_apps.id
  }

  ingress {
    external_enabled = true
    target_port      = 3001
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  secret {
    name                = "session-secret-ref"
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/SessionSecret"
    identity            = azurerm_user_assigned_identity.container_apps.id
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "frontend"
      image  = "${var.container_registry_login_server}/${var.frontend_image}"
      cpu    = 0.25
      memory = "0.5Gi"

      # Ingress rejects plain HTTP with a 301, which would turn API POSTs into GETs.
      env {
        name  = "API_BASE_URL"
        value = "https://${azurerm_container_app.backend.ingress[0].fqdn}/api"
      }

      env {
        name  = "FEATURE_FLAG_ENABLED"
        value = tostring(var.feature_flag_enabled)
      }

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret-ref"
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }
}
