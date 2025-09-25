'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import { getTenantBranding } from '@/lib/branding-service';

export default function ContactsPage() {
  const params = useParams();
  const slug = params.slug as string;
  // Find tenant directly
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);

  // Get dynamic branding
  const branding = getTenantBranding(slug);

  // Mock contacts data
  const mockContacts = [
    { 
      id: '1', 
      firstName: 'Sarah', 
      lastName: 'Johnson', 
      email: 'sarah@example.com', 
      phone: '(555) 123-4567',
      score: 85,
      stage: 'Cultivated',
      lifetimeValue: 2500
    },
    { 
      id: '2', 
      firstName: 'Michael', 
      lastName: 'Chen', 
      email: 'michael@company.com', 
      phone: '(555) 987-6543',
      score: 92,
      stage: 'Solicited',
      lifetimeValue: 5000
    },
    { 
      id: '3', 
      firstName: 'Emily', 
      lastName: 'Rodriguez', 
      email: 'emily.r@nonprofit.org', 
      phone: '(555) 456-7890',
      score: 78,
      stage: 'Identified',
      lifetimeValue: 1200
    },
    { 
      id: '4', 
      firstName: 'David', 
      lastName: 'Thompson', 
      email: 'david@foundation.org', 
      phone: '(555) 234-5678',
      score: 95,
      stage: 'Stewarded',
      lifetimeValue: 10000
    },
    { 
      id: '5', 
      firstName: 'Lisa', 
      lastName: 'Park', 
      email: 'lisa.park@email.com', 
      phone: '(555) 345-6789',
      score: 67,
      stage: 'Qualified',
      lifetimeValue: 750
    },
  ];

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Identified': return 'bg-gray-100 text-gray-800';
      case 'Qualified': return 'bg-blue-100 text-blue-800';
      case 'Cultivated': return 'bg-yellow-100 text-yellow-800';
      case 'Solicited': return 'bg-orange-100 text-orange-800';
      case 'Stewarded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalContacts = mockContacts.length;
  const avgScore = Math.round(mockContacts.reduce((sum, c) => sum + c.score, 0) / mockContacts.length);
  const totalLifetimeValue = mockContacts.reduce((sum, c) => sum + c.lifetimeValue, 0);
  const activeContacts = mockContacts.filter(c => c.stage !== 'Stewarded').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>Contacts</h1>
        <p className="text-gray-600" style={{ fontFamily: branding.fonts.body }}>Manage your donor and prospect relationships</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ fontFamily: branding.fonts.numeric }}>{totalContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ fontFamily: branding.fonts.numeric }}>{avgScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ fontFamily: branding.fonts.numeric }}>${totalLifetimeValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active in Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ fontFamily: branding.fonts.numeric }}>{activeContacts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle style={{ fontFamily: branding.fonts.heading }}>Contact Directory</CardTitle>
              <CardDescription>All contacts and their current status</CardDescription>
            </div>
            <Button style={{ backgroundColor: branding.primary, color: 'white' }}>Add Contact</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Phone</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Stage</th>
                  <th className="text-left py-2">Lifetime Value</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockContacts.map((contact) => (
                  <tr key={contact.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="font-medium text-gray-900" style={{ fontFamily: branding.fonts.body }}>
                        {contact.firstName} {contact.lastName}
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{contact.email}</td>
                    <td className="py-3 text-gray-600">{contact.phone}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900" style={{ fontFamily: branding.fonts.numeric }}>
                          {contact.score}
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${contact.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(contact.stage)}`}>
                        {contact.stage}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-gray-900" style={{ fontFamily: branding.fonts.numeric }}>
                        ${contact.lifetimeValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
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
