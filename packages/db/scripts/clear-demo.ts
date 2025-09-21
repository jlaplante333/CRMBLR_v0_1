import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 Clearing demo tenants and data...');
    
    // Delete in reverse order of dependencies
    await prisma.auditLog.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.report.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.fileAsset.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.staff.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.pipelineEvent.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.grantApp.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.donation.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.campaign.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.organization.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    await prisma.contact.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    // Delete user-tenant relationships
    await prisma.userTenant.deleteMany({
      where: {
        tenant: {
          slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
        }
      }
    });
    
    // Delete demo users
    await prisma.user.deleteMany({
      where: {
        cognitoId: {
          startsWith: 'demo-'
        }
      }
    });
    
    // Delete demo tenants
    await prisma.tenant.deleteMany({
      where: {
        slug: { in: ['makelit', 'oneinsix', 'fallenfruit', 'homeboy'] }
      }
    });
    
    console.log('✅ Demo data cleared successfully!');
  } catch (error) {
    console.error('❌ Clearing demo data failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
