"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const seeder_1 = require("../src/seeder");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        console.log('🌱 Starting demo tenant seeding...');
        const seeder = new seeder_1.DemoTenantSeeder(prisma);
        await seeder.seedDemoTenants();
        console.log('✅ Demo tenants seeded successfully!');
        console.log('\n📋 Demo Login Credentials:');
        console.log('MAKE Literary Productions:');
        console.log('  Owner: sofia@makemag.org / Demo!Make123');
        console.log('  Admin: john@makemag.org / Demo!Make123');
        console.log('  URL: https://makelit.crmblr.com');
        console.log('\n1in6:');
        console.log('  Owner: ops@1in6.org / Demo!One6');
        console.log('  Admin: dev@1in6.org / Demo!One6');
        console.log('  URL: https://oneinsix.crmblr.com');
        console.log('\nFallen Fruit:');
        console.log('  Owner: team@fallenfruit.org / Demo!Fruit');
        console.log('  Admin: grants@fallenfruit.org / Demo!Fruit');
        console.log('  URL: https://fallenfruit.crmblr.com');
        console.log('\nHomeboy Industries:');
        console.log('  Owner: it@homeboyindustries.org / Demo!Homeboy');
        console.log('  Admin: fund@homeboyindustries.org / Demo!Homeboy');
        console.log('  URL: https://homeboy.crmblr.com');
    }
    catch (error) {
        console.error('❌ Demo seeding failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
