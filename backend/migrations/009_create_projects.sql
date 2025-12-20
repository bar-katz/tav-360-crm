-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    developer VARCHAR(255),
    total_units INTEGER,
    price_range_min NUMERIC(15, 2),
    price_range_max NUMERIC(15, 2),
    status VARCHAR(50),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_location ON projects(location);
CREATE INDEX idx_projects_status ON projects(status);

