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

interface User {
  id: string;
  email: string;
  name: string;
  tenants: {
    tenantId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
  }[];
}

export default function WorkspacesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate user authentication - in a real app, this would come from JWT/session
    const simulateUserLogin = () => {
      // For demo purposes, we'll simulate different user scenarios
      const urlParams = new URLSearchParams(window.location.search);
      const demoUser = urlParams.get('user') || 'makelit';
      
      let userData: User;
      
      switch (demoUser) {
        case 'makelit':
          userData = {
            id: 'user-makelit',
            email: 'sofia@makemag.org',
            name: 'Sofia Rodriguez',
            tenants: [{ tenantId: 'demo-makelit', role: 'owner' }]
          };
          break;
        case '1in6':
          userData = {
            id: 'user-1in6',
            email: 'ops@1in6.org',
            name: 'Operations Manager',
            tenants: [{ tenantId: 'demo-oneinsix', role: 'admin' }]
          };
          break;
        case 'fallenfruit':
          userData = {
            id: 'user-fallenfruit',
            email: 'team@fallenfruit.org',
            name: 'Team Lead',
            tenants: [{ tenantId: 'demo-fallenfruit', role: 'owner' }]
          };
          break;
        case 'homeboy':
          userData = {
            id: 'user-homeboy',
            email: 'it@homeboyindustries.org',
            name: 'IT Manager',
            tenants: [{ tenantId: 'demo-homeboy', role: 'admin' }]
          };
          break;
        case 'superuser':
          // Superuser can see all tenants - determine user based on URL params
          const urlParams = new URLSearchParams(window.location.search);
          const userEmail = urlParams.get('email') || 'jon@crmblr.com';
          
          // Map emails to names
          const emailToName: { [key: string]: string } = {
            'jon@crmblr.com': 'Jon Crmblr',
            'laurie@crmblr.com': 'Laurie Sartain',
            'jon@vcrm.com': 'Jon V-CRM',
            'yosuke@vcrm.com': 'Yosuke Yasuda',
            'avi@vcrm.com': 'Avi V-CRM',
            'axlrose@vcrm.com': 'Axl Rose'
          };
          
          userData = {
            id: 'user-superuser',
            email: userEmail,
            name: emailToName[userEmail] || 'Super User',
            tenants: userEmail === 'jon@vcrm.com' ? [
              // For jon@vcrm.com, show Tokyo AI, Alex.Ai, and Alex Inc tenants
              { tenantId: 'tokyo-voice-ai', role: 'admin' },
              { tenantId: 'alex-ai', role: 'admin' },
              { tenantId: 'alex-inc-ai', role: 'admin' }
            ] : [
              // For other superusers, show all tenants
              { tenantId: 'tokyo-voice-ai', role: 'admin' },
              { tenantId: 'alex-ai', role: 'admin' },
              { tenantId: 'alex-inc-ai', role: 'admin' },
              { tenantId: 'demo-makelit', role: 'admin' },
              { tenantId: 'demo-oneinsix', role: 'admin' },
              { tenantId: 'demo-fallenfruit', role: 'admin' },
              { tenantId: 'demo-homeboy', role: 'admin' }
            ]
          };
          break;
        default:
          // Default to makelit user
          userData = {
            id: 'user-makelit',
            email: 'sofia@makemag.org',
            name: 'Sofia Rodriguez',
            tenants: [{ tenantId: 'demo-makelit', role: 'owner' }]
          };
      }
      
      return userData;
    };

    const userData = simulateUserLogin();
    setUser(userData);

    // Filter tenants based on user's permissions
    const userTenantIds = userData.tenants.map(t => t.tenantId);
    console.log('🔍 Debug - User data:', userData);
    console.log('🔍 Debug - User tenant IDs:', userTenantIds);
    console.log('🔍 Debug - Available DEMO_TENANTS:', DEMO_TENANTS.map(t => t.slug));
    
    const filteredTenants: Tenant[] = DEMO_TENANTS
      .filter(tenant => {
        // Handle both demo- prefixed tenants and direct slug matches
        const matches = userTenantIds.includes(`demo-${tenant.slug}`) || 
               userTenantIds.includes(tenant.slug);
        console.log(`🔍 Debug - Tenant ${tenant.slug} matches:`, matches);
        return matches;
      })
      .map(tenant => ({
        id: tenant.slug, // Always use the actual slug as the ID
        name: tenant.name,
        slug: tenant.slug,
        branding: {
          palette: tenant.palette,
          logoUrl: tenant.logoUrl,
        },
      }));
    
    console.log('🔍 Debug - Filtered tenants:', filteredTenants);
    
    setTenants(filteredTenants);
    setIsLoading(false);
  }, []);

  const handleTenantSelect = (tenant: Tenant) => {
    // Redirect to local tenant route instead of production subdomain
    router.push(`/t/${tenant.slug}`);
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
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Logged in as: {user.name} ({user.email})
            </p>
          )}
        </div>

        {tenants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Workspaces Available</h3>
            <p className="text-gray-600 mb-6">You don't have access to any workspaces.</p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {tenants.map((tenant) => (
                <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: tenant.branding.palette[0] }}
                      >
                        {tenant.slug === 'tokyo-voice-ai' ? '🎤' : tenant.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tenant.name}</CardTitle>
                        <CardDescription>
                          {tenant.slug === 'tokyo-voice-ai' ? 'tokyo-voice-ai.vcrm.com' : `${tenant.slug}.vcrm.com`}
                        </CardDescription>
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
          </>
        )}
      </div>
    </div>
  );
}