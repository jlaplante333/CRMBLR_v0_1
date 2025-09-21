import { Injectable } from '@nestjs/common';
import { db } from '@crmblr/db';
import { CreateTenantRequest, UpdateTenantRequest } from '@crmblr/types';

@Injectable()
export class TenantsService {
  async create(createTenantDto: CreateTenantRequest, userId: string) {
    // Set user context for RLS
    await db.setTenantContext('00000000-0000-0000-0000-000000000000', userId);
    
    const tenant = await db.client.tenant.create({
      data: {
        name: createTenantDto.name,
        slug: createTenantDto.slug,
        branding: createTenantDto.branding || {},
        settings: {},
      },
    });

    // Create user-tenant relationship
    await db.client.userTenant.create({
      data: {
        userId,
        tenantId: tenant.id,
        role: 'owner',
      },
    });

    await db.clearTenantContext();
    
    return tenant;
  }

  async findAll(userId: string) {
    await db.setTenantContext('00000000-0000-0000-0000-000000000000', userId);
    
    const userTenants = await db.client.userTenant.findMany({
      where: { userId },
      include: {
        tenant: true,
      },
    });

    await db.clearTenantContext();
    
    return userTenants.map(ut => ({
      id: ut.tenant.id,
      name: ut.tenant.name,
      slug: ut.tenant.slug,
      role: ut.role,
      branding: ut.tenant.branding,
      settings: ut.tenant.settings,
    }));
  }

  async findOne(id: string, userId: string) {
    await db.setTenantContext(id, userId);
    
    const tenant = await db.client.tenant.findUnique({
      where: { id },
    });

    await db.clearTenantContext();
    
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantRequest, userId: string) {
    await db.setTenantContext(id, userId);
    
    const tenant = await db.client.tenant.update({
      where: { id },
      data: updateTenantDto,
    });

    await db.clearTenantContext();
    
    return tenant;
  }

  async remove(id: string, userId: string) {
    await db.setTenantContext(id, userId);
    
    await db.client.tenant.delete({
      where: { id },
    });

    await db.clearTenantContext();
  }

  async findBySlug(slug: string) {
    return await db.client.tenant.findUnique({
      where: { slug },
    });
  }
}
