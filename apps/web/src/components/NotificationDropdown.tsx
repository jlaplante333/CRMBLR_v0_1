'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'meeting' | 'deadline' | 'donation' | 'grant';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'deadline':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'donation':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'grant':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586-2.586a2 2 0 012.828 0L12 6l-2.586 2.586a2 2 0 01-2.828 0L4.828 7z" />
          </svg>
        );
    }
  };

  const formatTime = (time: string) => {
    const now = new Date();
    const notificationTime = new Date(time);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586-2.586a2 2 0 012.828 0L12 6l-2.586 2.586a2 2 0 01-2.828 0L4.828 7z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM4.828 7l2.586-2.586a2 2 0 012.828 0L12 6l-2.586 2.586a2 2 0 01-2.828 0L4.828 7z" />
                  </svg>
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          onMarkAsRead(notification.id);
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 ml-2">
                              {formatTime(notification.time)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Hook to manage notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mock notifications - in a real app, these would come from an API
    const mockNotifications: Notification[] = [
      {
        id: 'n1',
        type: 'meeting',
        title: 'Upcoming Meeting',
        message: 'Daily Standup starts in 15 minutes',
        time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/t/makelit/calendar'
      },
      {
        id: 'n2',
        type: 'deadline',
        title: 'Grant Deadline Approaching',
        message: 'IACA Report is due in 8 days',
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/t/makelit/grants'
      },
      {
        id: 'n3',
        type: 'donation',
        title: 'New Donation Received',
        message: '$500 donation from John Smith',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        actionUrl: '/t/makelit/donations'
      },
      {
        id: 'n4',
        type: 'meeting',
        title: 'Meeting Reminder',
        message: 'Major Donor Meeting with Alex Nguyen tomorrow at 10:00 AM',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/t/makelit/calendar'
      },
      {
        id: 'n5',
        type: 'grant',
        title: 'Grant Application Status',
        message: 'Your Q4 Grant Application has been approved',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        actionUrl: '/t/makelit/grants'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead
  };
}
