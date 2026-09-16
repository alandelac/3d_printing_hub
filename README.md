# 🖨️ 3D Printing Hub

A project to **manage your 3D printing inventories** (filaments, models, stock) and **keep track of your work** through a work registry and a sales registry.

There are no external integrations yet, but connecting to different tools to boost productivity is a near-future enhancement.

---

## ✨ Features

- **Inventory management** for filaments, models and product stock.
- **Client** to track wich clinet is buying and dont lose track.
- **Sales registry** to track sales.
- **SQLite** persistent storage with Entity Framework Core migrations (zero-dependency, no server required).
- **REST API** built with .NET.
- **Modern Angular** frontend.
- **Dockerized** deployment with Nginx static serving and reverse proxy.
- 
---

## 🗂️ Project Structure

The codebase follows a clean / layered architecture, split across four .NET projects plus a standalone Angular client:

```
/src
├── 3DPrintingHub.Domain            # Core domain entities
├── 3DPrintingHub.Application       # Business logic, services, DTOs & validators
├── 3DPrintingHub.Infrastructure    # Persistence, migrations & repositories
├── 3DPrintingHub.Api               # Controllers, HTTP layer, app settings
└── 3DPrintingHub.Client            # Angular frontend
```

---

## 🧑‍💻 Development scripts

Everything in `scripts/` is PowerShell and resolves the repository root from its own location, so each one works from any working directory.

| Script | What it does | Port |
|---|---|---|
| `scripts/run-all.ps1` | Starts the API and the client, each in its own window (`-Wait` keeps the console attached). | API `5033`, client `4200` |
| `scripts/run-program.ps1` | Starts the .NET API only. | API `5033` |
| `scripts/run-front.ps1` | Starts the Angular client only (`ng serve`). | client `4200` |
| `scripts/update-db.ps1` | Applies the EF Core migrations to the local SQLite database (`src/3DPrintingHub.Api/printinghub.db`). | — |

Local configuration starts from the tracked template: `Copy-Item .env.example .env`. The published containers use different ports — frontend `8081` on the host and the API on `8080` inside the compose network — see `docker-compose.yml`.

---

## 🔄 CI/CD

The repository includes a **GitHub Actions** workflow (`.github/workflows/build-publish.yml`) that, on every push to `main`:

1. Logs into the GitHub Container Registry (`ghcr.io`).
2. Builds and pushes the **API** Docker image (`3d_printing_hub_api:latest`).
3. Builds and pushes the **Frontend** Docker image (`3d_printing_hub_frontend:latest`).

It only **publishes** the images to the registry — it does not deploy or run them on any server.

> ⚠️ Required repository secret: `GITHUB_TOKEN`.

---

## 📝 License

Creative Commons