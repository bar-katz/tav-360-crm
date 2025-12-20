-- Create service_calls table
-- Note: supplier_id reference will be added after suppliers table is created
CREATE TABLE IF NOT EXISTS service_calls (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    supplier_id INTEGER, -- Will add foreign key constraint after suppliers table exists
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint after suppliers table is created
ALTER TABLE service_calls ADD CONSTRAINT fk_service_calls_supplier 
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

CREATE INDEX idx_service_calls_status ON service_calls(status);
CREATE INDEX idx_service_calls_property_id ON service_calls(property_id);
CREATE INDEX idx_service_calls_contact_id ON service_calls(contact_id);

