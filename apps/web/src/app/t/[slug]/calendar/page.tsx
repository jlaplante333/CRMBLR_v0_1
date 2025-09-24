'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import { getTenantBranding } from '@/lib/branding-service';
import { disconnectIntegration } from '@/lib/payments';
import { useState, useMemo } from 'react';

type TimePeriod = 'today' | 'thisWeek' | 'thisMonth' | 'nextMonth' | 'next3Months';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM AM/PM format
  location: string;
  type: 'Meeting' | 'Event' | 'Deadline' | 'Fundraiser';
  description?: string;
}

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);
  const branding = getTenantBranding(slug);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('thisMonth');

  if (!tenant) return <div>Tenant not found</div>;

  // Mock calendar events with realistic dates
  const allEvents: CalendarEvent[] = [
    // Today
    { id: 'e1', title: 'Daily Standup', date: new Date().toISOString().split('T')[0], time: '9:00 AM', location: 'Zoom', type: 'Meeting' },
    
    // This week
    { id: 'e2', title: 'Major Donor Meeting - Alex Nguyen', date: '2025-01-15', time: '10:00 AM', location: 'Zoom', type: 'Meeting' },
    { id: 'e3', title: 'Grant Application Review', date: '2025-01-16', time: '2:00 PM', location: 'Conference Room A', type: 'Meeting' },
    { id: 'e4', title: 'Volunteer Training Session', date: '2025-01-17', time: '6:00 PM', location: 'Community Center', type: 'Event' },
    
    // This month
    { id: 'e5', title: 'Board Meeting', date: '2025-01-20', time: '7:00 PM', location: 'HQ Conference Room', type: 'Meeting' },
    { id: 'e6', title: 'Open Bar Friendraiser', date: '2025-01-22', time: '6:00 PM', location: 'Downtown Taproom', type: 'Fundraiser' },
    { id: 'e7', title: 'Fundraising Gala', date: '2025-01-25', time: '7:00 PM', location: 'Grand Ballroom', type: 'Fundraiser' },
    { id: 'e8', title: 'Grant Deadline - MacArthur Foundation', date: '2025-01-28', time: '11:59 PM', location: 'Online', type: 'Deadline' },
    
    // Next month
    { id: 'e9', title: 'Monthly Newsletter Release', date: '2025-02-01', time: '9:00 AM', location: 'Email', type: 'Event' },
    { id: 'e10', title: 'Donor Appreciation Event', date: '2025-02-05', time: '6:00 PM', location: 'Downtown Taproom', type: 'Event' },
    { id: 'e11', title: 'Strategic Planning Retreat', date: '2025-02-10', time: '9:00 AM', location: 'Mountain Lodge', type: 'Meeting' },
    { id: 'e12', title: 'Annual Report Deadline', date: '2025-02-15', time: '5:00 PM', location: 'Online', type: 'Deadline' },
    
    // Next 3 months
    { id: 'e13', title: 'Spring Fundraiser', date: '2025-03-15', time: '6:00 PM', location: 'Garden Venue', type: 'Fundraiser' },
    { id: 'e14', title: 'Volunteer Recognition Ceremony', date: '2025-03-20', time: '5:00 PM', location: 'Community Hall', type: 'Event' },
    { id: 'e15', title: 'Q1 Board Review', date: '2025-04-01', time: '10:00 AM', location: 'HQ Conference Room', type: 'Meeting' },
  ];

  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return { start: startOfWeek, end: endOfWeek };
      
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { start: startOfMonth, end: endOfMonth };
      
      case 'nextMonth':
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
        return { start: startOfNextMonth, end: endOfNextMonth };
      
      case 'next3Months':
        const startOfNext3Months = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const endOfNext3Months = new Date(today.getFullYear(), today.getMonth() + 4, 1);
        return { start: startOfNext3Months, end: endOfNext3Months };
      
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  const filteredEvents = useMemo(() => {
    const { start, end } = getDateRange(selectedPeriod);
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate < end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedPeriod]);

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'today': return 'Today';
      case 'thisWeek': return 'This Week';
      case 'thisMonth': return 'This Month';
      case 'nextMonth': return 'Next Month';
      case 'next3Months': return 'Next 3 Months';
      default: return 'This Month';
    }
  };

  const typeClass = (type: string) => {
    switch (type) {
      case 'Event': return 'bg-purple-100 text-purple-800';
      case 'Meeting': return 'bg-blue-100 text-blue-800';
      case 'Fundraiser': return 'bg-green-100 text-green-800';
      case 'Deadline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

      {/* Time Period Filter */}
      <Card>
        <CardHeader>
          <CardTitle>View Events</CardTitle>
          <CardDescription>Select a time period to filter events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['today', 'thisWeek', 'thisMonth', 'nextMonth', 'next3Months'] as TimePeriod[]).map(period => (
              <Button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                className={selectedPeriod === period ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
              >
                {getPeriodLabel(period)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>{getPeriodLabel(selectedPeriod)} Events</CardTitle>
          <CardDescription>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No events scheduled for {getPeriodLabel(selectedPeriod).toLowerCase()}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{event.title}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} at {event.time}
                    </div>
                    <div className="text-sm text-gray-500">📍 {event.location}</div>
                    {event.description && (
                      <div className="text-sm text-gray-600 mt-2">{event.description}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeClass(event.type)}`}>
                      {event.type}
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Grid View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>Monthly calendar grid for {getPeriodLabel(selectedPeriod).toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium mb-2">Calendar Grid View</p>
            <p className="text-sm">Full calendar grid view coming soon...</p>
            <p className="text-xs text-gray-400 mt-2">This would show a traditional monthly calendar with events displayed on their respective dates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


