-- Row Level Security Policies for Multi-Tenant Isolation
-- This file contains all RLS policies to ensure tenant isolation

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
-- Users can only see their own records
CREATE POLICY user_isolation ON users
  USING (id = current_setting('app.user_id')::uuid);

-- UserTenants: users can see their own memberships
CREATE POLICY user_tenant_isolation ON user_tenants
  USING (user_id = current_setting('app.user_id')::uuid);

-- Tenants: users can only see tenants they belong to
CREATE POLICY tenant_access ON tenants
  USING (id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = current_setting('app.user_id')::uuid
  ));

-- All other tables: tenant isolation
CREATE POLICY tenant_isolation ON contacts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON organizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON donations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON campaigns
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON grant_apps
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON pipeline_events
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON staff
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON file_assets
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation ON audit_logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Create indexes for performance
CREATE INDEX idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_stage ON contacts(stage);

CREATE INDEX idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX idx_organizations_type ON organizations(type);

CREATE INDEX idx_donations_tenant_id ON donations(tenant_id);
CREATE INDEX idx_donations_date ON donations(date);
CREATE INDEX idx_donations_contact_id ON donations(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_donations_organization_id ON donations(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id) WHERE campaign_id IS NOT NULL;

CREATE INDEX idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

CREATE INDEX idx_grant_apps_tenant_id ON grant_apps(tenant_id);
CREATE INDEX idx_grant_apps_status ON grant_apps(status);
CREATE INDEX idx_grant_apps_deadline ON grant_apps(deadline);

CREATE INDEX idx_pipeline_events_tenant_id ON pipeline_events(tenant_id);
CREATE INDEX idx_pipeline_events_contact_id ON pipeline_events(contact_id);
CREATE INDEX idx_pipeline_events_occurred_at ON pipeline_events(occurred_at);

CREATE INDEX idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX idx_staff_team ON staff(team);

CREATE INDEX idx_file_assets_tenant_id ON file_assets(tenant_id);
CREATE INDEX idx_file_assets_source ON file_assets(source);

CREATE INDEX idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX idx_reports_created_by ON reports(created_by);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_contacts_custom ON contacts USING GIN (custom);
CREATE INDEX idx_organizations_custom ON organizations USING GIN (custom);
CREATE INDEX idx_donations_custom ON donations USING GIN (custom);
CREATE INDEX idx_campaigns_custom ON campaigns USING GIN (custom);
CREATE INDEX idx_grant_apps_custom ON grant_apps USING GIN (custom);
CREATE INDEX idx_staff_custom ON staff USING GIN (custom);
CREATE INDEX idx_file_assets_meta ON file_assets USING GIN (meta);
CREATE INDEX idx_audit_logs_meta ON audit_logs USING GIN (meta);

-- Create function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', tenant_uuid::text, true);
  PERFORM set_config('app.user_id', user_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clear tenant context
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', NULL, true);
  PERFORM set_config('app.user_id', NULL, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create read-only role for reports
CREATE ROLE reports_readonly;
GRANT USAGE ON SCHEMA public TO reports_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reports_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO reports_readonly;

-- Grant execute permission for context functions
GRANT EXECUTE ON FUNCTION set_tenant_context(UUID, UUID) TO reports_readonly;
GRANT EXECUTE ON FUNCTION clear_tenant_context() TO reports_readonly;
