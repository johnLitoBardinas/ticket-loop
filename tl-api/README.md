# Ticket Loop API

A lightweight ticket management REST API that allows creating, listing, and resolving support tickets with associated contacts.

## Tech Stack

### Python 3.11

The core language. Python's mature async ecosystem and readable syntax make it a strong fit for building APIs quickly without sacrificing maintainability.

### FastAPI

The web framework. FastAPI was chosen because it provides:

- **Automatic OpenAPI docs** — Swagger UI and ReDoc are generated out of the box, eliminating the need to maintain separate API documentation.
- **Native async/await** — Built on top of Starlette, it supports asynchronous request handling without extra configuration, which matters when the API makes outbound HTTP calls (webhooks) alongside database queries.
- **Pydantic integration** — Request validation and serialization are handled declaratively through type hints, reducing boilerplate compared to Flask or Django REST Framework.

### PostgreSQL 17

The database. PostgreSQL is used because:

- **Relational data model** — Tickets have a foreign key relationship to contacts. A relational database enforces this at the schema level.
- **Proven reliability** — PostgreSQL handles concurrent writes well, which is relevant for a ticketing system where multiple tickets may be created simultaneously.
- **Enum support** — Ticket status (`open` / `resolved`) is stored as a native PostgreSQL enum, enforcing valid states at the database level.

### SQLAlchemy 2.0 (Async)

The ORM. SQLAlchemy was chosen because:

- **Async session support** — Combined with `asyncpg`, it allows non-blocking database operations that align with FastAPI's async model.
- **Declarative models** — Tables are defined as Python classes, keeping the schema close to the application logic.
- **Mature ecosystem** — SQLAlchemy has broad community support and works well with Alembic for migrations.

### asyncpg

The PostgreSQL driver. It is the fastest Python PostgreSQL driver available and provides native async support, which is required for SQLAlchemy's async engine.

### Alembic

The database migration tool. It tracks schema changes over time and allows rolling forward or backward. This avoids relying on auto-create at startup for production environments.

### Pydantic 2.x + pydantic-settings

Used for:

- **Request/response validation** — Schemas define exactly what the API accepts and returns, with field-level validators for input sanitization (HTML escaping, email normalization).
- **Configuration management** — `pydantic-settings` loads environment variables into typed config objects, catching misconfiguration at startup rather than at runtime.

### httpx

The async HTTP client used for firing webhook calls when a ticket is created. It was chosen over `requests` because it supports async natively, matching the rest of the async stack.

### Uvicorn

The ASGI server that runs the FastAPI application. It supports hot reloading in development and is the standard server for FastAPI deployments.

### Docker + Docker Compose

The containerization layer. Docker Compose orchestrates two services:

- **api** — The FastAPI application container built from `python:3.11-slim`.
- **db** — A PostgreSQL 17 container with a health check to ensure the database is ready before the API starts.

This setup makes the project runnable with a single `docker compose up` command, with no local Python or PostgreSQL installation required.

## Project Structure

```
tl-api/
├── main.py              # Application entry point and route definitions
├── database.py          # Async SQLAlchemy engine and session factory
├── models.py            # ORM models (Contact, Ticket)
├── schemas.py           # Pydantic request/response schemas
├── config.py            # Environment-based configuration
├── requirements.txt     # Python dependencies
├── Dockerfile           # Container image definition
├── docker-compose.yml   # Multi-container orchestration
├── alembic.ini          # Alembic configuration
├── alembic/             # Database migration scripts
│   ├── env.py
│   └── versions/
└── .env.sample          # Environment variable template
```

## Getting Started

```bash
# Copy environment variables
cp .env.sample .env

# Start the API and database
docker compose up --build

# The API will be available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

## API Endpoints

| Method  | Path                              | Description                |
| ------- | --------------------------------- | -------------------------- |
| `GET`   | `/health`                         | Health check               |
| `GET`   | `/api/v1/tickets`                 | List all tickets           |
| `POST`  | `/api/v1/tickets`                 | Create a ticket + contact  |
| `PATCH` | `/api/v1/tickets/{id}/resolve`    | Mark a ticket as resolved  |
