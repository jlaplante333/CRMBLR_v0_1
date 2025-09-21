import { Injectable } from '@nestjs/common';
import { db } from '@crmblr/db';
import { llmService, sqlValidator } from '@crmblr/llm';
import { GenerateReportRequest, RunReportRequest } from '@crmblr/types';

@Injectable()
export class ReportsService {
  async generateSQL(request: GenerateReportRequest, tenantId: string) {
    // Get database schema for the tenant
    const schema = await this.getDatabaseSchema();
    
    const response = await llmService.generateSQL({
      prompt: request.prompt,
      schema,
      module: request.module,
    });

    // Validate the generated SQL
    const validation = sqlValidator.validateForReports(response.sql, tenantId);
    if (!validation.isValid) {
      throw new Error(`Invalid SQL: ${validation.errors.join(', ')}`);
    }

    return response;
  }

  async runReport(request: RunReportRequest, tenantId: string, userId: string) {
    // Validate SQL again for safety
    const validation = sqlValidator.validateForReports(request.sql, tenantId);
    if (!validation.isValid) {
      throw new Error(`Invalid SQL: ${validation.errors.join(', ')}`);
    }

    // Set tenant context for RLS
    await db.setTenantContext(tenantId, userId);

    try {
      // Execute the SQL query with read-only role
      const result = await db.client.$queryRawUnsafe(request.sql);
      
      return {
        data: result,
        rowCount: Array.isArray(result) ? result.length : 0,
        limit: request.limit,
      };
    } finally {
      await db.clearTenantContext();
    }
  }

  async saveReport(name: string, sql: string, description: string, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);

    const report = await db.client.report.create({
      data: {
        name,
        sql,
        description,
        tenantId,
        createdBy: userId,
      },
    });

    await db.clearTenantContext();
    
    return report;
  }

  async getSavedReports(tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);

    const reports = await db.client.report.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    await db.clearTenantContext();
    
    return reports;
  }

  private async getDatabaseSchema(): Promise<string> {
    // This would typically fetch the actual database schema
    // For now, return a mock schema
    return `
-- CRM Database Schema
-- Tables with tenant isolation (tenant_id column)

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(255),
  address TEXT,
  score INTEGER DEFAULT 0,
  lifetime_value DECIMAL(12,2) DEFAULT 0,
  stage VARCHAR(50) DEFAULT 'identified',
  custom JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  organization_id UUID REFERENCES organizations(id),
  campaign_id UUID REFERENCES campaigns(id),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  date DATE NOT NULL,
  thank_you_status VARCHAR(20) DEFAULT 'none',
  custom JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  website VARCHAR(255),
  location VARCHAR(255),
  custom JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  custom JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Grant applications table
CREATE TABLE grant_apps (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  amount_requested DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  deadline DATE NOT NULL,
  notes TEXT,
  custom JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pipeline events table
CREATE TABLE pipeline_events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  stage VARCHAR(50) NOT NULL,
  note TEXT,
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Staff table
CREATE TABLE staff (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(255),
  team VARCHAR(50) NOT NULL,
  custom JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;
  }
}
