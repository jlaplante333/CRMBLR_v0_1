import { PrismaClient } from '@prisma/client';
import { DemoTenantSeeder } from '../src/seeder';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Starting demo tenant seeding...');
    
    const seeder = new DemoTenantSeeder(prisma);
    await seeder.seedDemoTenants();
    
    console.log('✅ Demo tenants seeded successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('MAKE Literary Productions (makelit):');
    console.log('  Owner: owner@makelit.org / Demo!Make');
    console.log('  Admin: admin@makelit.org / Demo!Make');
    console.log('  Editor: editor@makelit.org / Demo!Make');
    console.log('  Viewer: viewer@makelit.org / Demo!Make');
    console.log('  URL: https://makelit.crmblr.com');
    console.log('\n1in6 (oneinsix):');
    console.log('  Owner: owner@oneinsix.org / Demo!One6');
    console.log('  Admin: admin@oneinsix.org / Demo!One6');
    console.log('  Editor: editor@oneinsix.org / Demo!One6');
    console.log('  Viewer: viewer@oneinsix.org / Demo!One6');
    console.log('  URL: https://oneinsix.crmblr.com');
    console.log('\nFallen Fruit (fallenfruit):');
    console.log('  Owner: owner@fallenfruit.org / Demo!Fruit');
    console.log('  Admin: admin@fallenfruit.org / Demo!Fruit');
    console.log('  Editor: editor@fallenfruit.org / Demo!Fruit');
    console.log('  Viewer: viewer@fallenfruit.org / Demo!Fruit');
    console.log('  URL: https://fallenfruit.crmblr.com');
    console.log('\nHomeboy Industries (homeboy):');
    console.log('  Owner: owner@homeboy.org / Demo!Homeboy');
    console.log('  Admin: admin@homeboy.org / Demo!Homeboy');
    console.log('  Editor: editor@homeboy.org / Demo!Homeboy');
    console.log('  Viewer: viewer@homeboy.org / Demo!Homeboy');
    console.log('  URL: https://homeboy.crmblr.com');
  } catch (error) {
    console.error('❌ Demo seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
