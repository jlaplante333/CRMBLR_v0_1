'use client';

import { useState } from 'react';

interface CalendarEvent {
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
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  event?: CalendarEvent;
  selectedDate?: string;
}

export function EventModal({ isOpen, onClose, onSave, event, selectedDate }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || selectedDate || '',
    time: event?.time || '',
    endTime: event?.endTime || '',
    location: event?.location || '',
    type: event?.type || 'Meeting',
    description: event?.description || '',
    attendees: event?.attendees?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      title: formData.title,
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime || undefined,
      location: formData.location || undefined,
      type: formData.type as CalendarEvent['type'],
      description: formData.description || undefined,
      attendees: formData.attendees ? formData.attendees.split(',').map(email => email.trim()) : undefined
    };

    onSave(eventData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Create Event'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Event">Event</option>
                  <option value="Fundraiser">Fundraiser</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location or meeting link"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendees
              </label>
              <input
                type="text"
                value={formData.attendees}
                onChange={(e) => handleChange('attendees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email addresses separated by commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event description"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
