-- Migration 025: Add Row-Level Security (RLS) policies and roles for PostgREST
-- This enables PostgREST to work with JWT authentication and role-based access control

-- Create roles for PostgREST
DO $$
BEGIN
    -- Create anonymous role (for unauthenticated requests - minimal access)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    
    -- Create authenticated role (for authenticated requests)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
    
    -- Grant usage on schema
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    
    -- Grant anon can only read (very limited)
    -- Grant authenticated can read/write based on RLS policies
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    
    -- Minimal read access for anon (only for health checks, etc.)
    GRANT SELECT ON users TO anon;  -- For login endpoint
    
    -- Set default privileges for future tables
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
END
$$;

-- Enable Row-Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE do_not_call_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_documents ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role from JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('request.jwt.claims', true)::json->>'role';
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policies for users table
CREATE POLICY "Users can read all users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can insert users"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete users"
    ON users FOR DELETE
    TO authenticated
    USING (is_admin());

-- RLS Policies for contacts table
CREATE POLICY "Authenticated users can read all contacts"
    ON contacts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert contacts"
    ON contacts FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
    ON contacts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contacts"
    ON contacts FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for properties table
CREATE POLICY "Authenticated users can read all properties"
    ON properties FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert properties"
    ON properties FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update properties"
    ON properties FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete properties"
    ON properties FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for clients table
CREATE POLICY "Authenticated users can read all clients"
    ON clients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert clients"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
    ON clients FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clients"
    ON clients FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for matches table
CREATE POLICY "Authenticated users can read all matches"
    ON matches FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert matches"
    ON matches FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update matches"
    ON matches FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete matches"
    ON matches FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for meetings table
CREATE POLICY "Authenticated users can read all meetings"
    ON meetings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert meetings"
    ON meetings FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update meetings"
    ON meetings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete meetings"
    ON meetings FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for tasks table
CREATE POLICY "Authenticated users can read all tasks"
    ON tasks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert tasks"
    ON tasks FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
    ON tasks FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tasks"
    ON tasks FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for service_calls table
CREATE POLICY "Authenticated users can read all service_calls"
    ON service_calls FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert service_calls"
    ON service_calls FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update service_calls"
    ON service_calls FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete service_calls"
    ON service_calls FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for suppliers table
CREATE POLICY "Authenticated users can read all suppliers"
    ON suppliers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert suppliers"
    ON suppliers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
    ON suppliers FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete suppliers"
    ON suppliers FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for projects table
CREATE POLICY "Authenticated users can read all projects"
    ON projects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert projects"
    ON projects FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
    ON projects FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
    ON projects FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for marketing_leads table
CREATE POLICY "Authenticated users can read all marketing_leads"
    ON marketing_leads FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert marketing_leads"
    ON marketing_leads FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update marketing_leads"
    ON marketing_leads FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete marketing_leads"
    ON marketing_leads FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for marketing_logs table
CREATE POLICY "Authenticated users can read all marketing_logs"
    ON marketing_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert marketing_logs"
    ON marketing_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update marketing_logs"
    ON marketing_logs FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete marketing_logs"
    ON marketing_logs FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for property_owners table
CREATE POLICY "Authenticated users can read all property_owners"
    ON property_owners FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert property_owners"
    ON property_owners FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update property_owners"
    ON property_owners FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete property_owners"
    ON property_owners FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for tenants table
CREATE POLICY "Authenticated users can read all tenants"
    ON tenants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert tenants"
    ON tenants FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update tenants"
    ON tenants FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tenants"
    ON tenants FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for project_leads table
CREATE POLICY "Authenticated users can read all project_leads"
    ON project_leads FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert project_leads"
    ON project_leads FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update project_leads"
    ON project_leads FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete project_leads"
    ON project_leads FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for work_orders table
CREATE POLICY "Authenticated users can read all work_orders"
    ON work_orders FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert work_orders"
    ON work_orders FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update work_orders"
    ON work_orders FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete work_orders"
    ON work_orders FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for do_not_call_list table
CREATE POLICY "Authenticated users can read all do_not_call_list"
    ON do_not_call_list FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert do_not_call_list"
    ON do_not_call_list FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update do_not_call_list"
    ON do_not_call_list FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete do_not_call_list"
    ON do_not_call_list FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for campaigns table
CREATE POLICY "Authenticated users can read all campaigns"
    ON campaigns FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
    ON campaigns FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
    ON campaigns FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaigns"
    ON campaigns FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for campaign_metrics table
CREATE POLICY "Authenticated users can read all campaign_metrics"
    ON campaign_metrics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert campaign_metrics"
    ON campaign_metrics FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaign_metrics"
    ON campaign_metrics FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaign_metrics"
    ON campaign_metrics FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for accounting_documents table
CREATE POLICY "Authenticated users can read all accounting_documents"
    ON accounting_documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert accounting_documents"
    ON accounting_documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounting_documents"
    ON accounting_documents FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete accounting_documents"
    ON accounting_documents FOR DELETE
    TO authenticated
    USING (true);

