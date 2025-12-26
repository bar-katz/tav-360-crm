-- Add unique constraint to prevent duplicate matches
-- First, remove any existing duplicates (keep the one with the highest match_score, or oldest if scores are equal)
DELETE FROM matches m1
WHERE EXISTS (
    SELECT 1 FROM matches m2
    WHERE m2.property_id = m1.property_id
    AND m2.client_id = m1.client_id
    AND m2.id < m1.id
);

-- Add unique constraint
ALTER TABLE matches
ADD CONSTRAINT unique_property_client_match UNIQUE (property_id, client_id);

