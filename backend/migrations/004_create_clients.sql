-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    request_type VARCHAR(50), -- קנייה, השכרה
    preferred_property_type VARCHAR(50),
    budget NUMERIC(15, 2),
    preferred_rooms VARCHAR(50),
    city VARCHAR(100),
    neighborhood VARCHAR(100),
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

CREATE INDEX idx_clients_contact_id ON clients(contact_id);
CREATE INDEX idx_clients_request_type ON clients(request_type);
CREATE INDEX idx_clients_city ON clients(city);

