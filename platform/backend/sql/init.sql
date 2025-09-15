-- CRMBLR Platform Database Initialization
-- This script creates the basic platform tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Platform Users (administrators)
CREATE TABLE IF NOT EXISTS platform_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Clients (organizations using the platform)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    organization_type VARCHAR(100),
    template_id VARCHAR(100),
    plan VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    max_users INTEGER,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    setup_fee_paid BOOLEAN DEFAULT FALSE,
    configuration JSONB,
    branding JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP,
    primary_contact_email VARCHAR(255),
    primary_contact_name VARCHAR(255)
);

-- Client Users (users within client organizations)
CREATE TABLE IF NOT EXISTS client_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    UNIQUE(client_id, email)
);

-- Client Projects (CRM generation tracking)
CREATE TABLE IF NOT EXISTS client_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    estimated_completion TIMESTAMP,
    actual_completion TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_subdomain ON clients(subdomain);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_users_email ON client_users(email);
CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);

-- Insert default platform admin user (password: admin123)
INSERT INTO platform_users (email, hashed_password, full_name, is_superuser)
VALUES (
    'admin@crmblr.com',
    '$2b$12$LrHgPkFl8QWO3v4w5t2oJ.1vR5Gg8wc.3P4Kl9M2nB5Qr7Ss8Tt9U',
    'Platform Administrator',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Sample client for testing (SOMA West CBD)
INSERT INTO clients (
    name,
    subdomain,
    organization_type,
    plan,
    status,
    setup_fee_paid,
    primary_contact_email,
    primary_contact_name,
    configuration
) VALUES (
    'SOMA West Community Benefit District',
    'soma-west',
    'cbd',
    'medium',
    'active',
    TRUE,
    'admin@soma-cbd.org',
    'CBD Administrator',
    '{"modules": ["contacts", "services", "events"], "branding": {"primary_color": "#2563EB"}}'
) ON CONFLICT (subdomain) DO NOTHING;

-- Add sample client user for SOMA West
INSERT INTO client_users (
    client_id,
    email,
    hashed_password,
    full_name,
    first_name,
    last_name,
    is_admin
) SELECT
    c.id,
    'admin@soma-cbd.org',
    '$2b$12$LrHgPkFl8QWO3v4w5t2oJ.1vR5Gg8wc.3P4Kl9M2nB5Qr7Ss8Tt9U',
    'CBD Administrator',
    'CBD',
    'Administrator',
    TRUE
FROM clients c
WHERE c.subdomain = 'soma-west'
ON CONFLICT (client_id, email) DO NOTHING;