-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    category VARCHAR(50), -- מגורים, משרדים
    property_type VARCHAR(50), -- דירה, בית, etc.
    city VARCHAR(100),
    area VARCHAR(100),
    street VARCHAR(255),
    building_number VARCHAR(50),
    apartment_number VARCHAR(50),
    price NUMERIC(15, 2),
    rooms INTEGER,
    floor INTEGER,
    total_floors INTEGER,
    parking BOOLEAN DEFAULT FALSE,
    air_conditioning BOOLEAN DEFAULT FALSE,
    storage BOOLEAN DEFAULT FALSE,
    status VARCHAR(50),
    listing_type VARCHAR(50), -- מכירה, השכרה
    handler VARCHAR(255),
    source VARCHAR(255),
    image_urls TEXT[], -- Array of image URLs
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_contact_id ON properties(contact_id);
CREATE INDEX idx_properties_category ON properties(category);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);

