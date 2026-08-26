# Partial backend configuration for the "dev" environment.
# Used with: terraform init -backend-config=environments/dev.backend.hcl
#
# The key intentionally matches the key that was already hardcoded in
# main.tf before this refactor, so this change does not require any state
# migration - it keeps pointing at the same existing state file. A future
# prod environment gets its own new key (see prod.backend.hcl.example),
# which is safe because that state doesn't exist yet.
#
# use_azuread_auth means Terraform authenticates to this storage account
# with the same service principal (ARM_CLIENT_ID/SECRET/TENANT_ID) used for
# everything else, instead of a separate storage account key/secret.
resource_group_name  = "rg-team8-rafal-dev"
storage_account_name = "stteam8rafaltf2026"
container_name       = "tfstate"
key                  = "team8.terraform.tfstate"
use_azuread_auth     = true
