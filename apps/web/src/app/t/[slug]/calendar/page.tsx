'use client';

import { useParams, useRouter } from 'next/navigation';
import { DEMO_TENANTS } from '@crmblr/types';
import { getTenantBranding } from '@/lib/branding-service';
import { disconnectIntegration } from '@/lib/payments';
import { EventModal } from '@/components/EventModal';

type ViewMode = 'month' | 'week' | 'day';
type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  type: 'Meeting' | 'Event' | 'Deadline' | 'Fundraiser' | 'Personal';
  description?: string;
  attendees?: string[];
  color?: string;
};

// Google Calendar-like header component
function CalendarHeader({ 
  currentDate, 
  onDateChange, 
  viewMode, 
  onViewModeChange,
  onAddEvent 
}: {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddEvent: () => void;
}) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatDateRange = () => {
    if (viewMode === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      } else {
        return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Today
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-normal text-gray-900 min-w-[200px]">
            {formatDateRange()}
          </h2>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        
        <button
          onClick={onAddEvent}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create
        </button>
      </div>
    </div>
  );
}

// Month view component
function MonthView({ currentDate, events, onEventClick }: { currentDate: Date; events: CalendarEvent[]; onEventClick?: (event: CalendarEvent) => void }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };
  
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };
  
  const isOtherMonth = (day: number) => {
    return day === null;
  };
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentDay = isToday(day);
          const isOtherMonthDay = isOtherMonth(day);
          
          return (
          <div 
            key={index} 
            className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                isOtherMonthDay ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'
              } ${isCurrentDay ? 'bg-blue-50 border-blue-300' : ''}`}
          >
            {day && (
              <>
                <div className={`text-sm font-medium mb-1 ${
                    isCurrentDay ? 'text-blue-600 font-semibold' : 
                    isOtherMonthDay ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                    <div 
                      key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={`text-xs p-1 rounded cursor-pointer truncate hover:opacity-80 ${
                          event.type === 'Meeting' ? 'bg-blue-100 text-blue-800 border-l-2 border-blue-500' :
                          event.type === 'Event' ? 'bg-purple-100 text-purple-800 border-l-2 border-purple-500' :
                          event.type === 'Fundraiser' ? 'bg-green-100 text-green-800 border-l-2 border-green-500' :
                          event.type === 'Deadline' ? 'bg-red-100 text-red-800 border-l-2 border-red-500' :
                          'bg-gray-100 text-gray-800 border-l-2 border-gray-500'
                        }`}
                        title={`${event.title} - ${event.time}${event.location ? ` at ${event.location}` : ''}`}
                    >
                      {event.title}
                    </div>
                  ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                </div>
              </>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week view component
function WeekView({ currentDate, events }: { currentDate: Date; events: CalendarEvent[] }) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-3 text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200">
          Time
        </div>
        {dayNames.map((day, index) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + index);
          const isCurrentDay = isToday(date);
          
          return (
            <div 
              key={day} 
              className={`p-3 text-center text-sm font-medium border-r border-gray-200 ${
                isCurrentDay ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'
              }`}
            >
              <div>{day}</div>
              <div className={`text-lg font-semibold ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Time grid */}
      <div className="grid grid-cols-8">
        {/* Time column */}
        <div className="border-r border-gray-200">
          {hours.map(hour => (
            <div key={hour} className="h-12 border-b border-gray-100 flex items-center justify-end pr-2 text-xs text-gray-500">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}
        </div>
        
        {/* Day columns */}
        {dayNames.map((_, dayIndex) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + dayIndex);
          const dayEvents = getEventsForDate(date);
          
          return (
            <div key={dayIndex} className="border-r border-gray-200">
              {hours.map(hour => (
                <div key={hour} className="h-12 border-b border-gray-100 hover:bg-gray-50 relative">
                  {dayEvents
                    .filter(event => {
                      const eventHour = parseInt(event.time.split(':')[0]);
                      const eventMinute = parseInt(event.time.split(':')[1].split(' ')[0]);
                      const isPM = event.time.includes('PM');
                      const eventHour24 = isPM && eventHour !== 12 ? eventHour + 12 : 
                                        !isPM && eventHour === 12 ? 0 : eventHour;
                      return eventHour24 === hour;
                    })
                    .map(event => (
                      <div
                        key={event.id}
                        className={`absolute left-0 right-0 top-0 bottom-0 m-1 p-1 text-xs rounded cursor-pointer ${
                          event.type === 'Meeting' ? 'bg-blue-100 text-blue-800 border-l-2 border-blue-500' :
                          event.type === 'Event' ? 'bg-purple-100 text-purple-800 border-l-2 border-purple-500' :
                          event.type === 'Fundraiser' ? 'bg-green-100 text-green-800 border-l-2 border-green-500' :
                          event.type === 'Deadline' ? 'bg-red-100 text-red-800 border-l-2 border-red-500' :
                          'bg-gray-100 text-gray-800 border-l-2 border-gray-500'
                        }`}
                        title={`${event.title} - ${event.time}${event.location ? ` at ${event.location}` : ''}`}
                      >
                        {event.title}
                      </div>
                    ))}
          </div>
        ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Day view component
function DayView({ currentDate, events }: { currentDate: Date; events: CalendarEvent[] }) {
  const dateStr = currentDate.toISOString().split('T')[0];
  const dayEvents = events.filter(event => event.date === dateStr);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Day header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
      </div>
      
      {/* Time grid */}
      <div className="grid grid-cols-2">
        {/* Time column */}
        <div className="border-r border-gray-200">
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b border-gray-100 flex items-center justify-end pr-4 text-sm text-gray-500">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}
        </div>
        
        {/* Events column */}
        <div>
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b border-gray-100 hover:bg-gray-50 relative">
              {dayEvents
                .filter(event => {
                  const eventHour = parseInt(event.time.split(':')[0]);
                  const eventMinute = parseInt(event.time.split(':')[1].split(' ')[0]);
                  const isPM = event.time.includes('PM');
                  const eventHour24 = isPM && eventHour !== 12 ? eventHour + 12 : 
                                    !isPM && eventHour === 12 ? 0 : eventHour;
                  return eventHour24 === hour;
                })
                .map(event => (
                  <div
                    key={event.id}
                    className={`absolute left-0 right-0 top-0 bottom-0 m-2 p-2 text-sm rounded cursor-pointer ${
                      event.type === 'Meeting' ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' :
                      event.type === 'Event' ? 'bg-purple-100 text-purple-800 border-l-4 border-purple-500' :
                      event.type === 'Fundraiser' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
                      event.type === 'Deadline' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
                      'bg-gray-100 text-gray-800 border-l-4 border-gray-500'
                    }`}
                    title={`${event.title} - ${event.time}${event.location ? ` at ${event.location}` : ''}`}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs opacity-75">{event.time}</div>
                    {event.location && (
                      <div className="text-xs opacity-75">📍 {event.location}</div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);
  const branding = getTenantBranding(slug);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');

  if (!tenant) return <div>Tenant not found</div>;

  // Initialize events
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      // Today
      { id: 'e1', title: 'Daily Standup', date: '2025-01-15', time: '9:00 AM', location: 'Zoom', type: 'Meeting' },
      { id: 'e2', title: 'Client Meeting', date: '2025-01-15', time: '2:00 PM', location: 'Conference Room A', type: 'Meeting' },
      
      // This week
      { id: 'e3', title: 'Major Donor Meeting', date: '2025-01-16', time: '10:00 AM', location: 'Zoom', type: 'Meeting' },
      { id: 'e4', title: 'Grant Application Review', date: '2025-01-17', time: '2:00 PM', location: 'Conference Room A', type: 'Meeting' },
      { id: 'e5', title: 'Volunteer Training Session', date: '2025-01-18', time: '6:00 PM', location: 'Community Center', type: 'Event' },
      { id: 'e6', title: 'Open Bar Friendraiser', date: '2025-01-19', time: '6:00 PM', location: 'Downtown Taproom', type: 'Fundraiser' },
      
      // This month
      { id: 'e7', title: 'Board Meeting', date: '2025-01-20', time: '7:00 PM', location: 'HQ Conference Room', type: 'Meeting' },
      { id: 'e8', title: 'Fundraising Gala', date: '2025-01-25', time: '7:00 PM', location: 'Grand Ballroom', type: 'Fundraiser' },
      { id: 'e9', title: 'Monthly Newsletter Release', date: '2025-01-30', time: '9:00 AM', location: 'Email', type: 'Event' },
    ];
    setEvents(mockEvents);
  }, []);

  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setSelectedDate('');
    setShowAddEvent(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowAddEvent(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? { ...eventData, id: selectedEvent.id }
          : event
      ));
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `event-${Date.now()}`
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleDeactivate = () => {
    disconnectIntegration(slug, 'google');
    router.push(`/t/${slug}`);
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar-like header */}
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddEvent={handleAddEvent}
      />

      {/* Calendar view */}
      <div className="bg-white rounded-lg shadow-sm">
        {viewMode === 'month' && <MonthView currentDate={currentDate} events={events} onEventClick={handleEditEvent} />}
        {viewMode === 'week' && <WeekView currentDate={currentDate} events={events} />}
        {viewMode === 'day' && <DayView currentDate={currentDate} events={events} />}
      </div>

      {/* Integration status */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-700">Google Calendar connected</span>
        </div>
        <button
          onClick={handleDeactivate}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Disconnect
        </button>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}