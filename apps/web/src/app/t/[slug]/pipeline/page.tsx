'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';

export default function PipelinePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tenant, setTenant] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundTenant = DEMO_TENANTS.find(t => t.slug === slug);
    if (foundTenant) {
      setTenant(foundTenant);
      
      // Mock contacts data with stages
      const mockContacts = [
        { id: '1', name: 'John Smith', stage: 'identified', score: 25, lastContact: '2024-01-10' },
        { id: '2', name: 'Jane Doe', stage: 'qualified', score: 45, lastContact: '2024-01-12' },
        { id: '3', name: 'Bob Johnson', stage: 'cultivated', score: 65, lastContact: '2024-01-14' },
        { id: '4', name: 'Alice Brown', stage: 'solicited', score: 80, lastContact: '2024-01-15' },
        { id: '5', name: 'Charlie Wilson', stage: 'stewarded', score: 90, lastContact: '2024-01-16' },
        { id: '6', name: 'Diana Prince', stage: 'identified', score: 30, lastContact: '2024-01-11' },
        { id: '7', name: 'Eve Adams', stage: 'qualified', score: 50, lastContact: '2024-01-13' },
        { id: '8', name: 'Frank Miller', stage: 'cultivated', score: 70, lastContact: '2024-01-15' },
      ];
      
      setContacts(mockContacts);
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>;
  }

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const stages = ['identified', 'qualified', 'cultivated', 'solicited', 'stewarded'];
  const stageCounts = stages.map(stage => ({
    stage,
    count: contacts.filter(c => c.stage === stage).length,
    contacts: contacts.filter(c => c.stage === stage)
  }));

  const prospectsContacted30Days = contacts.filter(c => 
    new Date(c.lastContact) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const advanced90Days = contacts.filter(c => 
    c.stage !== 'identified' && 
    new Date(c.lastContact) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-gray-600">Track your prospect pipeline and engagement</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contacted in 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prospectsContacted30Days}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Advanced in 90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advanced90Days}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {stageCounts.map((stageData) => (
          <Card key={stageData.stage}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {stageData.stage}
              </CardTitle>
              <CardDescription>{stageData.count} contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {stageData.contacts.map((contact) => (
                <div 
                  key={contact.id}
                  className="p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="font-medium text-sm">{contact.name}</div>
                  <div className="text-xs text-gray-600">
                    Score: {contact.score}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last: {contact.lastContact}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Activity</CardTitle>
          <CardDescription>Latest prospect interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contacts.slice(0, 5).map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-gray-600">
                    Moved to {contact.stage} stage
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {contact.lastContact}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
