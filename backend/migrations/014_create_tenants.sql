-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    lease_start_date DATE,
    lease_end_date DATE,
    monthly_rent NUMERIC(15, 2),
    deposit NUMERIC(15, 2),
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_contact_id ON tenants(contact_id);
CREATE INDEX idx_tenants_property_id ON tenants(property_id);
CREATE INDEX idx_tenants_lease_start_date ON tenants(lease_start_date);
CREATE INDEX idx_tenants_lease_end_date ON tenants(lease_end_date);

