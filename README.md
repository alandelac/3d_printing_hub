# 🖨️ 3D Printing Hub

A project to **manage your 3D printing inventories** (filaments, models, stock) and **keep track of your work** through a work registry and a sales registry.

There are no external integrations yet, but connecting to different tools to boost productivity is a near-future enhancement.

---

## ✨ Features

- **Inventory management** for filaments, models and product stock.
- **Work registry** to track the work you are doing.
- **Sales registry** to track sales.
- **SQLite** persistent storage with Entity Framework Core migrations (zero-dependency, no server required).
- **REST API** built with .NET.
- **Modern Angular** frontend.
- **Dockerized** deployment with Nginx static serving and reverse proxy.
- 
---

## 🧱 Technology Stack

### Backend
| Component          | Technology            |
| ------------------ | --------------------- |
| API                | .NET 10               |
| ORM                | Entity Framework Core 10, Microsoft.EntityFrameworkCore.Sqlite 10 |
| Validation         | FluentValidation      |

### Frontend
| Component    | Technology   |
| ------------ | ------------ |
| Client       | Angular 22   |
| HTTP server  | Nginx        |

### Database
| Component    | Technology    |
| ------------ | ------------- |
| Database     | SQLite (embedded file) |

### Extras
- Docker
- Docker Compose
- Nginx
- GitHub Actions CI/CD

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

The backend exposes the following REST endpoints (all under `api/`):

`BrandController`, `FilamentColorsController`, `FilamentProfilesController`, `FilamentsController`, `MarketplacesController`, `MaterialTypeController`, `ModelPrintCategoriesController`, `ModelPrintsController`, `ProductStockController`, `SettingsController`.
---

## ✔️ Previous Requirements

Before you start, make sure you have installed:

| Requirement | Notes |
| ----------- | ----- |
| [Node.js](https://nodejs.org/)     | To run the Angular client (`ng serve`) |
| [.NET SDK](https://dotnet.microsoft.com/) | To build and run the .NET API |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Optional, to deploy the full stack |

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd 3d_printing_hub
```

### 2. Configure the environment

For **local development** no configuration is required — the connection string in
`src/3DPrintingHub.Api/appsettings.Development.json` points at a SQLite file that is created
automatically on first run:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=printinghub.db"
  }
}
```

### 3. Apply database migrations

The database file is created and migrated automatically when the API starts. To create/update
it manually (equivalent behavior):

```bash
dotnet ef database update
```

> **Note:** Migrations live in `src/3DPrintingHub.Infrastructure/Migrations/`. The SQLite
> database file is created at the current working directory (by default `printinghub.db`).

### 4. Start the API

From the root of the repository:

```bash
dotnet run src/3DPrintingHub.Api/3DPrintingHub.Api.csproj
```

The API will be available at [http://localhost:5033](http://localhost:5033) (see `src/3DPrintingHub.Api/Properties/launchSettings.json`).

### 5. Start the frontend client

Navigate into the client folder and start the Angular development server:

```bash
cd src/3DPrintingHub.Client
ng serve
```

Then open [http://localhost:4200](http://localhost:4200) in your browser.

You can also use the included helper script:

```bash
scripts/run-front.ps1     # runs `ng serve` for the client
```

---

## 🔁 Migrating existing data from PostgreSQL to SQLite

If you were already using the app with **PostgreSQL** and want to keep your data when switching
to SQLite, use the one-time migration tool in `src/3DPrintingHub.DataMigration`. It reads every
table from your PostgreSQL database and writes it into a fresh SQLite file, preserving the
original IDs so all relationships stay intact.

> ⚠️ Run this **before** shutting down (or deleting) the old PostgreSQL database.

```bash
dotnet run --project src/3DPrintingHub.DataMigration -- \
  "Host=<host>;Port=5432;Database=printinghub;Username=postgres;Password=<password>;" \
  "./printinghub.db"
```

After it finishes, place the resulting `printinghub.db` file where the app expects it:

- **Local / Docker volume:** if you run the full Docker stack, the API reads from
  `/data/printinghub.db` inside the `printinghub-data` volume (configurable via the
  `ConnectionStrings__DefaultConnection` environment variable).
- **Local (`dotnet run`)**: from the API project folder, the file is `printinghub.db`.

---

## 🐳 Running the full stack with Docker

The SQLite database is embedded, so no database container is needed. Just start every container:

```bash
docker compose up -d
```

This spins up:

| Container                | Purpose          | URL            |
| ------------------------ | ---------------- | -------------- |
| `3dprintinghub-api`      | .NET API         | —              |
| `3dprintinghub-frontend` | Nginx + Angular  | http://localhost:8081 |

The frontend container is published on **port `8081`** via the port mapping `8081:80`. Nginx serves the built Angular app and proxies `/api/*` requests to the backend (`webapi:8080`), see `nginx.conf`. The API stores its SQLite database in the `printinghub-data` Docker volume (`/data/printinghub.db`).

---

## 🛠️ Useful commands

| Action         | Command                                             |
| -------------- | --------------------------------------------------- |
| Build API      | `dotnet publish src/3DPrintingHub.Api/3DPrintingHub.Api.csproj -c Release` |
| Build frontend | `cd src/3DPrintingHub.Client && ng build --configuration=production` |
| Run frontend   | `cd src/3DPrintingHub.Client && ng serve`           |
| Frontend tests | `cd src/3DPrintingHub.Client && ng test`            |

---

## 🔄 CI/CD

The repository includes a **GitHub Actions** workflow (`.github/workflows/build-publish.yml`) that, on every push to `main`:

1. Logs into the GitHub Container Registry (`ghcr.io`).
2. Builds and pushes the **API** Docker image (`3d_printing_hub_api:latest`).
3. Builds and pushes the **Frontend** Docker image (`3d_printing_hub_frontend:latest`).

It only **publishes** the images to the registry — it does not deploy or run them on any server.

> ⚠️ Required repository secret: `GITHUB_TOKEN`.

---

## 🗺️ Roadmap

- [ ] Integrations with external tools to boost productivity.
- [ ] Additional reporting on work & sales registries.
- [ ] Inventory automation.

---

## 📝 License

Not specified yet.