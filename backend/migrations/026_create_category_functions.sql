-- Migration 026: Create PostgreSQL functions for category filtering
-- These functions encapsulate the business logic for filtering by category
-- PostgREST will expose these as RPC endpoints

-- Function to filter properties by category
CREATE OR REPLACE FUNCTION filter_properties_by_category(category_param TEXT DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    contact_id INTEGER,
    property_type VARCHAR,
    category VARCHAR,
    listing_type VARCHAR,
    city VARCHAR,
    street VARCHAR,
    rooms INTEGER,
    price NUMERIC,
    area VARCHAR,
    status VARCHAR,
    description TEXT,
    created_date TIMESTAMP WITH TIME ZONE,
    updated_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    IF category_param = 'מגורים' THEN
        RETURN QUERY
        SELECT p.id, p.contact_id, p.property_type, p.category, p.listing_type,
               p.city, p.street, p.rooms, p.price, p.area, p.status,
               p.description, p.created_date, p.updated_date
        FROM properties p
        WHERE p.category = 'מגורים';
    ELSIF category_param = 'משרדים' THEN
        RETURN QUERY
        SELECT p.id, p.contact_id, p.property_type, p.category, p.listing_type,
               p.city, p.street, p.rooms, p.price, p.area, p.status,
               p.description, p.created_date, p.updated_date
        FROM properties p
        WHERE p.category = 'משרדים';
    ELSE
        RETURN QUERY
        SELECT p.id, p.contact_id, p.property_type, p.category, p.listing_type,
               p.city, p.street, p.rooms, p.price, p.area, p.status,
               p.description, p.created_date, p.updated_date
        FROM properties p;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to filter clients/buyers by category
CREATE OR REPLACE FUNCTION filter_clients_by_category(category_param TEXT DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    contact_id INTEGER,
    request_type VARCHAR,
    preferred_property_type VARCHAR,
    budget NUMERIC,
    preferred_rooms VARCHAR,
    city VARCHAR,
    neighborhood VARCHAR,
    street VARCHAR,
    rooms_min INTEGER,
    rooms_max INTEGER,
    client_type VARCHAR,
    seriousness VARCHAR,
    additional_notes TEXT,
    opt_out_whatsapp BOOLEAN,
    source VARCHAR,
    created_date TIMESTAMP WITH TIME ZONE,
    updated_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    IF category_param = 'מגורים' THEN
        RETURN QUERY
        SELECT c.id, c.contact_id, c.request_type, c.preferred_property_type,
               c.budget, c.preferred_rooms, c.city, c.neighborhood, c.street,
               c.rooms_min, c.rooms_max, c.client_type, c.seriousness,
               c.additional_notes, c.opt_out_whatsapp, c.source,
               c.created_date, c.updated_date
        FROM clients c
        WHERE c.preferred_property_type IN ('דירה', 'בית פרטי', 'בית');
    ELSIF category_param = 'משרדים' THEN
        RETURN QUERY
        SELECT c.id, c.contact_id, c.request_type, c.preferred_property_type,
               c.budget, c.preferred_rooms, c.city, c.neighborhood, c.street,
               c.rooms_min, c.rooms_max, c.client_type, c.seriousness,
               c.additional_notes, c.opt_out_whatsapp, c.source,
               c.created_date, c.updated_date
        FROM clients c
        WHERE c.preferred_property_type IN ('משרד', 'מסחרי');
    ELSE
        RETURN QUERY
        SELECT c.id, c.contact_id, c.request_type, c.preferred_property_type,
               c.budget, c.preferred_rooms, c.city, c.neighborhood, c.street,
               c.rooms_min, c.rooms_max, c.client_type, c.seriousness,
               c.additional_notes, c.opt_out_whatsapp, c.source,
               c.created_date, c.updated_date
        FROM clients c;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to filter matches by category
-- This checks both property category and client property type, plus transaction type matching
CREATE OR REPLACE FUNCTION filter_matches_by_category(category_param TEXT DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    property_id INTEGER,
    client_id INTEGER,
    match_score INTEGER,
    status VARCHAR,
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE,
    updated_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    IF category_param = 'מגורים' THEN
        RETURN QUERY
        SELECT m.id, m.property_id, m.client_id, m.match_score, m.status,
               m.notes, m.created_date, m.updated_date
        FROM matches m
        INNER JOIN properties p ON m.property_id = p.id
        INNER JOIN clients c ON m.client_id = c.id
        WHERE p.category = 'מגורים'
          AND c.preferred_property_type IN ('דירה', 'בית פרטי', 'בית')
          AND (
            -- Transaction type matching: מכירה matches קנייה, השכרה matches שכירות
            p.listing_type = c.request_type
            OR (p.listing_type = 'מכירה' AND c.request_type = 'קנייה')
            OR (p.listing_type = 'השכרה' AND c.request_type = 'שכירות')
          );
    ELSIF category_param = 'משרדים' THEN
        RETURN QUERY
        SELECT m.id, m.property_id, m.client_id, m.match_score, m.status,
               m.notes, m.created_date, m.updated_date
        FROM matches m
        INNER JOIN properties p ON m.property_id = p.id
        INNER JOIN clients c ON m.client_id = c.id
        WHERE p.category = 'משרדים'
          AND c.preferred_property_type IN ('משרד', 'מסחרי')
          AND (
            -- Transaction type matching
            p.listing_type = c.request_type
            OR (p.listing_type = 'מכירה' AND c.request_type = 'קנייה')
            OR (p.listing_type = 'השכרה' AND c.request_type = 'שכירות')
          );
    ELSE
        RETURN QUERY
        SELECT m.id, m.property_id, m.client_id, m.match_score, m.status,
               m.notes, m.created_date, m.updated_date
        FROM matches m;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions to authenticated role
GRANT EXECUTE ON FUNCTION filter_properties_by_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION filter_clients_by_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION filter_matches_by_category(TEXT) TO authenticated;

