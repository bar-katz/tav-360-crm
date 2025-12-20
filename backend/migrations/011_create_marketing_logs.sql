-- Create marketing_logs table
CREATE TABLE IF NOT EXISTS marketing_logs (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES marketing_leads(id) ON DELETE SET NULL,
    phone_number VARCHAR(50),
    message_sent TEXT,
    status VARCHAR(50) DEFAULT 'sent',
    sent_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marketing_logs_lead_id ON marketing_logs(lead_id);
CREATE INDEX idx_marketing_logs_status ON marketing_logs(status);
CREATE INDEX idx_marketing_logs_created_date ON marketing_logs(created_date);

