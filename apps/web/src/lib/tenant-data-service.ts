// Dynamic Tenant Data Service - Generates organization-specific content for each CRM
// This service creates realistic, tenant-specific data that varies between nonprofits

export interface TenantMetrics {
  yearToDate: number;
  last30Days: number;
  totalDonors: number;
  avgEngagementScore: number;
}

export interface GrantDeadline {
  name: string;
  applicationDate: string;
  daysRemaining: number;
}

export interface DonorCultivation {
  name: string;
  lastContact: string;
  action: string;
}

export interface RecentDonation {
  donorName: string;
  amount: number;
  date: string;
}

export interface ActiveCampaign {
  name: string;
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
}

export interface TenantDashboardData {
  metrics: TenantMetrics;
  requiresAttention: {
    count: number;
    message: string;
  };
  grantDeadlines: GrantDeadline[];
  donorCultivation: DonorCultivation[];
  pipelineOverview: {
    identified: number;
    inCultivation: number;
    atRisk: number;
  };
  recentDonations: RecentDonation[];
  activeCampaigns: ActiveCampaign[];
}

// Tenant-specific data configurations
const TENANT_DATA_CONFIGS: Record<string, Partial<TenantDashboardData>> = {
  makelit: {
    metrics: {
      yearToDate: 470,
      last30Days: 0,
      totalDonors: 108,
      avgEngagementScore: 13,
    },
    requiresAttention: {
      count: 62,
      message: "donations need acknowledgment",
    },
    grantDeadlines: [
      { name: "IACA Report", applicationDate: "Sep 30, 2025", daysRemaining: 8 },
      { name: "Test Grant for QA", applicationDate: "Oct 01, 2025", daysRemaining: 9 },
      { name: "GDDF 3-year Grant Report", applicationDate: "Oct 10, 2025", daysRemaining: 18 },
    ],
    donorCultivation: [
      { name: "Leonard Sommer", lastContact: "Never", action: "Schedule check-in call" },
      { name: "Héctor García Chávez", lastContact: "Never", action: "Schedule check-in call" },
    ],
    pipelineOverview: {
      identified: 69,
      inCultivation: 0,
      atRisk: 6,
    },
    recentDonations: [
      { donorName: "Héctor García Chávez", amount: 50, date: "July 31, 2025" },
      { donorName: "Héctor García Chávez", amount: 50, date: "June 30, 2025" },
      { donorName: "Héctor García Chávez", amount: 50, date: "May 31, 2025" },
    ],
    activeCampaigns: [
      { name: "2025 End of Year Campaign", currentAmount: 1825, targetAmount: 10000, progressPercentage: 18 },
    ],
  },

  oneinsix: {
    metrics: {
      yearToDate: 1250,
      last30Days: 150,
      totalDonors: 89,
      avgEngagementScore: 18,
    },
    requiresAttention: {
      count: 23,
      message: "donations need acknowledgment",
    },
    grantDeadlines: [
      { name: "Men's Health Foundation Grant", applicationDate: "Oct 15, 2025", daysRemaining: 23 },
      { name: "Community Support Initiative", applicationDate: "Nov 01, 2025", daysRemaining: 40 },
    ],
    donorCultivation: [
      { name: "Michael Rodriguez", lastContact: "2 weeks ago", action: "Follow up on meeting" },
      { name: "Sarah Chen", lastContact: "Never", action: "Initial outreach" },
    ],
    pipelineOverview: {
      identified: 45,
      inCultivation: 12,
      atRisk: 3,
    },
    recentDonations: [
      { donorName: "Anonymous Donor", amount: 100, date: "August 15, 2025" },
      { donorName: "Community Foundation", amount: 500, date: "August 10, 2025" },
      { donorName: "Local Business", amount: 250, date: "August 05, 2025" },
    ],
    activeCampaigns: [
      { name: "Support Services Campaign", currentAmount: 8500, targetAmount: 15000, progressPercentage: 57 },
    ],
  },

  fallenfruit: {
    metrics: {
      yearToDate: 3200,
      last30Days: 400,
      totalDonors: 156,
      avgEngagementScore: 22,
    },
    requiresAttention: {
      count: 8,
      message: "donations need acknowledgment",
    },
    grantDeadlines: [
      { name: "Urban Agriculture Grant", applicationDate: "Sep 25, 2025", daysRemaining: 3 },
      { name: "Environmental Impact Fund", applicationDate: "Oct 20, 2025", daysRemaining: 28 },
      { name: "Community Garden Initiative", applicationDate: "Nov 15, 2025", daysRemaining: 54 },
    ],
    donorCultivation: [
      { name: "Eco-Friendly Foundation", lastContact: "1 week ago", action: "Schedule site visit" },
      { name: "Local Food Network", lastContact: "3 days ago", action: "Send partnership proposal" },
    ],
    pipelineOverview: {
      identified: 78,
      inCultivation: 24,
      atRisk: 2,
    },
    recentDonations: [
      { donorName: "Green Thumb Society", amount: 200, date: "August 20, 2025" },
      { donorName: "Sustainable Living Group", amount: 150, date: "August 18, 2025" },
      { donorName: "Urban Farmer Collective", amount: 300, date: "August 15, 2025" },
    ],
    activeCampaigns: [
      { name: "Community Garden Expansion", currentAmount: 12000, targetAmount: 25000, progressPercentage: 48 },
    ],
  },

  homeboy: {
    metrics: {
      yearToDate: 8500,
      last30Days: 1200,
      totalDonors: 234,
      avgEngagementScore: 28,
    },
    requiresAttention: {
      count: 15,
      message: "donations need acknowledgment",
    },
    grantDeadlines: [
      { name: "Workforce Development Grant", applicationDate: "Oct 05, 2025", daysRemaining: 13 },
      { name: "Social Enterprise Fund", applicationDate: "Oct 30, 2025", daysRemaining: 38 },
      { name: "Reentry Services Initiative", applicationDate: "Nov 20, 2025", daysRemaining: 59 },
    ],
    donorCultivation: [
      { name: "Corporate Partner", lastContact: "5 days ago", action: "Schedule quarterly review" },
      { name: "Major Donor", lastContact: "1 month ago", action: "Send impact report" },
    ],
    pipelineOverview: {
      identified: 120,
      inCultivation: 45,
      atRisk: 8,
    },
    recentDonations: [
      { donorName: "Corporate Foundation", amount: 1000, date: "August 25, 2025" },
      { donorName: "Individual Supporter", amount: 500, date: "August 22, 2025" },
      { donorName: "Community Partner", amount: 750, date: "August 20, 2025" },
    ],
    activeCampaigns: [
      { name: "Jobs Not Jails Campaign", currentAmount: 45000, targetAmount: 75000, progressPercentage: 60 },
    ],
  },
};

// Default fallback data
const DEFAULT_DATA: TenantDashboardData = {
  metrics: {
    yearToDate: 1000,
    last30Days: 100,
    totalDonors: 50,
    avgEngagementScore: 15,
  },
  requiresAttention: {
    count: 10,
    message: "donations need acknowledgment",
  },
  grantDeadlines: [
    { name: "General Grant", applicationDate: "Oct 15, 2025", daysRemaining: 23 },
  ],
  donorCultivation: [
    { name: "Sample Donor", lastContact: "Never", action: "Initial outreach" },
  ],
  pipelineOverview: {
    identified: 25,
    inCultivation: 5,
    atRisk: 2,
  },
  recentDonations: [
    { donorName: "Sample Donor", amount: 100, date: "August 15, 2025" },
  ],
  activeCampaigns: [
    { name: "General Campaign", currentAmount: 5000, targetAmount: 10000, progressPercentage: 50 },
  ],
};

// Function to get tenant-specific dashboard data
export function getTenantDashboardData(slug: string): TenantDashboardData {
  const tenantConfig = TENANT_DATA_CONFIGS[slug];
  
  if (!tenantConfig) {
    return DEFAULT_DATA;
  }

  // Merge tenant-specific config with defaults
  return {
    ...DEFAULT_DATA,
    ...tenantConfig,
    metrics: {
      ...DEFAULT_DATA.metrics,
      ...tenantConfig.metrics,
    },
    pipelineOverview: {
      ...DEFAULT_DATA.pipelineOverview,
      ...tenantConfig.pipelineOverview,
    },
  } as TenantDashboardData;
}

// Function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Function to format dates
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
