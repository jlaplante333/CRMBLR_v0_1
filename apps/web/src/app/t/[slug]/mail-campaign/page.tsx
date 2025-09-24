'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import { getTenantBranding } from '@/lib/branding-service';
import { disconnectIntegration } from '@/lib/payments';

export default function MailCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);
  const branding = getTenantBranding(slug);

  if (!tenant) return <div>Tenant not found</div>;

  const campaigns = [
    { id: 'mc1', name: 'Fall Fundraiser', status: 'Scheduled', sendDate: '2025-10-05', audience: 2400, openRate: 0.42, clickRate: 0.09 },
    { id: 'mc2', name: 'September Newsletter', status: 'Sent', sendDate: '2025-09-01', audience: 2200, openRate: 0.38, clickRate: 0.07 },
    { id: 'mc3', name: 'Volunteer Drive', status: 'Draft', sendDate: '—', audience: 1950, openRate: 0.0, clickRate: 0.0 },
  ];

  const handleDeactivate = () => {
    // Disconnect Mailchimp integration
    disconnectIntegration(slug, 'mailchimp');
    // Redirect to dashboard
    router.push(`/t/${slug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>Mail campaign</h1>
          <p className="text-gray-600" style={{ fontFamily: branding.fonts.body }}>Simulated Mailchimp campaigns</p>
        </div>
        <Button 
          onClick={handleDeactivate}
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Deactivate Integration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Data fetched from Mailchimp (demo)</CardDescription>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Create Campaign</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Send Date</th>
                  <th className="text-left py-2">Audience</th>
                  <th className="text-left py-2">Open Rate</th>
                  <th className="text-left py-2">Click Rate</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'Sent' ? 'bg-green-100 text-green-800' : c.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{c.status}</span>
                    </td>
                    <td className="py-2">{c.sendDate}</td>
                    <td className="py-2">{c.audience.toLocaleString()}</td>
                    <td className="py-2">{Math.round(c.openRate * 100)}%</td>
                    <td className="py-2">{Math.round(c.clickRate * 100)}%</td>
                    <td className="py-2"><Button variant="outline" size="sm">View</Button></td>
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


