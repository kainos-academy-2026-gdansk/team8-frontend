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

module "resource_group" {
  source   = "./modules/resource-group"
  name     = var.resource_group_name
  location = var.location
  tags     = merge(var.tags, { environment = var.environment })
}

resource "azurerm_storage_account" "this" {
  name                     = var.storage_account_name
  resource_group_name      = module.resource_group.name
  location                 = module.resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = merge(var.tags, { environment = var.environment })
}
