-- Migration 027: Create PostgreSQL functions for match generation
-- These functions encapsulate the business logic for generating matches
-- PostgREST will expose these as RPC endpoints

-- Function to generate matches based on business rules
-- Returns the matches that would be created
CREATE OR REPLACE FUNCTION generate_matches(
    category_param TEXT DEFAULT NULL,
    property_ids INTEGER[] DEFAULT NULL,
    client_ids INTEGER[] DEFAULT NULL
)
RETURNS TABLE (
    property_id INTEGER,
    client_id INTEGER,
    match_score INTEGER,
    match_reason TEXT
) AS $$
DECLARE
    property_rec RECORD;
    client_rec RECORD;
    score INTEGER;
    reason TEXT;
BEGIN
    -- Loop through properties
    FOR property_rec IN
        SELECT p.*
        FROM properties p
        WHERE (category_param IS NULL OR p.category = category_param)
          AND (property_ids IS NULL OR p.id = ANY(property_ids))
    LOOP
        -- Loop through clients
        FOR client_rec IN
            SELECT c.*
            FROM clients c
            WHERE (category_param IS NULL OR 
                   (category_param = 'מגורים' AND c.preferred_property_type IN ('דירה', 'בית פרטי', 'בית')) OR
                   (category_param = 'משרדים' AND c.preferred_property_type IN ('משרד', 'מסחרי')))
              AND (client_ids IS NULL OR c.id = ANY(client_ids))
              -- Check transaction type match
              AND (
                property_rec.listing_type = c.request_type
                OR (property_rec.listing_type = 'מכירה' AND c.request_type = 'קנייה')
                OR (property_rec.listing_type = 'השכרה' AND c.request_type = 'שכירות')
              )
              -- Check if match doesn't already exist
              AND NOT EXISTS (
                SELECT 1 FROM matches m
                WHERE m.property_id = property_rec.id
                  AND m.client_id = client_rec.id
              )
        LOOP
            score := 0;
            reason := '';
            
            -- Area match
            IF property_rec.area = client_rec.neighborhood OR property_rec.area = client_rec.desired_area THEN
                score := score + 20;
                reason := reason || 'Area match; ';
            END IF;
            
            -- Rooms match
            IF property_rec.rooms IS NOT NULL AND client_rec.preferred_rooms IS NOT NULL THEN
                IF property_rec.rooms::TEXT = client_rec.preferred_rooms THEN
                    score := score + 20;
                    reason := reason || 'Rooms match; ';
                END IF;
            ELSIF property_rec.rooms IS NOT NULL AND client_rec.rooms_min IS NOT NULL AND client_rec.rooms_max IS NOT NULL THEN
                IF property_rec.rooms BETWEEN client_rec.rooms_min AND client_rec.rooms_max THEN
                    score := score + 20;
                    reason := reason || 'Rooms in range; ';
                END IF;
            END IF;
            
            -- Property type match
            IF property_rec.property_type = client_rec.preferred_property_type THEN
                score := score + 20;
                reason := reason || 'Type match; ';
            END IF;
            
            -- Transaction type match (already filtered above, but add to score)
            score := score + 20;
            reason := reason || 'Transaction match; ';
            
            -- Budget match (property price within 110% of client budget)
            IF property_rec.price IS NOT NULL AND client_rec.budget IS NOT NULL THEN
                IF property_rec.price <= (client_rec.budget * 1.10) THEN
                    score := score + 20;
                    reason := reason || 'Budget match; ';
                END IF;
            END IF;
            
            -- Only return matches with score >= 60 (at least 3 criteria match)
            IF score >= 60 THEN
                RETURN QUERY SELECT property_rec.id, client_rec.id, score, reason;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to create matches from generated matches
-- This actually inserts the matches into the database
-- Returns JSON with created count and match details
CREATE OR REPLACE FUNCTION create_matches_from_generation(
    category_param TEXT DEFAULT NULL,
    property_ids INTEGER[] DEFAULT NULL,
    client_ids INTEGER[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    match_rec RECORD;
    created_count INTEGER := 0;
    match_ids INTEGER[] := ARRAY[]::INTEGER[];
    new_match_id INTEGER;
BEGIN
    -- Generate matches
    FOR match_rec IN
        SELECT * FROM generate_matches(category_param, property_ids, client_ids)
    LOOP
        -- Insert match
        INSERT INTO matches (property_id, client_id, match_score, status)
        VALUES (match_rec.property_id, match_rec.client_id, match_rec.match_score, 'הותאם')
        ON CONFLICT DO NOTHING
        RETURNING id INTO new_match_id;
        
        IF new_match_id IS NOT NULL THEN
            created_count := created_count + 1;
            match_ids := array_append(match_ids, new_match_id);
        END IF;
    END LOOP;
    
    -- Return JSON with count and IDs
    RETURN json_build_object(
        'created_count', created_count,
        'match_ids', match_ids
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated role
GRANT EXECUTE ON FUNCTION generate_matches(TEXT, INTEGER[], INTEGER[]) TO authenticated;
GRANT EXECUTE ON FUNCTION create_matches_from_generation(TEXT, INTEGER[], INTEGER[]) TO authenticated;

