-- Development seed data
-- Note: Passwords are hashed with bcrypt (password: test123)

-- Insert test users
INSERT INTO users (email, password_hash, full_name, app_role) VALUES
('admin@test.com', '$2b$12$C2UtbkToqpIviKgZSacNteS2QhlvXq7tD65ICifvhs6qpTNvnnEVG', 'Admin User', 'admin'),
('agent@test.com', '$2b$12$C2UtbkToqpIviKgZSacNteS2QhlvXq7tD65ICifvhs6qpTNvnnEVG', 'Agent User', 'agent'),
('manager@test.com', '$2b$12$C2UtbkToqpIviKgZSacNteS2QhlvXq7tD65ICifvhs6qpTNvnnEVG', 'Manager User', 'office_manager')
ON CONFLICT (email) DO NOTHING;

-- Insert sample contacts
INSERT INTO contacts (full_name, phone, email) VALUES
('יוסי כהן', '050-1234567', 'yossi@example.com'),
('שרה לוי', '052-9876543', 'sara@example.com'),
('דוד ישראלי', '054-5555555', 'david@example.com')
ON CONFLICT DO NOTHING;

