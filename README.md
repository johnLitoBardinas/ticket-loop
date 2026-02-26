# Ticket Loop

A lightweight ticket management system composed of three services: a REST API for ticket operations, a frontend for user interaction, and a webhook service for email notifications on ticket events.

## Project Structure

```
ticket-loop/
├── tl-api/          # REST API service (FastAPI + PostgreSQL)
├── tl-fe/           # Frontend application (React + TypeScript)
├── tl-webhook/      # Webhook email notification service (Express + Brevo)
├── SETUP.md         # Environment setup instructions
└── README.md
```

> Each sub-project contains its own `README.md` with detailed documentation on its tech stack, project structure, configuration, and how to run it locally.

## Tech Stack

### tl-api — REST API

| Technology | Version | Role |
|---|---|---|
| Python | 3.11 | Runtime |
| FastAPI | 0.115+ | Web framework with auto-generated OpenAPI docs |
| PostgreSQL | 17 | Relational database with enum and FK support |
| SQLAlchemy | 2.0 (async) | ORM with async session support via asyncpg |
| Alembic | 1.13 | Database migrations |
| Pydantic | 2.x | Request/response validation and config management |
| httpx | — | Async HTTP client for outbound webhook calls |
| Docker + Compose | — | Containerization and multi-service orchestration |

### tl-fe — Frontend

| Technology | Version | Role |
|---|---|---|
| React | 19 | UI library |
| TypeScript | 5.9 | Type-safe JavaScript |
| Vite | 7 | Build tool and dev server with HMR |
| Tailwind CSS | 4 | Utility-first CSS framework |
| React Router | 7 | Client-side routing |
| TanStack React Query | 5 | Server state management and data fetching |
| React Hook Form + Zod | — | Form handling with schema-based validation |
| Zustand | 5 | Lightweight client state management |
| Axios | — | HTTP client |

### tl-webhook — Webhook Service

| Technology | Version | Role |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5 | HTTP framework for webhook endpoints |
| Brevo SDK | 4 | Transactional email delivery |
| dotenv | — | Environment variable management |

## How It Works

1. A user submits a ticket through the **frontend** (`tl-fe`).
2. The **API** (`tl-api`) persists the ticket and contact in PostgreSQL, then fires a POST request to the webhook service.
3. The **webhook** (`tl-webhook`) receives the event, logs it, and sends an email notification to the configured admin address via Brevo.
