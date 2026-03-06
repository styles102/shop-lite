# Shop Lite

A demo e-commerce application built with **.NET Aspire**, **ASP.NET Core Minimal APIs**, **Entity Framework Core**, and **Next.js 15**.

## Stack

| Layer | Technology |
|---|---|
| Orchestration | .NET Aspire 13.1.2 |
| Backend | ASP.NET Core Minimal APIs (net10.0) |
| Database | PostgreSQL via EF Core (Npgsql) |
| Cache | Redis (output caching) |
| Frontend | Next.js 15 (App Router, SSR) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Validation | Zod v4 |

## Solution Structure

```
shop-lite.sln
├── shop-lite.AppHost/          # Aspire orchestration host
├── shop-lite.ServiceDefaults/  # Shared Aspire service defaults
├── shop-lite.Server/           # ASP.NET Core API backend
│   ├── Data/                   # EF Core DbContext + seed data
│   ├── Endpoints/              # Minimal API endpoint extensions
│   └── Models/                 # Domain entities
└── frontend/                   # Next.js app
    ├── app/
    │   ├── (pages)/            # Main route group (products, basket, order)
    │   └── (public)/           # Public home page
    ├── actions/                # Next.js Server Actions
    ├── components/ui/          # shadcn/ui components
    └── lib/
        ├── api/                # Typed API client functions
        └── schemas/            # Zod schemas mirroring API contracts
```

## Features

- **Product listing** — `/products` — server-rendered grid of products with stock badges and sale prices
- **Basket** — `/basket` — server-rendered, persisted via `httpOnly` cookie; add/remove items
- **Checkout** — `/order` — client-side form with Zod validation
- **Order confirmation** — `/order/[id]` — shows items, totals, addresses, and status badges

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Postgres and Redis containers)

### Run

```bash
dotnet run --project shop-lite.AppHost
```

Aspire starts everything: Postgres, Redis, the API server, and the Next.js dev server. The **Aspire dashboard** URL is printed to the console on startup.

Seed data (8 products) is inserted automatically on first run.

### pgAdmin

Available at [http://localhost:5050](http://localhost:5050). Credentials are printed in the Aspire dashboard under the `postgres` resource.

## API Endpoints

All routes are prefixed with `/api`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/{sku}` | Get a single product |
| `POST` | `/api/baskets` | Create a new basket |
| `GET` | `/api/baskets/{id}` | Get basket with items |
| `PUT` | `/api/baskets/{id}/items/{productSku}` | Add/update/remove item (quantity ≤ 0 removes) |
| `DELETE` | `/api/baskets/{id}` | Delete a basket |
| `POST` | `/api/orders` | Create order from basket |
| `GET` | `/api/orders/{id}` | Get order with items |
| `PATCH` | `/api/orders/{id}` | Update delivery address (blocked once despatched) |

## Architecture Notes

### Service Discovery

Aspire injects `services__server__https__0` / `services__server__http__0` into the Next.js process. The API client functions use these to call the backend directly from the server. Client-side calls fall back to an empty base URL, relying on the Next.js rewrite in `next.config.ts` to proxy `/api/*` to the backend.

### Basket Persistence

The basket ID is stored in an `httpOnly` cookie (`basketId`), making it readable by Next.js Server Components and Server Actions without client-side JavaScript.

### Order Items

`OrderItem` stores a price and name **snapshot** at time of purchase — no foreign key to `Products`. This ensures order history is preserved if products are later changed or removed.

### Data Persistence

Postgres data is stored in a named Docker volume (`shop-lite-postgres-data`) so it survives container restarts. To reset the database:

```bash
docker volume rm shop-lite-postgres-data
```