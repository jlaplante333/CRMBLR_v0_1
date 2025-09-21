'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  branding: {
    palette: string[];
    logoUrl?: string;
  };
}

export default function WorkspacesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real app, this would fetch from the API
    // For now, we'll use the demo tenants
    const demoTenants: Tenant[] = DEMO_TENANTS.map(tenant => ({
      id: `demo-${tenant.slug}`,
      name: tenant.name,
      slug: tenant.slug,
      branding: {
        palette: tenant.palette,
        logoUrl: tenant.logoUrl,
      },
    }));
    
    setTenants(demoTenants);
    setIsLoading(false);
  }, []);

  const handleTenantSelect = (tenant: Tenant) => {
    // Redirect to tenant subdomain
    window.location.href = `https://${tenant.slug}.crmblr.com`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Workspaces</h1>
          <p className="text-gray-600">Select a workspace to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: tenant.branding.palette[0] }}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <CardDescription>{tenant.slug}.crmblr.com</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleTenantSelect(tenant)}
                  className="w-full"
                >
                  Open Workspace
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
