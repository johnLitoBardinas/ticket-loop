# Ticket Loop - Project Setup Guide

A lightweight support ticket system composed of three services: a **FastAPI backend**, a **React frontend**, and a **Node.js webhook service**.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│            tl-fe (React + Vite)                      │
│            http://localhost:8888                      │
│  - Create tickets via form                           │
│  - Admin dashboard to view/resolve tickets           │
│  - Vite proxies /api -> http://localhost:8000        │
└────────────────────┬────────────────────────────────┘
                     │ HTTP (REST)
                     ▼
┌─────────────────────────────────────────────────────┐
│            tl-api (FastAPI + SQLAlchemy)              │
│            http://localhost:8000                      │
│  - CRUD operations for tickets & contacts            │
│  - Input sanitization (HTML escape)                  │
│  - Triggers webhook on ticket creation               │
│  - Runs in Docker alongside PostgreSQL               │
└──────┬──────────────────────────┬───────────────────┘
       │                          │
       ▼                          ▼ HTTP POST
┌────────────────┐   ┌───────────────────────────────┐
│  PostgreSQL 17 │   │  tl-webhook (Express.js)       │
│  port 5432     │   │  http://localhost:9999          │
│                │   │  - Logs tickets to daily files  │
│  Tables:       │   │  - Sends email via Brevo API   │
│  - contacts    │   │  - Notifies admin of new tickets│
│  - tickets     │   └───────────────────────────────┘
└────────────────┘
```

## Tech Stack

| Service      | Technology                                    | Port |
|-------------|-----------------------------------------------|------|
| **tl-api**  | Python 3.11, FastAPI, SQLAlchemy (async), Alembic | 8000 |
| **tl-fe**   | React 19, TypeScript, Vite, Tailwind CSS v4   | 8888 |
| **tl-webhook** | Node.js (>=18), Express 5, Brevo SDK       | 9999 |
| **Database** | PostgreSQL 17 (Docker)                        | 5432 |

## Prerequisites

- **Python 3.11** with `pip`
- **Node.js >= 18** with `npm`
- **Docker** & **Docker Compose** (for PostgreSQL and the API container)

## Project Structure

```
ticket-loop/
├── tl-api/                 # FastAPI backend
│   ├── main.py             # App entry point & API routes
│   ├── models.py           # SQLAlchemy models (Contact, Ticket)
│   ├── schemas.py          # Pydantic validation schemas
│   ├── database.py         # Async DB engine & session
│   ├── config.py           # Settings via pydantic-settings
│   ├── alembic/            # Database migrations
│   ├── Dockerfile          # Python 3.11-slim container
│   ├── docker-compose.yml  # API + PostgreSQL services
│   ├── requirements.txt    # Python dependencies
│   └── .env.sample         # Environment template
│
├── tl-fe/                  # React frontend
│   ├── src/
│   │   ├── api/            # Axios client & ticket endpoints
│   │   ├── components/     # Layout, TicketForm
│   │   ├── hooks/          # React Query hooks (useTickets, useCreateTicket, useResolveTicket)
│   │   ├── pages/          # CreateTicketPage, TicketListPage
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── stores/         # Zustand UI state
│   │   ├── router.tsx      # Routes: /admin, /create
│   │   └── App.tsx         # Root component
│   ├── vite.config.ts      # Dev server + API proxy config
│   └── package.json
│
├── tl-webhook/             # Webhook notification service
│   ├── index.js            # Express server + Brevo email
│   ├── logs/               # Daily ticket log files (auto-created)
│   ├── package.json
│   └── .env.sample         # Brevo API key & email config
│
└── SETUP.md                # This file
```

## Setup Instructions

### 1. Start the API + Database (Docker)

```bash
cd tl-api

# Copy and configure environment variables
cp .env.sample .env

# Start PostgreSQL and the FastAPI service
docker compose up --build -d
```

This starts:
- **PostgreSQL 17** on port `5432` (with health check)
- **FastAPI** on port `8000` (with hot-reload via volume mount)

The database tables are auto-created on startup via SQLAlchemy.

**Environment variables** (`.env`):
```
POSTGRES_USER=ticketloop
POSTGRES_PASSWORD=ticketloop
POSTGRES_DB=ticketloop
DATABASE_URL=postgresql+asyncpg://ticketloop:ticketloop@db:5432/ticketloop
```

### 2. Start the Webhook Service

```bash
cd tl-webhook

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.sample .env
# Edit .env with your Brevo API key and email addresses

# Start the service
npm start
```

**Environment variables** (`.env`):
```
BREVO_API_KEY=your-brevo-api-key-here
SENDER_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
PORT=9999
```

> **Note:** You need a [Brevo](https://www.brevo.com/) account and API key for email sending. The webhook will still log tickets to `logs/` even without a valid key.

### 3. Start the Frontend

```bash
cd tl-fe

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend runs on `http://localhost:8888` and proxies `/api` requests to `http://localhost:8000`.

## API Endpoints

| Method  | Endpoint                          | Description                 |
|---------|-----------------------------------|-----------------------------|
| `GET`   | `/health`                         | Health check                |
| `GET`   | `/api/v1/tickets`                 | List all tickets            |
| `POST`  | `/api/v1/tickets`                 | Create a new ticket         |
| `PATCH` | `/api/v1/tickets/{id}/resolve`    | Mark a ticket as resolved   |

### Webhook Endpoint (tl-webhook)

| Method  | Endpoint                              | Description                     |
|---------|---------------------------------------|---------------------------------|
| `GET`   | `/health`                             | Health check                    |
| `POST`  | `/api/webhook/ticket-created`         | Receives new ticket events      |

## Data Flow

1. User submits a ticket via the **React form** (`/create`)
2. Frontend sends `POST /api/v1/tickets` to the **FastAPI** backend
3. Backend creates a `Contact` (or reuses by email) and a `Ticket` in **PostgreSQL**
4. Backend fires a webhook `POST` to `http://host.docker.internal:9999/api/webhook/ticket-created`
5. Webhook service **logs** the ticket to a daily file (`logs/ticket-MMDDYYYY.txt`)
6. Webhook service **sends an email** to the admin via **Brevo** with ticket details
7. Admin views and manages tickets on the **dashboard** (`/admin`)

## Database Schema

```
contacts                          tickets
┌──────────────┐                 ┌──────────────────┐
│ id (PK)      │                 │ id (PK)          │
│ full_name    │  1         *    │ contact_id (FK)  │
│ email (uniq) │◄────────────────│ issue_description│
│ created_at   │                 │ status (enum)    │
└──────────────┘                 │ created_at       │
                                 └──────────────────┘

TicketStatus: "open" | "resolved"
```

## Frontend Routes

| Path      | Page              | Description                              |
|-----------|-------------------|------------------------------------------|
| `/`       | —                 | Redirects to `/admin`                    |
| `/admin`  | TicketListPage    | Dashboard with filtering (all/open/resolved) |
| `/create` | CreateTicketPage  | Ticket submission form with validation   |

## Frontend Libraries

- **React Query** — server state, caching, auto-refetch on mutations
- **React Hook Form + Zod** — form handling with schema validation
- **Zustand** — lightweight UI state (status filter)
- **Axios** — HTTP client
- **Tailwind CSS v4** — utility-first styling

## Development Notes

- The API uses **async SQLAlchemy** with `asyncpg` for non-blocking DB operations
- Input is sanitized via HTML escaping in Pydantic validators (`schemas.py`)
- Webhook failures are logged but do **not** block ticket creation
- The webhook connects from Docker via `host.docker.internal:9999` (macOS/Windows Docker Desktop)
- Log files in `tl-webhook/logs/` rotate daily by date
