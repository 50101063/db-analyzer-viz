# Database Setup and Migration Guide

This directory contains the database schema and migration scripts for the internal PostgreSQL database used by the "Database Analyzer & Visualization Tool."

## 1. Database Technology

The internal database is **PostgreSQL 16.x**.

## 2. Prerequisites

*   **PostgreSQL Server:** Ensure you have a PostgreSQL 16.x server accessible.
*   **Database User:** A PostgreSQL user with privileges to create databases and schemas.
*   **`psql` client:** Or any other PostgreSQL client tool to execute SQL scripts.

## 3. Database Creation

First, create a dedicated database for the application. You can do this via your PostgreSQL client (e.g., `psql`):

```sql
CREATE DATABASE database_analyzer_viz;
```

## 4. Applying Initial Schema

The initial database schema is defined in `migrations/V1__initial_schema.sql`. This script sets up all necessary tables (users, database_connections, visualization_configurations), constraints, and triggers.

To apply the initial schema:

1.  Navigate to the `database/` directory in your terminal.
2.  Connect to your newly created database using `psql` (replace `your_user` and `your_db_name` with your actual credentials and database name):

    ```bash
    psql -U your_user -d database_analyzer_viz -h your_host -p your_port -f migrations/V1__initial_schema.sql
    ```

    *   `-U`: Your PostgreSQL username.
    *   `-d`: The database name (`database_analyzer_viz`).
    *   `-h`: The database host (e.g., `localhost` or your RDS endpoint).
    *   `-p`: The database port (default is `5432`).
    *   `-f`: Specifies the SQL file to execute.

    You will be prompted for your PostgreSQL password.

## 5. Verifying the Schema

After running the script, you can connect to the `database_analyzer_viz` database and verify the tables:

```sql
\c database_analyzer_viz;
\dt; -- List tables
\d users; -- Describe the users table
\d database_connections; -- Describe the database_connections table
\d visualization_configurations; -- Describe the visualization_configurations table
```

## 6. Future Migrations

For future schema changes, a dedicated database migration tool like [Alembic](https://alembic.sqlalchemy.org/en/latest/) (for Python/SQLAlchemy projects) or [Flyway](https://flywaydb.org/) / [Liquibase](https://www.liquibase.com/) is recommended. New migration scripts would be added to the `migrations/` directory and applied in order.

---
