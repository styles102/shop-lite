# Shop Lite

A demo e-commerce application built with **.NET Aspire**, **ASP.NET Core Minimal APIs**, **Entity Framework Core**, and **Next.js 15**.

## Stack

| Layer | Technology |
|---|---|
| Orchestration | .NET Aspire 13.1.2 |
| Backend | ASP.NET Core Minimal APIs (net10.0) |
| Database | PostgreSQL via EF Core (Npgsql) |
| Cache | Redis (output caching) |
| Messaging | RabbitMQ |
| Email (dev) | Mailpit |
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
│   ├── Messages/               # RabbitMQ message contracts
│   └── Models/                 # Domain entities
├── shop-lite.Worker/           # Background worker (RabbitMQ consumers)
│   ├── OrderEmailConsumer      # Sends order confirmation emails via Mailpit
│   └── StockAdjustmentConsumer # Adjusts product stock on payment/refund
└── frontend/                   # Next.js app
    ├── app/
    │   ├── (admin)/            # Admin section (login, dashboard)
    │   └── (public)/           # Public store (products, basket, order)
    ├── actions/                # Next.js Server Actions
    ├── components/ui/          # shadcn/ui components
    └── lib/
        ├── api/                # Typed API client functions
        └── schemas/            # Zod schemas mirroring API contracts
```

## Features

### Store
- **Product listing** — `/products` — server-rendered grid with stock badges and sale prices
- **Basket** — `/basket` — persisted via `httpOnly` cookie; add/remove items
- **Checkout** — `/order` — client-side form with Zod validation
- **Order confirmation** — `/order/[id]` — shows items, totals, addresses, and status badges

### Admin
- **Login** — `/admin/login` — JWT-based auth (token stored in `httpOnly` cookie)
- **Dashboard** — `/admin/dashboard` — table of the 20 most recent orders
- **Order status management** — mark orders as Paid or Refunded directly from the dashboard
- All `/admin/*` routes redirect to login if unauthenticated (Next.js middleware)

### Messaging
- **Order confirmation email** — on order creation the Server publishes to RabbitMQ; the Worker sends a confirmation email to the customer via Mailpit (local dev)
- **Stock adjustment** — on Paid/Refunded status change the Server publishes a stock message; the Worker increments or decrements product stock in Postgres

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Postgres, Redis, RabbitMQ, and Mailpit containers)

### Run

```bash
dotnet run --project shop-lite.AppHost
```

Aspire starts everything: Postgres, Redis, the API server, and the Next.js dev server. The **Aspire dashboard** URL is printed to the console on startup.

Seed data (8 products and a default admin user) is inserted automatically on first run.

### Default admin credentials

| Email | Password |
|---|---|
| `admin@shop-lite.dev` | `Admin123!` |

### pgAdmin

Available at [http://localhost:5050](http://localhost:5050). Credentials are printed in the Aspire dashboard under the `postgres` resource.

### RabbitMQ management UI

Available via the link on the `messaging` resource in the Aspire dashboard. Credentials are also shown there.

### Mailpit

The email UI is available via the link on the `mailpit` resource in the Aspire dashboard. All outbound emails in development are captured here.

## API Endpoints

All routes are prefixed with `/api`.

### Public

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

### Admin (JWT required — `Authorization: Bearer <token>`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/auth/login` | Login with email/password, returns JWT |
| `GET` | `/api/admin/orders` | List the 20 most recent orders |
| `PATCH` | `/api/admin/orders/{id}/status` | Update order status (`Unpaid→Paid` or `Paid→Refunded`) |

## Architecture Notes

### Service Discovery

Aspire injects `services__server__https__0` / `services__server__http__0` into the Next.js process. The API client functions use these to call the backend directly from the server. Client-side calls fall back to an empty base URL, relying on the Next.js rewrite in `next.config.ts` to proxy `/api/*` to the backend.

### Basket Persistence

The basket ID is stored in an `httpOnly` cookie (`basketId`), making it readable by Next.js Server Components and Server Actions without client-side JavaScript.

### Order Items

`OrderItem` stores a price and name **snapshot** at time of purchase — no foreign key to `Products`. This ensures order history is preserved if products are later changed or removed.

### Messaging Architecture

The Server publishes lightweight JSON messages to RabbitMQ queues. The Worker project runs two independent `BackgroundService` consumers:

| Queue | Published when | Consumer action |
|---|---|---|
| `order-confirmations` | Order created | Send confirmation email via Mailpit |
| `stock-adjustments` | Order marked Paid or Refunded | Increment/decrement `Products.Stock` in Postgres |

Messages use `QuantityDelta` (negative = deduct, positive = restore). Stock is clamped to 0 to prevent negative values.

### Admin Authentication

Admins authenticate with email/password against the `AdminUsers` table. Passwords are hashed with PBKDF2 (SHA-256, 100,000 iterations). On success the server returns a JWT (HS256, 24h expiry) which the frontend stores in an `httpOnly` cookie scoped to `/admin`.

### Order Status State Machine

```
Unpaid → Paid → Refunded
```

No other transitions are permitted. Attempting an invalid transition returns `400`.

### Data Persistence

Postgres data is stored in a named Docker volume (`shop-lite-postgres-data`) so it survives container restarts. To reset the database:

```bash
docker volume rm shop-lite-postgres-data
```