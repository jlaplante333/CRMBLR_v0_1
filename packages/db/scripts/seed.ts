import { PrismaClient } from '@prisma/client';
import { DemoTenantSeeder } from '../src/seeder';
import { runRLSPolicies, createReadOnlyRole } from '../src/migrations';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Starting database seeding...');
    
    // Apply RLS policies
    await runRLSPolicies();
    
    // Create read-only role
    await createReadOnlyRole();
    
    // Seed demo tenants
    const seeder = new DemoTenantSeeder(prisma);
    await seeder.seedDemoTenants();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
