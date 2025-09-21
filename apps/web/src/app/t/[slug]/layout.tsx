'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DEMO_TENANTS } from '@crmblr/types';
import { BrandProvider, useBrand } from '@/lib/brand-context';

interface TenantLayoutProps {
  children: React.ReactNode;
}

function TenantLayoutContent({ children }: TenantLayoutProps) {
  const params = useParams();
  const slug = params.slug as string;
  const { tenant, setTenant } = useBrand();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Find tenant by slug
    const foundTenant = DEMO_TENANTS.find(t => t.slug === slug);
    if (foundTenant) {
      // Convert to Tenant type
      const tenantData = {
        id: `${slug}-uuid`,
        name: foundTenant.name,
        slug: foundTenant.slug,
        status: 'active' as const,
        branding: {
          palette: foundTenant.palette,
          logoUrl: foundTenant.logoUrl,
        },
        settings: {
          subdomain: foundTenant.slug,
          customFields: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTenant(tenantData);
    }
    setIsLoading(false);
  }, [slug, setTenant]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tenant Not Found</h1>
          <p className="text-gray-600">The workspace "{slug}" does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tenant.branding.logoUrl ? (
                <img 
                  src={tenant.branding.logoUrl} 
                  alt={`${tenant.name} logo`}
                  className="h-8 w-auto"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: tenant.branding.palette[0] }}
                >
                  {tenant.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{tenant.name}</h1>
                <p className="text-sm text-gray-600">{slug}.crmblr.com</p>
              </div>
            </div>
            
            <nav className="flex gap-6">
              <a href={`/t/${slug}/donations`} className="text-sm font-medium hover:text-blue-600">
                Donations
              </a>
              <a href={`/t/${slug}/pipeline`} className="text-sm font-medium hover:text-blue-600">
                Pipeline
              </a>
              <a href={`/t/${slug}/grants`} className="text-sm font-medium hover:text-blue-600">
                Grants
              </a>
              <a href={`/t/${slug}/organizations`} className="text-sm font-medium hover:text-blue-600">
                Organizations
              </a>
              <a href={`/t/${slug}/directory`} className="text-sm font-medium hover:text-blue-600">
                Directory
              </a>
              <a href={`/t/${slug}/reports`} className="text-sm font-medium hover:text-blue-600">
                Reports
              </a>
              <a href={`/t/${slug}/settings`} className="text-sm font-medium hover:text-blue-600">
                Settings
              </a>
            </nav>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  return (
    <BrandProvider>
      <TenantLayoutContent>{children}</TenantLayoutContent>
    </BrandProvider>
  );
}
