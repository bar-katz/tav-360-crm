-- Create property_owners table
CREATE TABLE IF NOT EXISTS property_owners (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    ownership_percentage NUMERIC(5, 2),
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_owners_contact_id ON property_owners(contact_id);
CREATE INDEX idx_property_owners_property_id ON property_owners(property_id);

