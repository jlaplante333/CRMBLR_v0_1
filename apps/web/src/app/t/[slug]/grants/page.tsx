'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';

export default function GrantsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tenant, setTenant] = useState<any>(null);
  const [grants, setGrants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundTenant = DEMO_TENANTS.find(t => t.slug === slug);
    if (foundTenant) {
      setTenant(foundTenant);
      
      // Mock grants data
      const mockGrants = [
        { id: '1', name: 'General Operating Support', organization: 'Driehaus Foundation', amount: 50000, status: 'submitted', deadline: '2024-03-15' },
        { id: '2', name: 'Program Development Grant', organization: 'Bynner Foundation', amount: 25000, status: 'awarded', deadline: '2024-02-28' },
        { id: '3', name: 'Capacity Building Initiative', organization: 'Local Foundation', amount: 75000, status: 'prospect', deadline: '2024-04-30' },
        { id: '4', name: 'Emergency Response Fund', organization: 'Community Foundation', amount: 15000, status: 'declined', deadline: '2024-01-31' },
        { id: '5', name: 'Technology Upgrade Grant', organization: 'Tech Foundation', amount: 30000, status: 'report_due', deadline: '2024-03-01' },
      ];
      
      setGrants(mockGrants);
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>;
  }

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const statusCounts = grants.reduce((acc, grant) => {
    acc[grant.status] = (acc[grant.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRequested = grants.reduce((sum, grant) => sum + grant.amount, 0);
  const totalAwarded = grants.filter(g => g.status === 'awarded').reduce((sum, grant) => sum + grant.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grants</h1>
        <p className="text-gray-600">Track grant applications and funding opportunities</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRequested.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAwarded.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grants.length > 0 ? Math.round((statusCounts.awarded / grants.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {status.replace('_', ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grant Applications</CardTitle>
          <CardDescription>All grant applications and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Grant Name</th>
                  <th className="text-left py-2">Organization</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Deadline</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((grant) => (
                  <tr key={grant.id} className="border-b">
                    <td className="py-2">{grant.name}</td>
                    <td className="py-2">{grant.organization}</td>
                    <td className="py-2">${grant.amount.toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        grant.status === 'awarded' ? 'bg-green-100 text-green-800' :
                        grant.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        grant.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                        grant.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {grant.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2">{grant.deadline}</td>
                    <td className="py-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
