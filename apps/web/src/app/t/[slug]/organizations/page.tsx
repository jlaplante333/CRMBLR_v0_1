'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';

export default function OrganizationsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tenant, setTenant] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundTenant = DEMO_TENANTS.find(t => t.slug === slug);
    if (foundTenant) {
      setTenant(foundTenant);
      
      // Mock organizations data
      const mockOrgs = [
        { id: '1', name: 'Driehaus Foundation', type: 'foundation', website: 'https://driehausfoundation.org', location: 'Chicago, IL' },
        { id: '2', name: 'Bynner Foundation', type: 'foundation', website: 'https://bynnerfoundation.org', location: 'New York, NY' },
        { id: '3', name: 'Community Arts Center', type: 'venue', website: 'https://communityarts.org', location: 'Los Angeles, CA' },
        { id: '4', name: 'Local Business Partner', type: 'partner', website: 'https://localbiz.com', location: 'San Francisco, CA' },
        { id: '5', name: 'Major Funder Corp', type: 'funder', website: 'https://majorfunder.com', location: 'Boston, MA' },
        { id: '6', name: 'Regional Foundation', type: 'foundation', website: 'https://regionalfoundation.org', location: 'Austin, TX' },
        { id: '7', name: 'Cultural Venue', type: 'venue', website: 'https://culturalvenue.org', location: 'Seattle, WA' },
        { id: '8', name: 'Corporate Sponsor', type: 'partner', website: 'https://corporatesponsor.com', location: 'Denver, CO' },
      ];
      
      setOrganizations(mockOrgs);
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>;
  }

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const typeCounts = organizations.reduce((acc, org) => {
    acc[org.type] = (acc[org.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
        <p className="text-gray-600">Manage your network of organizations and partners</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Foundations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeCounts.foundation || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeCounts.venue || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeCounts.partner || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{org.name}</CardTitle>
              <CardDescription className="capitalize">{org.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {org.website && (
                <div className="text-sm">
                  <span className="font-medium">Website:</span>{' '}
                  <a 
                    href={org.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {org.website}
                  </a>
                </div>
              )}
              {org.location && (
                <div className="text-sm">
                  <span className="font-medium">Location:</span> {org.location}
                </div>
              )}
              <div className="pt-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View Details
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
