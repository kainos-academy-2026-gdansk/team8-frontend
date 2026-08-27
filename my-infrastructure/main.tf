terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # Left empty on purpose: Terraform does not allow variables here, so the
  # real values are supplied at `terraform init` time with -backend-config,
  # pointing at one of the files under environments/ (dev today, prod later).
  # This lets the same code target either environment's remote state without
  # any changes in this file.
  backend "azurerm" {}
}

# No credentials here: the azurerm provider automatically authenticates
# using the ARM_CLIENT_ID / ARM_CLIENT_SECRET / ARM_TENANT_ID /
# ARM_SUBSCRIPTION_ID environment variables when they are set (this is how
# the service principal auth in CI works, see .github/workflows/terraform.yml).
provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {}

module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = var.resource_group_name
  location            = var.location
  environment         = var.environment
}

resource "azurerm_key_vault" "this" {
  name                          = "${var.key_vault_base_name}-${lower(var.environment)}"
  location                      = module.resource_group.location
  resource_group_name           = module.resource_group.name
  tenant_id                     = data.azurerm_client_config.current.tenant_id
  sku_name                      = "standard"
  rbac_authorization_enabled    = true
  soft_delete_retention_days    = 7
  purge_protection_enabled      = false
  public_network_access_enabled = true

  tags = {
    environment = lower(var.environment)
    managed-by  = "terraform"
  }
}

resource "azurerm_user_assigned_identity" "container_apps" {
  name                = "${var.managed_identity_base_name}-${lower(var.environment)}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name

  tags = {
    environment = lower(var.environment)
    managed-by  = "terraform"
  }
}

resource "azurerm_storage_account" "terraform_state" {
  name                     = var.state_storage_account_name
  resource_group_name      = module.resource_group.name
  location                 = module.resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
}

resource "azurerm_storage_container" "terraform_state" {
  name                  = "tfstate"
  storage_account_id    = azurerm_storage_account.terraform_state.id
  container_access_type = "private"
}
