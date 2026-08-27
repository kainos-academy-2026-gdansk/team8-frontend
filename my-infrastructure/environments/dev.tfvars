# Variable values for the "dev" environment.
# Used with: terraform plan/apply -var-file=environments/dev.tfvars
environment                = "dev"
resource_group_name        = "rg-team8-rafal"
location                   = "West Europe"
key_vault_base_name        = "kv-team8-rafal"
managed_identity_base_name = "id-team8-rafal"
state_storage_account_name = "stteam8rafaltf2026"
