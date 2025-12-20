-- Create project_leads table
CREATE TABLE IF NOT EXISTS project_leads (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    interest_level VARCHAR(50),
    budget NUMERIC(15, 2),
    preferred_units VARCHAR(255),
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_leads_contact_id ON project_leads(contact_id);
CREATE INDEX idx_project_leads_project_id ON project_leads(project_id);
CREATE INDEX idx_project_leads_interest_level ON project_leads(interest_level);

