-- WEEG (Permission System) - Initial Database Schema
-- Version: 1.0.0
-- Created: 2026-02-14

-- Create schema
CREATE SCHEMA IF NOT EXISTS weeg;

-- Create roles table
CREATE TABLE IF NOT EXISTS weeg.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_roles_tenant_id ON weeg.roles(tenant_id);

-- Create permissions table
CREATE TABLE IF NOT EXISTS weeg.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permissions_name ON weeg.permissions(name);

-- Create policies table (role-permission mappings)
CREATE TABLE IF NOT EXISTS weeg.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES weeg.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES weeg.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_policies_role_id ON weeg.policies(role_id);
CREATE INDEX idx_policies_permission_id ON weeg.policies(permission_id);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS weeg.user_roles (
    user_id VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES weeg.roles(id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id, tenant_id)
);

CREATE INDEX idx_user_roles_user_tenant ON weeg.user_roles(user_id, tenant_id);
CREATE INDEX idx_user_roles_role_id ON weeg.user_roles(role_id);

-- Create abac_rules table
CREATE TABLE IF NOT EXISTS weeg.abac_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    condition JSONB NOT NULL,
    permission_id UUID NOT NULL REFERENCES weeg.permissions(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_abac_rules_tenant_id ON weeg.abac_rules(tenant_id);
CREATE INDEX idx_abac_rules_permission_id ON weeg.abac_rules(permission_id);
CREATE INDEX idx_abac_rules_active ON weeg.abac_rules(active);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS weeg.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_id ON weeg.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_actor_id ON weeg.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON weeg.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_entity ON weeg.audit_logs(entity_type, entity_id);

-- Insert default permissions
INSERT INTO weeg.permissions (name, description) VALUES
    ('*', 'Global admin permission - grants all permissions'),
    ('user.create', 'Create users'),
    ('user.read', 'Read user information'),
    ('user.update', 'Update users'),
    ('user.delete', 'Delete users'),
    ('role.create', 'Create roles'),
    ('role.read', 'Read role information'),
    ('role.update', 'Update roles'),
    ('role.delete', 'Delete roles'),
    ('permission.read', 'Read permission information'),
    ('policy.create', 'Create policies'),
    ('policy.delete', 'Delete policies')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION weeg.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON weeg.roles
    FOR EACH ROW EXECUTE FUNCTION weeg.update_updated_at_column();

CREATE TRIGGER update_abac_rules_updated_at BEFORE UPDATE ON weeg.abac_rules
    FOR EACH ROW EXECUTE FUNCTION weeg.update_updated_at_column();

-- Comments
COMMENT ON SCHEMA weeg IS 'WEEG (Permission System) schema';
COMMENT ON TABLE weeg.roles IS 'Roles for RBAC';
COMMENT ON TABLE weeg.permissions IS 'Available permissions';
COMMENT ON TABLE weeg.policies IS 'Role-permission mappings';
COMMENT ON TABLE weeg.user_roles IS 'User-role assignments';
COMMENT ON TABLE weeg.abac_rules IS 'Attribute-based access control rules';
COMMENT ON TABLE weeg.audit_logs IS 'Audit trail for all permission changes';
