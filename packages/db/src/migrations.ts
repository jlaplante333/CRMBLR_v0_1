import { db } from './client';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function runRLSPolicies() {
  try {
    const sqlPath = join(__dirname, '../prisma/rls_policies.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.client.$executeRawUnsafe(statement);
      }
    }
    
    console.log('✅ RLS policies applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply RLS policies:', error);
    throw error;
  }
}

export async function createReadOnlyRole() {
  try {
    // Create read-only role for reports
    await db.client.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'reports_readonly') THEN
          CREATE ROLE reports_readonly;
        END IF;
      END $$;
    `;

    await db.client.$executeRaw`
      GRANT USAGE ON SCHEMA public TO reports_readonly;
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO reports_readonly;
      GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO reports_readonly;
    `;

    console.log('✅ Read-only role created successfully');
  } catch (error) {
    console.error('❌ Failed to create read-only role:', error);
    throw error;
  }
}
