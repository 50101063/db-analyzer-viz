-- migrations/V1__initial_schema.sql

-- Create the 'users' table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create a function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for 'users' table
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create the 'database_connections' table
CREATE TABLE database_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    database_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create trigger for 'database_connections' table
CREATE TRIGGER set_database_connections_updated_at
BEFORE UPDATE ON database_connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create the 'visualization_configurations' table
CREATE TABLE visualization_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    connection_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    x_axis_column VARCHAR(255) NOT NULL,
    y_axis_column VARCHAR(255) NOT NULL,
    aggregation_type VARCHAR(50) NOT NULL, -- e.g., 'SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'NONE'
    chart_type VARCHAR(50) NOT NULL,     -- e.g., 'Bar', 'Line', 'Pie', 'Scatter'
    filters JSONB,                       -- Stores filter conditions as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_id) REFERENCES database_connections(id) ON DELETE CASCADE
);

-- Create trigger for 'visualization_configurations' table
CREATE TRIGGER set_visualization_configurations_updated_at
BEFORE UPDATE ON visualization_configurations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for foreign keys and frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_database_connections_user_id ON database_connections(user_id);
CREATE INDEX idx_visualization_configurations_user_id ON visualization_configurations(user_id);
CREATE INDEX idx_visualization_configurations_connection_id ON visualization_configurations(connection_id);
CREATE INDEX idx_visualization_configurations_table_name ON visualization_configurations(table_name);
