-- Migration: Create Member Management Tables
-- Version: 001
-- Date: 2026-02-13
-- Author: webwakaagent4

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  phone VARCHAR(20) NOT NULL CHECK (phone ~ '^\+234[0-9]{10}$'),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(20) DEFAULT 'Nigeria',
  status VARCHAR(20) NOT NULL DEFAULT 'visitor' CHECK (status IN ('visitor', 'member', 'inactive', 'transferred', 'deceased')),
  membership_date DATE,
  membership_type VARCHAR(50),
  tags TEXT[],
  photo_url TEXT,
  metadata JSONB,
  deleted_at TIMESTAMP,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  CONSTRAINT unique_tenant_phone UNIQUE (tenant_id, phone)
);

-- Create indexes for members table
CREATE INDEX idx_members_tenant_id ON members(tenant_id);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_deleted_at ON members(deleted_at);
CREATE INDEX idx_members_tenant_status ON members(tenant_id, status);
CREATE INDEX idx_members_tags ON members USING GIN(tags);

-- Create families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  family_name VARCHAR(200) NOT NULL,
  primary_contact_id UUID NOT NULL REFERENCES members(id),
  family_address TEXT,
  family_city VARCHAR(100),
  family_state VARCHAR(100),
  family_country VARCHAR(20) DEFAULT 'Nigeria',
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

-- Create indexes for families table
CREATE INDEX idx_families_tenant_id ON families(tenant_id);
CREATE INDEX idx_families_primary_contact_id ON families(primary_contact_id);
CREATE INDEX idx_families_deleted_at ON families(deleted_at);

-- Create family_relationships table
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('head', 'spouse', 'child', 'parent', 'sibling', 'other')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  CONSTRAINT unique_family_member UNIQUE (family_id, member_id)
);

-- Create indexes for family_relationships table
CREATE INDEX idx_family_relationships_tenant_id ON family_relationships(tenant_id);
CREATE INDEX idx_family_relationships_family_id ON family_relationships(family_id);
CREATE INDEX idx_family_relationships_member_id ON family_relationships(member_id);

-- Create member_notes table
CREATE TABLE member_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT NOT NULL,
  visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'leaders_only', 'public')),
  note_type VARCHAR(50) CHECK (note_type IN ('pastoral_care', 'follow_up', 'prayer_request', 'general')),
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL,
  updated_by UUID
);

-- Create indexes for member_notes table
CREATE INDEX idx_member_notes_tenant_id ON member_notes(tenant_id);
CREATE INDEX idx_member_notes_member_id ON member_notes(member_id);
CREATE INDEX idx_member_notes_deleted_at ON member_notes(deleted_at);
CREATE INDEX idx_member_notes_visibility ON member_notes(visibility);

-- Create member_audit_logs table
CREATE TABLE member_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  member_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for member_audit_logs table
CREATE INDEX idx_member_audit_logs_tenant_id ON member_audit_logs(tenant_id);
CREATE INDEX idx_member_audit_logs_member_id ON member_audit_logs(member_id);
CREATE INDEX idx_member_audit_logs_created_at ON member_audit_logs(created_at);
CREATE INDEX idx_member_audit_logs_action ON member_audit_logs(action);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at
BEFORE UPDATE ON families
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_notes_updated_at
BEFORE UPDATE ON member_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to increment version on update
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_members_version
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Enable Row Level Security (RLS) for tenant isolation
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for members table)
-- Note: In production, these policies should be configured based on your authentication system
CREATE POLICY tenant_isolation_policy ON members
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_policy ON families
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_policy ON family_relationships
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_policy ON member_notes
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_policy ON member_audit_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON members TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON families TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON family_relationships TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON member_notes TO app_user;
-- GRANT SELECT, INSERT ON member_audit_logs TO app_user;
