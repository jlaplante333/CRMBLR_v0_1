'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';

export default function DirectoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tenant, setTenant] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundTenant = DEMO_TENANTS.find(t => t.slug === slug);
    if (foundTenant) {
      setTenant(foundTenant);
      
      // Mock staff data
      const mockStaff = [
        { id: '1', name: 'Executive Director', role: 'Executive Director', team: 'administration', email: 'ed@demo.com', phone: '555-0001' },
        { id: '2', name: 'Development Director', role: 'Development Director', team: 'development', email: 'dev@demo.com', phone: '555-0002' },
        { id: '3', name: 'Program Manager', role: 'Program Manager', team: 'programs', email: 'programs@demo.com', phone: '555-0003' },
        { id: '4', name: 'Board Chair', role: 'Board Chair', team: 'board', email: 'chair@demo.com', phone: '555-0004' },
        { id: '5', name: 'Finance Manager', role: 'Finance Manager', team: 'administration', email: 'finance@demo.com', phone: '555-0005' },
        { id: '6', name: 'Program Coordinator', role: 'Program Coordinator', team: 'programs', email: 'coordinator@demo.com', phone: '555-0006' },
        { id: '7', name: 'Board Member', role: 'Board Member', team: 'board', email: 'board@demo.com', phone: '555-0007' },
        { id: '8', name: 'Development Associate', role: 'Development Associate', team: 'development', email: 'associate@demo.com', phone: '555-0008' },
      ];
      
      setStaff(mockStaff);
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>;
  }

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const teamCounts = staff.reduce((acc, member) => {
    acc[member.team] = (acc[member.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const teams = ['administration', 'board', 'development', 'programs'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Directory</h1>
        <p className="text-gray-600">Your organization's team members and contacts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {teams.map((team) => (
          <Card key={team}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {team}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamCounts[team] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staff by Team */}
      {teams.map((team) => {
        const teamMembers = staff.filter(member => member.team === team);
        if (teamMembers.length === 0) return null;

        return (
          <Card key={team}>
            <CardHeader>
              <CardTitle className="capitalize">{team} Team</CardTitle>
              <CardDescription>{teamMembers.length} members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.role}</div>
                    {member.email && (
                      <div className="text-sm text-blue-600">
                        <a href={`mailto:${member.email}`}>{member.email}</a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="text-sm text-gray-500">{member.phone}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
