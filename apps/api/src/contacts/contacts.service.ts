import { Injectable } from '@nestjs/common';
import { db } from '@crmblr/db';
import { CreateContactRequest, UpdateContactRequest } from '@crmblr/types';

@Injectable()
export class ContactsService {
  async create(createContactDto: CreateContactRequest, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const contact = await db.client.contact.create({
      data: {
        tenantId,
        ...createContactDto,
      },
    });

    await db.clearTenantContext();
    
    return contact;
  }

  async findAll(tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const contacts = await db.client.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });

    await db.clearTenantContext();
    
    return contacts;
  }

  async findOne(id: string, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const contact = await db.client.contact.findUnique({
      where: { id },
    });

    await db.clearTenantContext();
    
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactRequest, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const contact = await db.client.contact.update({
      where: { id },
      data: updateContactDto,
    });

    await db.clearTenantContext();
    
    return contact;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    await db.client.contact.delete({
      where: { id },
    });

    await db.clearTenantContext();
  }
}
