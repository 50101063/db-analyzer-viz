# Backend Service for Database Analyzer & Visualization Tool

This directory contains the backend service for the Database Analyzer & Visualization Tool, built with Python (FastAPI) and designed to handle API requests, interact with the internal PostgreSQL database, and connect to external user databases.

## Technology Stack

*   **Language:** Python 3.11+
*   **Web Framework:** FastAPI 0.111.0+
*   **Internal Database:** PostgreSQL (managed via SQLAlchemy)
*   **Authentication:** JWT (PyJWT)
*   **Password Hashing:** Passlib (Bcrypt)
*   **Containerization:** Docker

## Project Structure

```
backend/
├── Dockerfile               # Docker build instructions
├── requirements.txt         # Python dependencies
└── src/
    ├── main.py              # Main FastAPI application entry point
    ├── api/                 # API routers for different feature domains
    │   └── v1/              # API versioning
    │       ├── auth/        # Authentication endpoints
    │       │   ├── routes.py
    │       │   └── schemas.py
    │       ├── connections/ # Connection management endpoints (placeholder)
    │       │   ├── routes.py
    │       │   └── schemas.py
    │       ├── data/        # Schema introspection & query execution endpoints (placeholder)
    │       │   ├── routes.py
    │       │   └── schemas.py
    │       └── visualizations/ # Visualization configuration endpoints (placeholder)
    │           ├── routes.py
    │           └── schemas.py
    ├── core/                # Core application components
    │   ├── config.py        # Application configuration (settings, environment variables)
    │   ├── security.py      # JWT handling, password hashing, authentication dependencies
    │   └── database.py      # SQLAlchemy engine, session management for internal DB
    ├── models/              # SQLAlchemy ORM models for internal database
    │   └── user.py
    ├── services/            # Business logic and external integrations
    │   ├── auth_service.py
    │   ├── connection_service.py # (Placeholder)
    │   ├── query_service.py      # (Placeholder)
    │   └── visualization_service.py # (Placeholder)
    ├── tests/               # Unit and integration tests (placeholder)
    └── utils/               # General utility functions (placeholder)
```

## Setup and Local Development

### Prerequisites

*   Python 3.11+
*   Docker (optional, for containerized development)
*   Poetry (recommended for dependency management) or pip

### 1. Clone the repository

```bash
git clone https://github.com/50101063/db-analyzer-viz.git
cd db-analyzer-viz/backend
```

### 2. Install Dependencies

Using Poetry (recommended):

```bash
poetry install
poetry shell
```

Using pip:

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the `backend/src` directory with the following environment variables. **Do not commit this file to Git.**

```env
DATABASE_URL="postgresql+psycopg2://user:password@host:port/dbname"
SECRET_KEY="your_super_secret_jwt_key_here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

*   `DATABASE_URL`: Connection string for your internal PostgreSQL database. For local development, this might be a Dockerized PostgreSQL instance.
*   `SECRET_KEY`: A strong, random string used for signing JWTs. Generate a long, complex string (e.g., using `openssl rand -hex 32`).
*   `ALGORITHM`: The algorithm used for JWT signing (e.g., `HS256`).
*   `ACCESS_TOKEN_EXPIRE_MINUTES`: Expiration time for access tokens in minutes.

### 4. Run Database Migrations (for internal DB)

*(Note: Database migration setup will be added in a later phase. For initial setup, you might manually create tables or use a simple ORM sync if available.)*

### 5. Run the Application

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag is useful for local development as it restarts the server on code changes.

The API documentation will be available at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc` (ReDoc).

### 6. Run with Docker (Optional)

Build the Docker image:

```bash
docker build -t db-analyzer-backend .
```

Run the Docker container:

```bash
docker run -p 8000:8000 --env-file src/.env db-analyzer-backend
```

Ensure your `.env` file is correctly passed to the container.

## API Endpoints (Initial)

*   `POST /api/v1/auth/register`: Register a new user.
*   `POST /api/v1/auth/login`: Authenticate user and get JWT.
*   `GET /api/v1/auth/me`: Get current authenticated user's details (requires JWT).

## Contributing

Please refer to the overall project's architectural documentation and backend development guidelines for contributing.
