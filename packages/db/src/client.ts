import { PrismaClient } from '@prisma/client';
import { TenantIdSchema, UuidSchema } from '@crmblr/types';

export class DatabaseClient {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async connect() {
    await this.prisma.$connect();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  async setTenantContext(tenantId: string, userId: string) {
    const tenantUuid = TenantIdSchema.parse(tenantId);
    const userUuid = UuidSchema.parse(userId);
    
    await this.prisma.$executeRaw`SELECT set_tenant_context(${tenantUuid}, ${userUuid})`;
  }

  async clearTenantContext() {
    await this.prisma.$executeRaw`SELECT clear_tenant_context()`;
  }

  get client() {
    return this.prisma;
  }

  // Transaction helper
  async transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const db = new DatabaseClient();

// Export Prisma types
export type { Prisma } from '@prisma/client';
export { PrismaClient } from '@prisma/client';
