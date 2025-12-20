-- Note: property_owners, tenants, matches, and project_leads tables
-- have been moved to separate migration files (013-016) for better organization.
-- This file now only contains marketing_leads table.

-- Create marketing_leads table
CREATE TABLE IF NOT EXISTS marketing_leads (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    phone_number VARCHAR(50),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    budget NUMERIC(15, 2),
    neighborhood VARCHAR(255),
    street VARCHAR(255),
    rooms_min INTEGER,
    rooms_max INTEGER,
    client_type VARCHAR(50),
    seriousness VARCHAR(50),
    additional_notes TEXT,
    opt_out_whatsapp BOOLEAN DEFAULT FALSE,
    source VARCHAR(255),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marketing_leads_phone_number ON marketing_leads(phone_number);
CREATE INDEX idx_marketing_leads_source ON marketing_leads(source);

