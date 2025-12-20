-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    app_role VARCHAR(50) DEFAULT 'agent' CHECK (app_role IN ('admin', 'office_manager', 'agent', 'property_manager', 'project_manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO users (email, password_hash, full_name, app_role) 
VALUES ('admin@tav360.com', '$2b$12$7wNCESS6XVbxAtj6H9UgkeLLYGdo.gyzY9/xjxdkytcLm2dTIVC6u', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

