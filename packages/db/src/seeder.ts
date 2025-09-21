import { PrismaClient } from '@prisma/client';
import { 
  DEMO_TENANTS, 
  UserRole, 
  ContactStage, 
  OrganizationType, 
  ThankYouStatus, 
  GrantStatus, 
  StaffTeam,
  DemoTenantConfig 
} from '@crmblr/types';

export class DemoTenantSeeder {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async seedDemoTenants() {
    console.log('🌱 Seeding demo tenants...');
    
    for (const tenantConfig of DEMO_TENANTS) {
      await this.seedTenant(tenantConfig);
    }
    
    console.log('✅ Demo tenants seeded successfully');
  }

  private async seedTenant(config: DemoTenantConfig) {
    console.log(`📝 Seeding tenant: ${config.name}`);
    
    // Create tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: config.name,
        slug: config.slug,
        status: 'active',
        branding: {
          palette: config.palette,
          logoUrl: config.logoUrl,
        },
        settings: {
          subdomain: config.slug,
          customFields: this.getDefaultCustomFields(),
        },
      },
    });

    // Create users and link to tenant
    for (const userConfig of config.users) {
      const user = await this.prisma.user.create({
        data: {
          email: userConfig.email,
          name: userConfig.email.split('@')[0],
          cognitoId: `demo-${config.slug}-${userConfig.role}`,
        },
      });

      await this.prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: userConfig.role,
        },
      });
    }

    // Seed tenant data
    await this.seedTenantData(tenant.id, config);
  }

  private async seedTenantData(tenantId: string, config: DemoTenantConfig) {
    // Create campaigns
    const campaigns = await this.createCampaigns(tenantId);
    
    // Create organizations
    const organizations = await this.createOrganizations(tenantId);
    
    // Create contacts
    const contacts = await this.createContacts(tenantId);
    
    // Create donations
    await this.createDonations(tenantId, contacts, organizations, campaigns);
    
    // Create grants
    await this.createGrants(tenantId, organizations);
    
    // Create pipeline events
    await this.createPipelineEvents(tenantId, contacts);
    
    // Create staff
    await this.createStaff(tenantId);
  }

  private async createCampaigns(tenantId: string) {
    const campaigns = [
      {
        name: '2025 End of Year Campaign',
        targetAmount: 100000,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
      },
      {
        name: 'Spring Drive 2025',
        targetAmount: 50000,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-05-31'),
      },
    ];

    const createdCampaigns = [];
    for (const campaign of campaigns) {
      const created = await this.prisma.campaign.create({
        data: {
          tenantId,
          ...campaign,
        },
      });
      createdCampaigns.push(created);
    }
    return createdCampaigns;
  }

  private async createOrganizations(tenantId: string) {
    const orgs = [
      { name: 'Driehaus Foundation', type: OrganizationType.FOUNDATION, website: 'https://driehausfoundation.org' },
      { name: 'Bynner Foundation', type: OrganizationType.FOUNDATION, website: 'https://bynnerfoundation.org' },
      { name: 'Community Arts Center', type: OrganizationType.VENUE, location: 'Chicago, IL' },
      { name: 'Local Business Partner', type: OrganizationType.PARTNER, website: 'https://example.com' },
      { name: 'Major Funder Corp', type: OrganizationType.FUNDER, website: 'https://funder.com' },
    ];

    const createdOrgs = [];
    for (const org of orgs) {
      const created = await this.prisma.organization.create({
        data: {
          tenantId,
          ...org,
        },
      });
      createdOrgs.push(created);
    }
    return createdOrgs;
  }

  private async createContacts(tenantId: string) {
    const contacts = [];
    const stages = Object.values(ContactStage);
    
    // Generate 150 contacts with realistic distribution
    for (let i = 0; i < 150; i++) {
      const stage = this.getWeightedStage(stages);
      const score = Math.floor(Math.random() * 31); // 0-30
      const lifetimeValue = this.getGammaDistribution(0, 10000);
      
      const contact = await this.prisma.contact.create({
        data: {
          tenantId,
          firstName: `Contact${i + 1}`,
          lastName: 'Demo',
          email: `contact${i + 1}@demo.com`,
          phone: `555-${String(i + 1).padStart(4, '0')}`,
          address: `${i + 1} Demo Street, Demo City, DC 12345`,
          score,
          lifetimeValue,
          stage,
          custom: {
            source: this.getRandomSource(),
            preferred_pronouns: this.getRandomPronouns(),
            do_not_contact: Math.random() < 0.05, // 5% DNC
          },
        },
      });
      contacts.push(contact);
    }
    return contacts;
  }

  private async createDonations(tenantId: string, contacts: any[], organizations: any[], campaigns: any[]) {
    const donations = [];
    const thankYouStatuses = Object.values(ThankYouStatus);
    
    // Generate 400 donations over past 3 years
    for (let i = 0; i < 400; i++) {
      const amount = this.getDonationAmount();
      const date = this.getRandomDate(new Date('2022-01-01'), new Date());
      const contactId = Math.random() < 0.8 ? contacts[Math.floor(Math.random() * contacts.length)].id : null;
      const organizationId = !contactId && Math.random() < 0.2 ? organizations[Math.floor(Math.random() * organizations.length)].id : null;
      const campaignId = campaigns[Math.floor(Math.random() * campaigns.length)].id;
      
      const donation = await this.prisma.donation.create({
        data: {
          tenantId,
          contactId,
          organizationId,
          campaignId,
          amount,
          currency: 'USD',
          date,
          thankYouStatus: this.getWeightedThankYouStatus(thankYouStatuses),
          custom: {
            source: this.getRandomSource(),
            restricted: Math.random() < 0.1, // 10% restricted
            in_honor_of: Math.random() < 0.05 ? `In honor of ${this.getRandomName()}` : null,
          },
        },
      });
      donations.push(donation);
    }
    return donations;
  }

  private async createGrants(tenantId: string, organizations: any[]) {
    const grants = [];
    const statuses = Object.values(GrantStatus);
    
    // Generate 45 grants
    for (let i = 0; i < 45; i++) {
      const status = this.getWeightedGrantStatus(statuses);
      const deadline = this.getFutureDate(30, 365); // 30 days to 1 year from now
      
      const grant = await this.prisma.grantApp.create({
        data: {
          tenantId,
          organizationId: organizations[Math.floor(Math.random() * organizations.length)].id,
          name: `Grant Application ${i + 1}`,
          amountRequested: this.getGrantAmount(),
          status,
          deadline,
          notes: status === GrantStatus.SUBMITTED ? 'Application submitted, awaiting response' : null,
          custom: {
            priority: this.getRandomPriority(),
            category: this.getRandomCategory(),
          },
        },
      });
      grants.push(grant);
    }
    return grants;
  }

  private async createPipelineEvents(tenantId: string, contacts: any[]) {
    const events = [];
    const stages = Object.values(ContactStage);
    
    // Create events for 40% of contacts
    const contactSubset = contacts.slice(0, Math.floor(contacts.length * 0.4));
    
    for (const contact of contactSubset) {
      const eventCount = Math.floor(Math.random() * 3) + 1; // 1-3 events per contact
      
      for (let i = 0; i < eventCount; i++) {
        const event = await this.prisma.pipelineEvent.create({
          data: {
            tenantId,
            contactId: contact.id,
            stage: stages[Math.floor(Math.random() * stages.length)],
            note: this.getRandomEventNote(),
            occurredAt: this.getRandomDate(new Date('2024-01-01'), new Date()),
          },
        });
        events.push(event);
      }
    }
    return events;
  }

  private async createStaff(tenantId: string) {
    const staff = [
      { name: 'Executive Director', role: 'Executive Director', team: StaffTeam.ADMINISTRATION, email: 'ed@demo.com' },
      { name: 'Development Director', role: 'Development Director', team: StaffTeam.DEVELOPMENT, email: 'dev@demo.com' },
      { name: 'Program Manager', role: 'Program Manager', team: StaffTeam.PROGRAMS, email: 'programs@demo.com' },
      { name: 'Board Chair', role: 'Board Chair', team: StaffTeam.BOARD, email: 'chair@demo.com' },
      { name: 'Finance Manager', role: 'Finance Manager', team: StaffTeam.ADMINISTRATION, email: 'finance@demo.com' },
    ];

    for (const member of staff) {
      await this.prisma.staff.create({
        data: {
          tenantId,
          ...member,
          phone: '555-0000',
          custom: {
            start_date: this.getRandomDate(new Date('2020-01-01'), new Date('2023-01-01')),
            department: member.team,
          },
        },
      });
    }
  }

  // Helper methods
  private getWeightedStage(stages: ContactStage[]): ContactStage {
    const weights = [0.45, 0.20, 0.15, 0.10, 0.10]; // Identified, Qualified, Cultivated, Solicited, Stewarded
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < stages.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return stages[i];
      }
    }
    return stages[0];
  }

  private getWeightedThankYouStatus(statuses: ThankYouStatus[]): ThankYouStatus {
    const weights = [0.20, 0.10, 0.70]; // none, pending, sent
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i];
      }
    }
    return statuses[2]; // sent
  }

  private getWeightedGrantStatus(statuses: GrantStatus[]): GrantStatus {
    const weights = [0.60, 0.15, 0.10, 0.10, 0.05]; // prospect, submitted, awarded, declined, report_due
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i];
      }
    }
    return statuses[0]; // prospect
  }

  private getDonationAmount(): number {
    // Gamma-like distribution for donation amounts
    const amounts = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
    const weights = [0.30, 0.25, 0.20, 0.15, 0.05, 0.03, 0.01, 0.005, 0.005];
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < amounts.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return amounts[i];
      }
    }
    return amounts[0];
  }

  private getGrantAmount(): number {
    const amounts = [5000, 10000, 25000, 50000, 100000, 250000];
    const weights = [0.20, 0.30, 0.25, 0.15, 0.08, 0.02];
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < amounts.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return amounts[i];
      }
    }
    return amounts[0];
  }

  private getGammaDistribution(min: number, max: number): number {
    // Simplified gamma distribution
    const shape = 2;
    const scale = (max - min) / 4;
    let sum = 0;
    
    for (let i = 0; i < shape; i++) {
      sum -= Math.log(Math.random());
    }
    
    return Math.max(min, Math.min(max, sum * scale));
  }

  private getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private getFutureDate(minDays: number, maxDays: number): Date {
    const now = new Date();
    const days = minDays + Math.random() * (maxDays - minDays);
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private getRandomSource(): string {
    const sources = ['website', 'email', 'phone', 'event', 'referral', 'social_media'];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  private getRandomPronouns(): string {
    const pronouns = ['they/them', 'she/her', 'he/him', 'she/they', 'he/they'];
    return pronouns[Math.floor(Math.random() * pronouns.length)];
  }

  private getRandomName(): string {
    const names = ['John Smith', 'Jane Doe', 'Alex Johnson', 'Sam Wilson', 'Taylor Brown'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomPriority(): string {
    const priorities = ['low', 'medium', 'high'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  private getRandomCategory(): string {
    const categories = ['general', 'program', 'capital', 'endowment', 'emergency'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getRandomEventNote(): string {
    const notes = [
      'Initial contact made',
      'Follow-up call scheduled',
      'Meeting completed',
      'Proposal sent',
      'Thank you note sent',
      'Donation received',
      'Stewardship call made',
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  private getDefaultCustomFields() {
    return {
      donations: [
        { id: 'source', name: 'Source', type: 'select', required: false, options: ['website', 'email', 'phone', 'event', 'referral'] },
        { id: 'restricted', name: 'Restricted', type: 'boolean', required: false },
        { id: 'in_honor_of', name: 'In Honor Of', type: 'text', required: false },
      ],
      contacts: [
        { id: 'preferred_pronouns', name: 'Preferred Pronouns', type: 'select', required: false, options: ['they/them', 'she/her', 'he/him', 'she/they', 'he/they'] },
        { id: 'do_not_contact', name: 'Do Not Contact', type: 'boolean', required: false },
        { id: 'employer_match', name: 'Employer Match', type: 'boolean', required: false },
      ],
    };
  }
}
