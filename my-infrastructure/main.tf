terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

    backend "azurerm" {
    storage_account_name = "stteam8rafaltf2026"
    container_name       = "tfstate"
    key                  = "team8.terraform.tfstate"
    }

}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "team8" {
  name     = "${var.resource_group_name}-${lower(var.environment)}"
  location = var.location
}

resource "azurerm_storage_account" "terraform_state" {
  name                     = var.state_storage_account_name
  resource_group_name      = azurerm_resource_group.team8.name
  location                 = azurerm_resource_group.team8.location
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
