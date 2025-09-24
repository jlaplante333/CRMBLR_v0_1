'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import { getTenantBranding } from '@/lib/branding-service';
import { disconnectIntegration } from '@/lib/payments';
import { useState, useMemo } from 'react';

type TimePeriod = 'today' | 'thisWeek' | 'thisMonth' | 'nextMonth' | 'next3Months';

// Calendar Grid Component
function CalendarGrid({ events }: { events: CalendarEvent[] }) {
  const year = 2025;
  const month = 8; // September (0-indexed)
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Create array of days for the calendar
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };
  
  const isToday = (day: number) => {
    return day === 24; // September 24th, 2025
  };
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-white rounded-lg border">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
              day === null ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
            } ${isToday(day) ? 'bg-blue-50 border-blue-300' : ''}`}
          >
            {day && (
              <>
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {getEventsForDate(day).map(event => (
                    <div 
                      key={event.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${
                        event.type === 'Meeting' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'Event' ? 'bg-purple-100 text-purple-800' :
                        event.type === 'Fundraiser' ? 'bg-green-100 text-green-800' :
                        event.type === 'Deadline' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                      title={`${event.title} - ${event.time} at ${event.location}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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

  // Mock calendar events with realistic dates - September 2025
  const currentYear = 2025;
  const currentMonth = 8; // September (0-indexed)
  const currentDay = 24; // Today is September 24th, 2025
  
  const allEvents: CalendarEvent[] = [
    // Today (September 24th)
    { id: 'e1', title: 'Daily Standup', date: '2025-09-24', time: '9:00 AM', location: 'Zoom', type: 'Meeting' },
    
    // This week (remaining days of September)
    { id: 'e2', title: 'Major Donor Meeting - Alex Nguyen', date: '2025-09-25', time: '10:00 AM', location: 'Zoom', type: 'Meeting' },
    { id: 'e3', title: 'Grant Application Review', date: '2025-09-26', time: '2:00 PM', location: 'Conference Room A', type: 'Meeting' },
    { id: 'e4', title: 'Volunteer Training Session', date: '2025-09-27', time: '6:00 PM', location: 'Community Center', type: 'Event' },
    { id: 'e5', title: 'Open Bar Friendraiser', date: '2025-09-28', time: '6:00 PM', location: 'Downtown Taproom', type: 'Fundraiser' },
    
    // This month (September 2025)
    { id: 'e6', title: 'Board Meeting', date: '2025-09-15', time: '7:00 PM', location: 'HQ Conference Room', type: 'Meeting' },
    { id: 'e7', title: 'Fundraising Gala', date: '2025-09-30', time: '7:00 PM', location: 'Grand Ballroom', type: 'Fundraiser' },
    
    // Next month (October 2025)
    { id: 'e8', title: 'Monthly Newsletter Release', date: '2025-10-01', time: '9:00 AM', location: 'Email', type: 'Event' },
    { id: 'e9', title: 'Donor Appreciation Event', date: '2025-10-05', time: '6:00 PM', location: 'Downtown Taproom', type: 'Event' },
    { id: 'e10', title: 'Strategic Planning Retreat', date: '2025-10-10', time: '9:00 AM', location: 'Mountain Lodge', type: 'Meeting' },
    { id: 'e11', title: 'Annual Report Deadline', date: '2025-10-15', time: '5:00 PM', location: 'Online', type: 'Deadline' },
    
    // Next 3 months
    { id: 'e12', title: 'Halloween Fundraiser', date: '2025-10-31', time: '6:00 PM', location: 'Community Center', type: 'Fundraiser' },
    { id: 'e13', title: 'Volunteer Recognition Ceremony', date: '2025-11-20', time: '5:00 PM', location: 'Community Hall', type: 'Event' },
    { id: 'e14', title: 'Q4 Board Review', date: '2025-12-01', time: '10:00 AM', location: 'HQ Conference Room', type: 'Meeting' },
  ];

  const getDateRange = (period: TimePeriod) => {
    // Use September 24th, 2025 as today
    const today = new Date(2025, 8, 24); // September 24th, 2025
    
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
        const startOfMonth = new Date(2025, 8, 1); // September 1st, 2025
        const endOfMonth = new Date(2025, 9, 1); // October 1st, 2025
        return { start: startOfMonth, end: endOfMonth };
      
      case 'nextMonth':
        const startOfNextMonth = new Date(2025, 9, 1); // October 1st, 2025
        const endOfNextMonth = new Date(2025, 10, 1); // November 1st, 2025
        return { start: startOfNextMonth, end: endOfNextMonth };
      
      case 'next3Months':
        const startOfNext3Months = new Date(2025, 9, 1); // October 1st, 2025
        const endOfNext3Months = new Date(2026, 0, 1); // January 1st, 2026
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
          <CardTitle>Calendar Grid View</CardTitle>
          <CardDescription>September 2025 - Events displayed on their dates</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarGrid events={allEvents} />
        </CardContent>
      </Card>
    </div>
  );
}


