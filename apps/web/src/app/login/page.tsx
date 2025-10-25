'use client';

import { useState } from 'react';
import { Button, Input } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const router = useRouter();

  const handleCognitoLogin = () => {
    setIsLoading(true);
    // Redirect to Cognito Hosted UI
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);

    const authUrl = `https://${cognitoDomain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=email+openid+profile`;

    window.location.href = authUrl;
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // For demo purposes, redirect to workspace picker with user context
    // In a real app, this would authenticate and get user permissions
    const normalizedEmail = email.trim().toLowerCase();
    const isSuperuser = (
      (normalizedEmail === 'jon@crmblr.com' && password === 'test123') ||
      (normalizedEmail === 'laurie@crmblr.com' && password === 'test123') ||
      (normalizedEmail === 'jon@vcrm.com' && password === 'test123') ||
      (normalizedEmail === 'yosuke@vcrm.com' && password === 'test123') ||
      (normalizedEmail === 'avi@vcrm.com' && password === 'test123') ||
      (normalizedEmail === 'axlrose@vcrm.com' && password === 'test123') ||
      normalizedEmail.includes('admin@crmblr.com') ||
      normalizedEmail.endsWith('@crmblr.com') ||
      normalizedEmail.endsWith('@vcrm.com')
    );

    const userType = isSuperuser ? 'superuser' :
      normalizedEmail.includes('makelit') ? 'makelit' :
      normalizedEmail.includes('1in6') ? '1in6' :
      normalizedEmail.includes('fallenfruit') ? 'fallenfruit' :
      normalizedEmail.includes('homeboy') ? 'homeboy' : 'makelit';
    
    // Use Next.js router for navigation
    router.push(`/workspaces?user=${userType}&email=${encodeURIComponent(normalizedEmail)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-xl p-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome Back</h2>
            <p className="text-xl text-gray-600">Sign in to access your CRM workspace</p>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-8">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 border-2 border-gray-200 rounded-xl text-lg px-4 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 border-2 border-gray-200 rounded-xl text-lg px-4 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Cognito Login */}
          <div className="mt-8">
            <Button
              onClick={handleCognitoLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full h-14 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-lg font-semibold"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Sign in with Cognito
            </Button>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-green-600 hover:text-green-700 transition-colors text-lg font-medium"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Demo Accounts Toggle */}
          <div className="mt-10">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full text-center text-gray-600 hover:text-gray-900 transition-colors text-lg font-medium"
            >
              {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
            </button>
          </div>

          {/* Demo Accounts */}
          {showDemoAccounts && (
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <p className="text-gray-600 text-lg mb-6">Try our demo tenants with pre-seeded data:</p>
              </div>
              
              {DEMO_TENANTS.map((tenant) => (
                <div key={tenant.slug} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{tenant.name}</h4>
                      <p className="text-gray-600">{tenant.slug}.vcrm.com</p>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                      asChild
                    >
                      <Link href={`/t/${tenant.slug}`}>
                        Visit
                      </Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500 font-medium">Owner:</span>
                      <br />
                      {tenant.users[0].email}
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Password:</span>
                      <br />
                      {tenant.users[0].password}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
