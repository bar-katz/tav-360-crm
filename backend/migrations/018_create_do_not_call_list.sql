-- Create do_not_call_list table
CREATE TABLE IF NOT EXISTS do_not_call_list (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    reason TEXT,
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_do_not_call_list_phone_number ON do_not_call_list(phone_number);

