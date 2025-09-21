import { Injectable } from '@nestjs/common';
import { db } from '@crmblr/db';
import { CreateDonationRequest, UpdateDonationRequest } from '@crmblr/types';

@Injectable()
export class DonationsService {
  async create(createDonationDto: CreateDonationRequest, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const donation = await db.client.donation.create({
      data: {
        tenantId,
        ...createDonationDto,
      },
    });

    await db.clearTenantContext();
    
    return donation;
  }

  async findAll(tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const donations = await db.client.donation.findMany({
      include: {
        contact: true,
        organization: true,
        campaign: true,
      },
      orderBy: { date: 'desc' },
    });

    await db.clearTenantContext();
    
    return donations;
  }

  async findOne(id: string, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const donation = await db.client.donation.findUnique({
      where: { id },
      include: {
        contact: true,
        organization: true,
        campaign: true,
      },
    });

    await db.clearTenantContext();
    
    return donation;
  }

  async update(id: string, updateDonationDto: UpdateDonationRequest, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const donation = await db.client.donation.update({
      where: { id },
      data: updateDonationDto,
    });

    await db.clearTenantContext();
    
    return donation;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    await db.client.donation.delete({
      where: { id },
    });

    await db.clearTenantContext();
  }

  async getKPIs(tenantId: string, userId: string) {
    await db.setTenantContext(tenantId, userId);
    
    const [totalDonations, ytdDonations, totalDonors, pendingThankYous] = await Promise.all([
      db.client.donation.aggregate({
        _sum: { amount: true },
      }),
      db.client.donation.aggregate({
        _sum: { amount: true },
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),
      db.client.donation.groupBy({
        by: ['contactId'],
        where: {
          contactId: { not: null },
        },
      }),
      db.client.donation.count({
        where: {
          thankYouStatus: 'pending',
        },
      }),
    ]);

    await db.clearTenantContext();
    
    return {
      totalDonations: totalDonations._sum.amount || 0,
      ytdDonations: ytdDonations._sum.amount || 0,
      totalDonors: totalDonors.length,
      pendingThankYous,
    };
  }
}
