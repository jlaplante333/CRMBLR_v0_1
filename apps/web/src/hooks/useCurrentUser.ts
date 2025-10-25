import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  tenants: {
    tenantId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
  }[];
}

export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate user authentication - in a real app, this would come from JWT/session
    const simulateUserLogin = () => {
      // For demo purposes, we'll simulate different user scenarios
      const urlParams = new URLSearchParams(window.location.search);
      const demoUser = urlParams.get('user') || 'makelit';
      
      let userData: User;
      
      switch (demoUser) {
        case 'makelit':
          userData = {
            id: 'user-makelit',
            email: 'sofia@makemag.org',
            name: 'Sofia Rodriguez',
            tenants: [{ tenantId: 'demo-makelit', role: 'owner' }]
          };
          break;
        case '1in6':
          userData = {
            id: 'user-1in6',
            email: 'ops@1in6.org',
            name: 'Operations Manager',
            tenants: [{ tenantId: 'demo-oneinsix', role: 'admin' }]
          };
          break;
        case 'fallenfruit':
          userData = {
            id: 'user-fallenfruit',
            email: 'team@fallenfruit.org',
            name: 'Team Lead',
            tenants: [{ tenantId: 'demo-fallenfruit', role: 'owner' }]
          };
          break;
        case 'homeboy':
          userData = {
            id: 'user-homeboy',
            email: 'it@homeboyindustries.org',
            name: 'IT Manager',
            tenants: [{ tenantId: 'demo-homeboy', role: 'admin' }]
          };
          break;
        case 'superuser':
          // Superuser can see all tenants - determine user based on URL params
          const urlParams = new URLSearchParams(window.location.search);
          const userEmail = urlParams.get('email') || 'jon@crmblr.com';
          
          // Map emails to names
          const emailToName: { [key: string]: string } = {
            'jon@crmblr.com': 'Jon Crmblr',
            'laurie@crmblr.com': 'Laurie Sartain',
            'jon@vcrm.com': 'Jon V-CRM',
            'yosuke@vcrm.com': 'Yosuke Yasuda',
            'avi@vcrm.com': 'Avi V-CRM',
            'axlrose@vcrm.com': 'Axl Rose'
          };
          
          userData = {
            id: 'user-superuser',
            email: userEmail,
            name: emailToName[userEmail] || 'Super User',
            tenants: userEmail === 'jon@vcrm.com' ? [
              // For jon@vcrm.com, show Tokyo AI, Alex.Ai, and Bye: AI tenants
              { tenantId: 'tokyo-voice-ai', role: 'admin' },
              { tenantId: 'alex-ai', role: 'admin' },
              { tenantId: 'bye-ai', role: 'admin' }
            ] : [
              // For other superusers, show all tenants
              { tenantId: 'demo-makelit', role: 'admin' },
              { tenantId: 'demo-oneinsix', role: 'admin' },
              { tenantId: 'demo-fallenfruit', role: 'admin' },
              { tenantId: 'demo-homeboy', role: 'admin' },
              { tenantId: 'tokyo-voice-ai', role: 'admin' },
              { tenantId: 'alex-ai', role: 'admin' },
              { tenantId: 'bye-ai', role: 'admin' }
            ]
          };
          break;
        default:
          // Default to makelit user
          userData = {
            id: 'user-makelit',
            email: 'sofia@makemag.org',
            name: 'Sofia Rodriguez',
            tenants: [{ tenantId: 'demo-makelit', role: 'owner' }]
          };
      }
      
      return userData;
    };

    const userData = simulateUserLogin();
    setUser(userData);
  }, []);

  return user;
}
