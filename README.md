# Database Analyzer & Visualization Tool

This repository contains the integrated frontend, backend, and database components for the "Database Analyzer & Visualization Tool." This application aims to provide a user-friendly web interface for connecting to, exploring, and visualizing data from various external databases (e.g., PostgreSQL, MySQL, MongoDB).

## 1. Project Overview

The tool is designed with a modern, scalable, and secure architecture, separating concerns across its three main layers:

*   **Frontend**: The user interface, built with React, providing an intuitive experience for database connection management, schema exploration, visualization configuration, and interactive charting.
*   **Backend**: The server-side logic, implemented with Python FastAPI, handling user authentication, secure database connection management, schema introspection, data retrieval, aggregation, and visualization configuration persistence.
*   **Database (Internal)**: A PostgreSQL database used by the tool itself to securely store user accounts, encrypted external database connection details, and saved visualization configurations.

## 2. Architecture Highlights

The system follows a microservices-oriented architecture for the backend and a Single-Page Application (SPA) for the frontend, deployed on AWS. Key architectural principles include:

*   **Separation of Concerns**: Clear boundaries between layers.
*   **Security by Design**: Emphasis on secure authentication (JWTs, hashed passwords), data encryption (in transit and at rest for sensitive credentials), and robust input validation to prevent vulnerabilities like SQL injection.
*   **Scalability**: Designed for horizontal scaling of backend services and database resources.
*   **Maintainability**: Modular codebase, consistent coding standards, and comprehensive documentation.

## 3. Component Responsibilities

*   **`frontend/`**: Contains the React application code. Developed by the Frontend Developer.
*   **`backend/`**: Contains the Python FastAPI application code. Developed by the Backend Developer.
*   **`database/`**: Contains SQL schema definitions and migration scripts for the internal PostgreSQL database. Developed by the Database Developer.
*   **`architecture/`**: Contains detailed architectural design documents, including overall architecture, technology stack, data flow, security, scalability, and guidelines for each development team. Developed by the Solution Architect.

## 4. Key Integration Points & APIs (Current State)

The initial focus for integration has been on the **User Authentication** flow.

### Backend API Endpoints (Authentication Module - `/backend/src/api/v1/auth/routes.py`):

*   **`POST /api/v1/auth/register`**:
    *   **Description**: Registers a new user account.
    *   **Request Body**:
        ```json
        {
            "username": "string",
            "email": "user@example.com",
            "password": "strongpassword"
        }
        ```
    *   **Response**:
        ```json
        {
            "id": "uuid",
            "username": "string",
            "email": "user@example.com",
            "created_at": "timestamp",
            "updated_at": "timestamp"
        }
        ```
*   **`POST /api/v1/auth/login`**:
    *   **Description**: Authenticates a user and returns a JWT token.
    *   **Request Body**:
        ```json
        {
            "username": "string",
            "password": "strongpassword"
        }
        ```
    *   **Response**:
        ```json
        {
            "access_token": "your_jwt_token",
            "token_type": "bearer"
        }
        ```
*   **`GET /api/v1/auth/me`**:
    *   **Description**: Retrieves details of the currently authenticated user. Requires a valid JWT in the `Authorization: Bearer <token>` header.
    *   **Response**:
        ```json
        {
            "id": "uuid",
            "username": "string",
            "email": "user@example.com",
            "created_at": "timestamp",
            "updated_at": "timestamp"
        }
        ```

### Frontend Integration with Backend:

The frontend's authentication module (`frontend/src/features/Auth/`) is responsible for:
*   Sending user registration and login requests to the corresponding backend API endpoints.
*   Storing the received JWT securely (e.g., in local storage for demonstration, or HttpOnly cookies in production).
*   Including the JWT in the `Authorization` header for all protected API calls (e.g., `/api/v1/auth/me`).

### Backend Integration with Internal Database:

The backend's authentication service (`backend/src/services/auth_service.py`) interacts with the internal PostgreSQL database:
*   Persisting new user records (username, hashed password, email) into the `users` table.
*   Retrieving user details for login verification.
*   The `backend/src/core/database.py` module manages the SQLAlchemy ORM connection to the internal database.

## 5. Local Setup Instructions

To set up and run the entire application locally, Docker and Docker Compose are highly recommended.

### Prerequisites:

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
*   Git installed.

### Steps for Docker Compose Setup (Recommended):

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/50101063/db-analyzer-viz.git
    cd db-analyzer-viz
    ```

2.  **Create `.env` files:**
    *   **For Backend (`backend/.env`):**
        ```
        DATABASE_URL=postgresql://user:password@db:5432/db_analyzer_viz
        SECRET_KEY=your_super_secret_key_for_jwt_signing
        ALGORITHM=HS256
        ACCESS_TOKEN_EXPIRE_MINUTES=30
        ```
        *Replace `user`, `password`, `your_super_secret_key_for_jwt_signing` with strong, unique values.*
    *   **For Frontend (`frontend/.env`):**
        ```
        VITE_API_BASE_URL=http://localhost:8000/api/v1
        ```

3.  **Build and Run Services:**
    From the root of the `db-analyzer-viz` directory, run:
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build Docker images for the backend and frontend.
    *   Start the PostgreSQL database container (`db`).
    *   Run database migrations (if any are configured in the backend's entrypoint, or you'll need to apply them manually).
    *   Start the backend API server.
    *   Start the frontend development server.

4.  **Access the Application:**
    *   Frontend: `http://localhost:5173` (or the port Vite indicates)
    *   Backend API Docs (Swagger UI): `http://localhost:8000/docs`
    *   Backend API Docs (ReDoc): `http://localhost:8000/redoc`

### Manual Setup (Alternative - Not Recommended for Full Integration):

#### 5.1. Database Setup (Internal PostgreSQL)

1.  **Install PostgreSQL:** Ensure PostgreSQL 16.x is installed locally or accessible.
2.  **Create Database and User:**
    ```sql
    CREATE USER user WITH PASSWORD 'password';
    CREATE DATABASE db_analyzer_viz OWNER user;
    ```
    (Replace `user`, `password`, `db_analyzer_viz` as desired)
3.  **Apply Schema:** Navigate to `database/migrations/` and apply the `V1__initial_schema.sql` script to your `db_analyzer_viz` database.
    ```bash
    psql -U user -d db_analyzer_viz -f V1__initial_schema.sql
    ```

#### 5.2. Backend Setup

1.  **Navigate to Backend Directory:**
    ```bash
    cd backend
    ```
2.  **Create and Activate Virtual Environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Create `.env` file:** (Same as Docker Compose step 2 for backend)
    ```
    DATABASE_URL=postgresql://user:password@localhost:5432/db_analyzer_viz
    SECRET_KEY=your_super_secret_key_for_jwt_signing
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    ```
5.  **Run Backend Server:**
    ```bash
    uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    The API will be available at `http://localhost:8000`.

#### 5.3. Frontend Setup

1.  **Navigate to Frontend Directory:**
    ```bash
    cd frontend
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Create `.env` file:** (Same as Docker Compose step 2 for frontend)
    ```
    VITE_API_BASE_URL=http://localhost:8000/api/v1
    ```
4.  **Run Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The frontend will typically be available at `http://localhost:5173`.

---
