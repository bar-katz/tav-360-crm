-- Development seed data - Simplified with connected data
-- Note: Passwords are hashed with bcrypt (password: test123)
-- Run this after migrations: python backend/scripts/migrate.py

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (email, password_hash, full_name, app_role) VALUES
('admin@test.com', '$2b$12$C2UtbkToqpIviKgZSacNteS2QhlvXq7tD65ICifvhs6qpTNvnnEVG', 'מנהל מערכת', 'admin'),
('agent@test.com', '$2b$12$C2UtbkToqpIviKgZSacNteS2QhlvXq7tD65ICifvhs6qpTNvnnEVG', 'סוכן נדלן', 'agent')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CONTACTS
-- ============================================
INSERT INTO contacts (full_name, phone, email, address, notes) VALUES
('יוסי כהן', '050-1234567', 'yossi@example.com', 'רחוב הרצל 15, תל אביב', 'בעל נכס'),
('שרה לוי', '052-9876543', 'sara@example.com', 'רחוב דיזנגוף 20, תל אביב', 'מחפשת דירה להשכרה'),
('דוד ישראלי', '054-5555555', 'david@example.com', 'רחוב בן יהודה 30, תל אביב', 'משקיע נדלן'),
('בר כץ', '0545569919', 'barkatz13897@gmail.com', 'רחוב רוטשילד 10, תל אביב', 'סוכן נדלן - לידים לדיוור'),
('מיכל רוזן', '050-1111111', 'michal@example.com', 'רחוב רוטשילד 25, תל אביב', 'מחפשת דירה לקנייה'),
('אמיר כהן', '052-2222222', 'amir@example.com', 'רחוב אלנבי 40, תל אביב', 'מחפש דירה להשכרה'),
('רונית לוי', '053-3333333', 'ronit@example.com', 'רחוב בן גוריון 12, תל אביב', 'מחפשת בית לקנייה'),
('יואב שטרן', '054-4444444', 'yoav@example.com', 'רחוב ויצמן 8, תל אביב', 'מחפש דירה להשכרה'),
('תמר דוד', '050-5555555', 'tamar@example.com', 'רחוב רוטשילד 50, תל אביב', 'מחפשת דירה לקנייה'),
('אלון כהן', '052-6666666', 'alon@example.com', 'רחוב דיזנגוף 100, תל אביב', 'מחפש דירה להשכרה'),
('נועה לוי', '053-7777777', 'noa@example.com', 'רחוב בן יהודה 60, תל אביב', 'מחפשת בית לקנייה'),
('רונן ישראלי', '054-8888888', 'ronen@example.com', 'רחוב הרצל 80, תל אביב', 'מחפש דירה לקנייה'),
('ליאור רוזן', '050-9999999', 'lior@example.com', 'רחוב דיזנגוף 120, תל אביב', 'מחפש דירה להשכרה'),
('שירה כהן', '052-1010101', 'shira@example.com', 'רחוב בן יהודה 90, תל אביב', 'מחפשת דירה לקנייה')
ON CONFLICT DO NOTHING;

-- ============================================
-- PROPERTIES (connected to contacts)
-- ============================================
INSERT INTO properties (contact_id, category, property_type, city, area, street, building_number, apartment_number, price, rooms, floor, total_floors, parking, air_conditioning, storage, status, listing_type, handler, source) VALUES
(1, 'מגורים', 'דירה', 'תל אביב', 'צפון', 'רחוב הרצל', '15', '3', 2500000, 3, 2, 5, TRUE, TRUE, TRUE, 'פעיל', 'מכירה', 'יוסי כהן', 'אתר'),
(1, 'מגורים', 'דירה', 'תל אביב', 'מרכז', 'רחוב דיזנגוף', '20', '5', 12000, 2, 3, 6, FALSE, TRUE, FALSE, 'פעיל', 'השכרה', 'שרה לוי', 'פייסבוק'),
(3, 'מגורים', 'בית', 'תל אביב', 'צפון', 'רחוב בן יהודה', '30', NULL, 4500000, 5, 0, 2, TRUE, TRUE, TRUE, 'פעיל', 'מכירה', 'דוד ישראלי', 'המלצה')
ON CONFLICT DO NOTHING;

-- ============================================
-- CLIENTS (connected to contacts)
-- ============================================
INSERT INTO clients (contact_id, request_type, preferred_property_type, budget, preferred_rooms, city, neighborhood, street, rooms_min, rooms_max, client_type, seriousness, additional_notes, opt_out_whatsapp, source) VALUES
(2, 'השכרה', 'דירה', 12000, '2-3', 'תל אביב', 'מרכז', NULL, 2, 3, 'קונה', 'גבוה', 'מחפשת דירה קרוב לעבודה', FALSE, 'אתר'),
(3, 'מכירה', 'בית פרטי', 3500000, '4-5', 'תל אביב', 'צפון', NULL, 4, 5, 'קונה', 'בינוני', 'מחפשת בית למשפחה', FALSE, 'המלצה'),
(5, 'מכירה', 'דירה', 2600000, '3', 'תל אביב', 'צפון', NULL, 3, 3, 'קונה', 'גבוה', 'מחפשת דירה 3 חדרים בצפון תל אביב', FALSE, 'אתר'),
(6, 'השכרה', 'דירה', 13000, '2', 'תל אביב', 'מרכז', NULL, 2, 2, 'קונה', 'גבוה', 'מחפש דירה 2 חדרים במרכז תל אביב', FALSE, 'פייסבוק'),
(7, 'מכירה', 'בית פרטי', 4800000, '5', 'תל אביב', 'צפון', NULL, 5, 5, 'קונה', 'גבוה', 'מחפשת בית 5 חדרים בצפון תל אביב', FALSE, 'המלצה'),
(8, 'השכרה', 'דירה', 11000, '2-3', 'תל אביב', 'מרכז', NULL, 2, 3, 'קונה', 'בינוני', 'מחפש דירה להשכרה במרכז העיר', FALSE, 'אתר'),
-- Additional clients for automatic match generation
(9, 'מכירה', 'דירה', 2400000, '3', 'תל אביב', 'צפון', NULL, 3, 3, 'קונה', 'גבוה', 'מחפשת דירה 3 חדרים בצפון תל אביב', FALSE, 'אתר'),
(10, 'השכרה', 'דירה', 12500, '2', 'תל אביב', 'מרכז', NULL, 2, 2, 'קונה', 'גבוה', 'מחפש דירה 2 חדרים במרכז תל אביב', FALSE, 'פייסבוק'),
(11, 'מכירה', 'בית פרטי', 4200000, '5', 'תל אביב', 'צפון', NULL, 5, 5, 'קונה', 'גבוה', 'מחפשת בית 5 חדרים בצפון תל אביב', FALSE, 'המלצה'),
(12, 'מכירה', 'דירה', 2700000, '3', 'תל אביב', 'צפון', NULL, 3, 3, 'קונה', 'בינוני', 'מחפש דירה 3 חדרים בצפון תל אביב', FALSE, 'אתר'),
(13, 'השכרה', 'דירה', 11500, '2-3', 'תל אביב', 'מרכז', NULL, 2, 3, 'קונה', 'גבוה', 'מחפש דירה להשכרה במרכז העיר', FALSE, 'פייסבוק'),
(14, 'מכירה', 'בית פרטי', 4600000, '5', 'תל אביב', 'צפון', NULL, 5, 5, 'קונה', 'בינוני', 'מחפשת בית 5 חדרים בצפון תל אביב', FALSE, 'המלצה')
ON CONFLICT DO NOTHING;

-- ============================================
-- SUPPLIERS
-- ============================================
INSERT INTO suppliers (name, contact_person, phone, email, notes) VALUES
('אלקטריק כהן בע"מ', 'יוסי כהן', '050-1111111', 'yossi@electric.co.il', 'ספק חשמל מומלץ'),
('אינסטלציה דוד', 'דוד לוי', '052-2222222', 'david@plumbing.co.il', 'מתמחה בתיקונים דחופים')
ON CONFLICT DO NOTHING;

-- ============================================
-- MARKETING LEADS (connected to contacts)
-- ============================================
INSERT INTO marketing_leads (contact_id, phone_number, first_name, last_name, budget, neighborhood, street, rooms_min, rooms_max, client_type, seriousness, additional_notes, opt_out_whatsapp, source) VALUES
(2, '052-9876543', 'שרה', 'לוי', 12000, 'תל אביב', 'דיזנגוף', 2, 3, 'קונה', 'גבוה', 'מחפשת דירה להשכרה', FALSE, 'אתר'),
(3, '054-5555555', 'דוד', 'ישראלי', 3500000, 'תל אביב', 'בן יהודה', 4, 5, 'קונה', 'בינוני', 'מחפשת בית למשפחה', FALSE, 'המלצה'),
(4, '0545569919', 'בר', 'כץ', NULL, 'תל אביב', 'רוטשילד', NULL, NULL, 'סוכן', 'גבוה', 'לידים לדיוור', FALSE, 'פנימי')
ON CONFLICT DO NOTHING;

-- ============================================
-- WORK ORDERS (connected to properties, contacts, suppliers)
-- ============================================
INSERT INTO work_orders (title, description, status, property_id, contact_id, supplier_id, cost) VALUES
('תיקון חשמל בחדר שינה', 'תיקון תאורה בחדר שינה', 'open', 1, 1, 1, 500),
('תיקון נזילה במטבח', 'נזילת מים מתחת לכיור', 'in_progress', 2, 1, 2, 800)
ON CONFLICT DO NOTHING;

-- ============================================
-- TENANTS (connected to contacts and properties)
-- ============================================
INSERT INTO tenants (contact_id, property_id, lease_start_date, lease_end_date, monthly_rent, deposit, notes, source, status, handler, city) VALUES
(2, 2, '2025-01-01', '2025-12-31', 12000, 24000, 'דיירים קבועים', 'פייסבוק', 'נחתם הסכם שכירות', 'סוכן נדלן', 'תל אביב')
ON CONFLICT DO NOTHING;

-- ============================================
-- MATCHES (Property-Client Matches)
-- ============================================
INSERT INTO matches (property_id, client_id, match_score, status, notes) VALUES
(2, 1, 85, 'active', 'התאמה מצוינת - דירה 2 חדרים במרכז תל אביב'),
(3, 2, 75, 'active', 'התאמה טובה - בית 5 חדרים בתל אביב')
ON CONFLICT DO NOTHING;

-- ============================================
-- MARKETING LOGS (connected to leads and users)
-- ============================================
INSERT INTO marketing_logs (lead_id, phone_number, message_sent, status, sent_by) 
SELECT 
    ml.id,
    ml.phone_number,
    'שלום ' || ml.first_name || ', מצאנו עבורך נכסים מעניינים!',
    'sent',
    u.id
FROM marketing_leads ml
CROSS JOIN users u
WHERE u.email = 'agent@test.com'
LIMIT 2
ON CONFLICT DO NOTHING;

-- ============================================
-- PROPERTY OWNERS (connected to properties and contacts)
-- ============================================
INSERT INTO property_owners (property_id, contact_id, ownership_percentage, notes) VALUES
(1, 1, 100, 'בעלים יחיד'),
(2, 1, 100, 'בעלים יחיד'),
(3, 3, 100, 'בעלים יחיד')
ON CONFLICT DO NOTHING;

-- ============================================
-- TASKS (connected to contacts)
-- ============================================
INSERT INTO tasks (contact_id, title, description, status, priority, due_date) VALUES
(1, 'פגישה עם יוסי כהן', 'פגישת ייעוץ לגבי מכירת הנכס', 'pending', 'high', '2025-12-25'),
(2, 'שיחה עם שרה לוי', 'לבדוק התעניינות בדירה', 'in_progress', 'medium', '2025-12-22')
ON CONFLICT DO NOTHING;

-- ============================================
-- MEETINGS (connected to contacts and properties)
-- ============================================
INSERT INTO meetings (title, start_date, end_date, location, description, contact_id, property_id) VALUES
('פגישת ייעוץ עם יוסי כהן', '2025-12-25 10:00:00', '2025-12-25 11:00:00', 'משרד', 'פגישת ייעוץ לגבי מכירת הנכס', 1, 1),
('הצגת נכס לשרה לוי', '2025-12-22 14:00:00', '2025-12-22 15:00:00', 'רחוב דיזנגוף 20', 'הצגת דירה להשכרה', 2, 2)
ON CONFLICT DO NOTHING;

-- ============================================
-- PROJECTS
-- ============================================
INSERT INTO projects (name, description, location, developer, total_units, price_range_min, price_range_max, status) VALUES
('פרויקט רוטשילד פארק', 'פרויקט מגורים יוקרתי במרכז תל אביב', 'תל אביב', 'דניה סיבוס', 120, 3500000, 8000000, 'פתוח לדיירים'),
('פרויקט גן העיר', 'פרויקט מגורים ברמת גן', 'רמת גן', 'אפריקה ישראל', 80, 2800000, 5500000, 'פתוח לדיירים')
ON CONFLICT DO NOTHING;

-- ============================================
-- PROJECT LEADS (connected to projects and contacts)
-- ============================================
INSERT INTO project_leads (contact_id, project_id, interest_level, budget, preferred_units, notes) VALUES
(3, 1, 'גבוה', 4500000, '4-5 חדרים', 'מתעניין בדירת גג בפרויקט רוטשילד'),
(5, 1, 'בינוני', 3800000, '3-4 חדרים', 'מחפשת דירה עם מרפסת'),
(7, 1, 'גבוה', 5500000, '5 חדרים', 'מתעניינת בדירת פנטהאוז'),
(9, 2, 'גבוה', 3200000, '3-4 חדרים', 'מחפשת דירה בפרויקט גן העיר'),
(11, 2, 'בינוני', 4000000, '4-5 חדרים', 'מתעניינת בדירה גדולה'),
(12, 2, 'גבוה', 2900000, '3 חדרים', 'מחפש דירה קטנה להשקעה')
ON CONFLICT DO NOTHING;

-- ============================================
-- SUMMARY
-- ============================================
-- Seed data includes:
-- - 2 users
-- - 14 contacts
-- - 3 properties (connected to contacts)
-- - 12 clients (connected to contacts)
-- - 2 suppliers
-- - 3 marketing leads (connected to contacts)
-- - 2 work orders (connected to properties/contacts/suppliers)
-- - 1 tenant (connected to contact and property)
-- - 2 matches (property-client matches)
-- - 2 marketing logs (connected to leads and users)
-- - 3 property owners (connected to properties and contacts)
-- - 2 tasks (connected to contacts)
-- - 2 meetings (connected to contacts and properties)
-- - 2 projects
-- - 6 project leads (connected to projects and contacts)
