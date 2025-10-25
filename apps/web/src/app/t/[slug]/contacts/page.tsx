'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import { getTenantBranding } from '@/lib/branding-service';

export default function ContactsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Find tenant directly
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);

  // Get dynamic branding
  const branding = getTenantBranding(slug);

  // Mock contacts data
  const mockContacts = [
    { 
      id: 'jonathan', 
      firstName: 'Jonathan', 
      lastName: 'Laplante', 
      email: 'jonathan@tokyo-voice-ai.com', 
      phone: '(555) 123-4567',
      score: 98,
      stage: 'Stewarded',
      lifetimeValue: 15000,
      imageUrl: '/avatars/jonathan-laplante.svg',
      title: 'Tokyo Voice AI Hackathon Winner',
      company: 'V-CRM Team',
      notes: 'Lead developer of the Tokyo Voice AI CRM system. Passionate about voice technology and AI innovation.',
      lastContact: '2024-10-25',
      source: 'Tokyo Voice AI Hackathon'
    },
    { 
      id: 'takua', 
      firstName: 'Takua', 
      lastName: 'Umeki', 
      email: 'takua@tokyo-voice-ai.com', 
      phone: '(555) 234-5678',
      score: 92,
      stage: 'Cultivated',
      lifetimeValue: 8000,
      title: 'Voice AI Developer',
      company: 'Tokyo Voice AI Team',
      notes: 'Expert in voice recognition technology and AI integration. Key contributor to the hackathon project.',
      lastContact: '2024-10-25',
      source: 'Tokyo Voice AI Hackathon'
    },
    { 
      id: 'hong', 
      firstName: 'Hong', 
      lastName: 'Younggo', 
      email: 'hong@tokyo-voice-ai.com', 
      phone: '(555) 345-6789',
      score: 89,
      stage: 'Cultivated',
      lifetimeValue: 7500,
      title: 'Technical Lead',
      company: 'Tokyo Voice AI Team',
      notes: 'Technical lead for the voice AI implementation. Specializes in real-time audio processing.',
      lastContact: '2024-10-25',
      source: 'Tokyo Voice AI Hackathon'
    },
    { 
      id: 'datz', 
      firstName: 'Datz', 
      lastName: 'Daito', 
      email: 'datz@tokyo-voice-ai.com', 
      phone: '(555) 456-7890',
      score: 87,
      stage: 'Cultivated',
      lifetimeValue: 7000,
      title: 'Integration Specialist',
      company: 'Tokyo Voice AI Team',
      notes: 'Integration specialist focusing on CRM system integration and API development.',
      lastContact: '2024-10-25',
      source: 'Tokyo Voice AI Hackathon'
    },
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

  const handleContactClick = (contact: any) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

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
                  <tr key={contact.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleContactClick(contact)}>
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        {contact.imageUrl ? (
                          <img 
                            src={contact.imageUrl} 
                            alt={`${contact.firstName} ${contact.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900" style={{ fontFamily: branding.fonts.body }}>
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.title && (
                            <div className="text-sm text-gray-500">{contact.title}</div>
                          )}
                        </div>
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

      {/* Contact Detail Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {selectedContact.imageUrl ? (
                    <img 
                      src={selectedContact.imageUrl} 
                      alt={`${selectedContact.firstName} ${selectedContact.lastName}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-2xl">
                        {selectedContact.firstName.charAt(0)}{selectedContact.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h2>
                    {selectedContact.title && (
                      <p className="text-lg text-gray-600">{selectedContact.title}</p>
                    )}
                    {selectedContact.company && (
                      <p className="text-sm text-gray-500">{selectedContact.company}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedContact.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedContact.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Source</label>
                    <p className="text-gray-900">{selectedContact.source || 'Unknown'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Score</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: branding.fonts.numeric }}>
                        {selectedContact.score}
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${selectedContact.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stage</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedContact.stage)}`}>
                      {selectedContact.stage}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Lifetime Value</label>
                    <p className="text-2xl font-bold text-green-600" style={{ fontFamily: branding.fonts.numeric }}>
                      ${selectedContact.lifetimeValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedContact.notes && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900 mt-1 p-4 bg-gray-50 rounded-lg">
                    {selectedContact.notes}
                  </p>
                </div>
              )}

              {/* Last Contact */}
              {selectedContact.lastContact && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-500">Last Contact</label>
                  <p className="text-gray-900">{new Date(selectedContact.lastContact).toLocaleDateString()}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: branding.primary }}
                >
                  Edit Contact
                </Button>
                <Button variant="outline" className="flex-1">
                  Send Email
                </Button>
                <Button variant="outline" className="flex-1">
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
