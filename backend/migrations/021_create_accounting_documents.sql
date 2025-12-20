-- Create accounting_documents table
CREATE TABLE IF NOT EXISTS accounting_documents (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    amount NUMERIC(15, 2),
    date DATE,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    file_url VARCHAR(500),
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounting_documents_document_type ON accounting_documents(document_type);
CREATE INDEX idx_accounting_documents_property_id ON accounting_documents(property_id);
CREATE INDEX idx_accounting_documents_contact_id ON accounting_documents(contact_id);
CREATE INDEX idx_accounting_documents_date ON accounting_documents(date);

