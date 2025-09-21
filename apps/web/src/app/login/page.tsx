'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCognitoLogin = () => {
    setIsLoading(true);
    // Redirect to Cognito Hosted UI
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    
    const authUrl = `https://${cognitoDomain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=email+openid+profile`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to CRMblr</CardTitle>
            <CardDescription>
              Sign in to access your CRM workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCognitoLogin}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Cognito'}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Try our demo tenants with pre-seeded data:
              </p>
              
              {DEMO_TENANTS.map((tenant) => (
                <div key={tenant.slug} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{tenant.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {tenant.slug}.crmblr.com
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <a 
                        href={`https://${tenant.slug}.crmblr.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit
                      </a>
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Owner: {tenant.users[0].email}</p>
                    <p>Admin: {tenant.users[1].email}</p>
                    <p>Password: {tenant.users[0].password}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
