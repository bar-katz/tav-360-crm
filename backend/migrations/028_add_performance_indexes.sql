-- Migration 028: Add performance indexes for frequently filtered/joined fields
-- These indexes optimize PostgREST queries

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_rooms ON properties(rooms);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_preferred_property_type ON clients(preferred_property_type);
CREATE INDEX IF NOT EXISTS idx_clients_request_type ON clients(request_type);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_city ON clients(city);
CREATE INDEX IF NOT EXISTS idx_clients_created_date ON clients(created_date);

-- Matches indexes (foreign keys already have indexes, but add composite)
CREATE INDEX IF NOT EXISTS idx_matches_property_client ON matches(property_id, client_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_date ON matches(created_date);

-- Service calls indexes
CREATE INDEX IF NOT EXISTS idx_service_calls_status ON service_calls(status);
CREATE INDEX IF NOT EXISTS idx_service_calls_urgency ON service_calls(urgency);
CREATE INDEX IF NOT EXISTS idx_service_calls_created_date ON service_calls(created_date);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_start_date ON meetings(start_date);
CREATE INDEX IF NOT EXISTS idx_meetings_created_date ON meetings(created_date);

-- Marketing leads indexes
CREATE INDEX IF NOT EXISTS idx_marketing_leads_neighborhood ON marketing_leads(neighborhood);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_client_type ON marketing_leads(client_type);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_last_contacted ON marketing_leads(last_contacted);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_category_listing_type ON properties(category, listing_type);
CREATE INDEX IF NOT EXISTS idx_clients_preferred_type_request_type ON clients(preferred_property_type, request_type);

