# Azure Infrastructure

The diagram below reflects the infrastructure currently defined in `my_infrastructure/`.

```mermaid
flowchart TB
    developer[Developer merges to main]
    github[GitHub Actions CD\nOIDC login]
    acr[Azure Container Registry\nacraiacademy26.azurecr.io]

    subgraph azure[Azure subscription: sub-ai-academy-26]
        subgraph rg[Resource group: team8-frontend-dev]
            subgraph cae[Container Apps Environment\nteam8-frontend-dev-env]
                frontend[Frontend Container App\nteam8-frontend-dev-frontend\nExternal ingress :3001]
                backend[Backend Container App\nteam8-frontend-dev-backend\nInternal ingress :3000]
            end

            kv[Key Vault\nteam8-frontend-dev-kv\nSessionSecret\nDatabaseUrl\nJWT-SECRET]
            postgres[(PostgreSQL Flexible Server\nteam8-postgres-dev\nPublic network access enabled)]
            database[(Database\nteam8_backend)]
            identity[User-assigned managed identity\nteam8-frontend-dev-identity]
            storage[Storage Account\nsateam8frontenddev]
        end
    end

    developer --> github
    github -->|Build and push\nfrontend:main-<commit SHA>| acr
    github -->|Terraform apply\nthen az containerapp update| frontend
    acr -->|Pull image using AcrPull| frontend
    acr -->|Pull image using AcrPull| backend

    frontend -->|Internal API_BASE_URL| backend
    backend -->|DATABASE_URL secret| postgres
    postgres --> database
    frontend -->|SESSION_SECRET| kv
    backend -->|SESSION_SECRET, JWT_SECRET, DATABASE_URL| kv
    identity -.->|Key Vault Secrets User| kv
    identity -.->|AcrPull| acr

    classDef public fill:#e8f1ff,stroke:#2563eb,color:#111827
    classDef internal fill:#ecfdf5,stroke:#059669,color:#111827
    classDef data fill:#fff7ed,stroke:#ea580c,color:#111827
    classDef pipeline fill:#f5f3ff,stroke:#7c3aed,color:#111827

    class developer,github,acr pipeline
    class frontend,postgres public
    class backend,kv,identity internal
    class database,storage data
```

## Current network behavior

- The frontend has external ingress and is the public entry point.
- The backend has `external_enabled = false`, so its Container App ingress is internal to the Container Apps environment.
- PostgreSQL currently has `public_network_access_enabled = true` and an Azure-services firewall rule. It is **not yet private-only**.
- Container Apps use the user-assigned managed identity to pull images from ACR and read secrets from Key Vault.
- CD pushes a commit-specific frontend image tag and updates the frontend Container App to that tag. The `latest` tag is also pushed for convenience.

## Main deployment flow

1. A merge to `main` triggers GitHub Actions after CI succeeds.
2. CD builds and pushes the frontend image to ACR with `main-<commit SHA>` and `latest` tags.
3. Terraform applies the infrastructure configuration.
4. Azure CLI updates the frontend Container App to the commit-specific image tag.
5. Container Apps creates a new revision for the updated frontend image.
