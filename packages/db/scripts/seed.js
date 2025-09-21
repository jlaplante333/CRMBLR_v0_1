"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const seeder_1 = require("../src/seeder");
const migrations_1 = require("../src/migrations");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        console.log('🚀 Starting database seeding...');
        // Apply RLS policies
        await (0, migrations_1.runRLSPolicies)();
        // Create read-only role
        await (0, migrations_1.createReadOnlyRole)();
        // Seed demo tenants
        const seeder = new seeder_1.DemoTenantSeeder(prisma);
        await seeder.seedDemoTenants();
        console.log('✅ Database seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
