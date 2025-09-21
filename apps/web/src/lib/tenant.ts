import { Tenant } from '@crmblr/types';

// Mock tenant data for local development
const MOCK_TENANTS: Record<string, Tenant> = {
  makelit: {
    id: 'makelit-uuid',
    name: 'MAKE Literary Productions, NFP',
    slug: 'makelit',
    status: 'active',
    branding: {
      palette: ['#111827', '#0ea5e9', '#fbbf24', '#f8fafc'],
      logoUrl: '/brand/makelit.svg',
    },
    settings: {
      subdomain: 'makelit',
      customFields: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  oneinsix: {
    id: 'oneinsix-uuid',
    name: '1in6',
    slug: 'oneinsix',
    status: 'active',
    branding: {
      palette: ['#0b3d91', '#1f73b7', '#f2f5f7', '#0f172a'],
      logoUrl: '/brand/1in6.svg',
    },
    settings: {
      subdomain: 'oneinsix',
      customFields: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  fallenfruit: {
    id: 'fallenfruit-uuid',
    name: 'Fallen Fruit',
    slug: 'fallenfruit',
    status: 'active',
    branding: {
      palette: ['#e11d48', '#f97316', '#fef3c7', '#111827'],
      logoUrl: '/brand/fallenfruit.svg',
    },
    settings: {
      subdomain: 'fallenfruit',
      customFields: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  homeboy: {
    id: 'homeboy-uuid',
    name: 'Homeboy Industries',
    slug: 'homeboy',
    status: 'active',
    branding: {
      palette: ['#0f172a', '#38bdf8', '#e2e8f0', '#1f2937'],
      logoUrl: '/brand/homeboy.svg',
    },
    settings: {
      subdomain: 'homeboy',
      customFields: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  // In production, this would fetch from the API
  // For now, return mock data
  return MOCK_TENANTS[slug] || null;
}

export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  // In production, this would fetch from the API
  // For now, return mock data
  return MOCK_TENANTS[subdomain] || null;
}

export function getTenantFromHostname(hostname: string): string | null {
  // Extract subdomain from hostname
  // e.g., makelit.crmblr.com -> makelit
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[1] === 'crmblr' && parts[2] === 'com') {
    return parts[0];
  }
  return null;
}
