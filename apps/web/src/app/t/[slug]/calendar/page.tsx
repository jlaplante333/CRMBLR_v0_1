'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import { getTenantBranding } from '@/lib/branding-service';
import { disconnectIntegration } from '@/lib/payments';

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);
  const branding = getTenantBranding(slug);

  if (!tenant) return <div>Tenant not found</div>;

  const events = [
    { id: 'e1', title: 'Major Donor Meeting - Alex Nguyen', date: '2025-10-02 10:00 AM', location: 'Zoom', type: 'Meeting' },
    { id: 'e2', title: 'Open Bar Friendraiser', date: '2025-10-08 6:00 PM', location: 'Downtown Taproom', type: 'Event' },
    { id: 'e3', title: 'Board Development Committee', date: '2025-10-12 1:00 PM', location: 'HQ Conference Room', type: 'Meeting' },
  ];

  const typeClass = (t: string) => t === 'Event' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';

  const handleDeactivate = () => {
    // Disconnect Google Calendar integration
    disconnectIntegration(slug, 'google');
    // Redirect to dashboard
    router.push(`/t/${slug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>Calendar</h1>
          <p className="text-gray-600" style={{ fontFamily: branding.fonts.body }}>Simulated Google Calendar events</p>
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
          <CardTitle>Upcoming</CardTitle>
          <CardDescription>Pulled from Google Calendar (demo)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{ev.title}</div>
                  <div className="text-sm text-gray-600">{ev.date} — {ev.location}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${typeClass(ev.type)}`}>{ev.type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


