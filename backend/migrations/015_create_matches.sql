-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    match_score INTEGER,
    status VARCHAR(50),
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_property_id ON matches(property_id);
CREATE INDEX idx_matches_client_id ON matches(client_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_match_score ON matches(match_score);

