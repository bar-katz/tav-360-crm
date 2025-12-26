-- Update service_calls table to match frontend requirements
-- Add missing columns and update existing ones

-- Drop old constraints if they exist
ALTER TABLE service_calls DROP CONSTRAINT IF EXISTS service_calls_status_check;

-- Add new columns (using IF NOT EXISTS which PostgreSQL supports)
ALTER TABLE service_calls ADD COLUMN IF NOT EXISTS call_number VARCHAR(50);
ALTER TABLE service_calls ADD COLUMN IF NOT EXISTS handler VARCHAR(255);
ALTER TABLE service_calls ADD COLUMN IF NOT EXISTS urgency VARCHAR(50) DEFAULT 'בינונית';
ALTER TABLE service_calls ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10, 2);
ALTER TABLE service_calls ADD COLUMN IF NOT EXISTS work_date DATE;
ALTER TABLE service_calls ADD COLUMN IF NOT EXISTS notes TEXT;

-- Make handler required (set default for existing rows first)
UPDATE service_calls SET handler = 'לא צוין' WHERE handler IS NULL;
ALTER TABLE service_calls ALTER COLUMN handler SET NOT NULL;

-- Make call_number required (generate for existing rows)
UPDATE service_calls SET call_number = 'SC' || LPAD(id::text, 6, '0') WHERE call_number IS NULL;
ALTER TABLE service_calls ALTER COLUMN call_number SET NOT NULL;

-- Add unique constraint on call_number (drop first if exists)
ALTER TABLE service_calls DROP CONSTRAINT IF EXISTS service_calls_call_number_key;
ALTER TABLE service_calls ADD CONSTRAINT service_calls_call_number_key UNIQUE (call_number);

-- Make description required (set default for existing rows first)
UPDATE service_calls SET description = 'לא צוין' WHERE description IS NULL;
ALTER TABLE service_calls ALTER COLUMN description SET NOT NULL;

-- Update status column to accept Hebrew values
ALTER TABLE service_calls ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE service_calls ALTER COLUMN status SET DEFAULT 'קריאה חדשה';

-- Drop title column if it exists (replaced by call_number)
ALTER TABLE service_calls DROP COLUMN IF EXISTS title;

-- Create index on call_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_calls_call_number ON service_calls(call_number);

