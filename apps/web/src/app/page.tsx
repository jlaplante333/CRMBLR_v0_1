'use client';

import { useState } from 'react';
import { Button, Input } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import Link from 'next/link';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

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
      normalizedEmail.includes('admin@crmblr.com') ||
      normalizedEmail.endsWith('@crmblr.com')
    );

    const userType = isSuperuser ? 'superuser' :
      normalizedEmail.includes('makelit') ? 'makelit' :
      normalizedEmail.includes('1in6') ? '1in6' :
      normalizedEmail.includes('fallenfruit') ? 'fallenfruit' :
      normalizedEmail.includes('homeboy') ? 'homeboy' : 'makelit';
    
    setTimeout(() => {
      window.location.href = `/workspaces?user=${userType}`;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-gray-900">CRMblr</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#how-it-works" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">How It Works</Link>
              <Link href="#features" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Features</Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Testimonials</Link>
              <Link href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Pricing</Link>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
                <Link href="/signup">Schedule Demo</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 mb-8">
              🚀 Launch Special: 50% Off Setup
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Nonprofit's Data,<br />
              <span className="text-blue-600">Instantly Organized</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Our nonprofit experts custom-configure your CRM using your existing data. 
              No expensive consultants. No six-month implementations. Just a personalized system ready in 5 days.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-semibold">
                <Link href="/signup">Schedule Your Demo</Link>
              </Button>
              <Button variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-md text-lg font-semibold">
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">5 Days</div>
                <div className="text-lg text-gray-600 font-medium">Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">$45K</div>
                <div className="text-lg text-gray-600 font-medium">Avg Savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-lg text-gray-600 font-medium">Adoption Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Nonprofits Choose CRMblr */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Nonprofits Choose CRMblr</h2>
            <p className="text-xl text-gray-600">Real expertise. Personal attention. Fair pricing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nonprofit Veterans</h3>
              <p className="text-gray-600">Built by people who've actually run nonprofits and understand your challenges</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">5-Day Setup</h3>
              <p className="text-gray-600">Expert developers configure your system rapidly without sacrificing quality</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Support</h3>
              <p className="text-gray-600">Real humans guide you through adoption - we succeed when you succeed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mission-Aligned Pricing</h3>
              <p className="text-gray-600">Fair, transparent pricing because we believe in your work</p>
            </div>
          </div>
        </div>
      </section>

      {/* How CRMblr Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How CRMblr Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to transform your nonprofit's data management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">We Understand</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our team analyzes your organization's structure, programs, donors, and operations with nonprofit expertise. 
                We know what matters because we've been there.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">We Configure</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Expert developers custom-configure your CRM with your contacts, donation history, grant pipeline, and workflows. 
                Everything is tailored to match your organization's unique needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">You Succeed</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Your team gets personal support during the critical adoption phase. 
                We're here to ensure success because we understand the nonprofit journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built by Nonprofit People, For Nonprofit People</h2>
            <p className="text-xl text-gray-600">Every feature configured with deep understanding of your mission</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Configuration</h3>
              <p className="text-gray-600">Our nonprofit specialists carefully migrate your donor data, grant history, and organizational structure with attention to detail.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalized Design</h3>
              <p className="text-gray-600">Thoughtfully customized with your branding, terminology, and workflows. Built by people who understand nonprofit culture.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Unified Dashboard</h3>
              <p className="text-gray-600">See donations, grants, contacts, and operations in one place. Real-time metrics for board reporting.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Field Operations</h3>
              <p className="text-gray-600">Mobile-ready for staff and volunteers. Track service requests, events, and community engagement on the go.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Pipelines</h3>
              <p className="text-gray-600">Donor cultivation stages configured for your programs. Move contacts from identified to stewarded automatically.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ongoing Support</h3>
              <p className="text-gray-600">Personal attention during your critical adoption phase. We're here to ensure your team succeeds, not just deliver software.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nonprofits Love CRMblr</h2>
            <p className="text-xl text-gray-600">Join organizations saving time and raising more</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                "As a development professional, I know how critical it is to have donor data that's both accessible and actionable. 
                The challenge is that most CRM systems are either too complex for small teams or too generic to be useful."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">SF</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Fundsby</div>
                  <div className="text-gray-600">Associate Director of Development, Major Public University</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                "The nonprofit sector desperately needs technology solutions that actually work for our unique challenges. 
                Too often we're forced into systems built for corporate sales teams, not mission-driven organizations."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">JG</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">John Grantsman</div>
                  <div className="text-gray-600">Director of Grants</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                "Running a nonprofit, I spent countless hours trying to wrangle data from spreadsheets, donor databases, and grant tracking systems. 
                I built CRMblr because nonprofits deserve technology that works as hard as we do—without the six-month implementation nightmare."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">LS</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Laurie Sartain</div>
                  <div className="text-gray-600">Founder, CRMblr | Former Executive Director, MAKE Lit, NFP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your team size</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Small Teams */}
            <div className="bg-white p-8 rounded-lg shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Small Teams</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$500</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="mb-6">
                <span className="text-lg text-gray-600 line-through">$1,000</span>
                <span className="text-lg font-semibold text-green-600 ml-2">$500 setup fee</span>
                <div className="text-sm text-gray-500">(50% off launch special)</div>
              </div>
              <div className="mb-6">
                <div className="text-lg font-semibold text-gray-900 mb-4">Up to 5 users</div>
                <ul className="space-y-3 text-gray-600">
                  <li>• Automated data migration</li>
                  <li>• Custom branding & configuration</li>
                  <li>• 5 user accounts</li>
                  <li>• Mobile app access</li>
                  <li>• Real-time dashboards</li>
                  <li>• Quarterly data updates</li>
                  <li>• Email support</li>
                  <li>• Training & onboarding</li>
                </ul>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold">
                Get Started
              </Button>
            </div>

            {/* Medium Teams */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">MOST POPULAR</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Medium Teams</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$1,000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="mb-6">
                <span className="text-lg text-gray-600 line-through">$2,000</span>
                <span className="text-lg font-semibold text-green-600 ml-2">$1,000 setup fee</span>
                <div className="text-sm text-gray-500">(50% off launch special)</div>
              </div>
              <div className="mb-6">
                <div className="text-lg font-semibold text-gray-900 mb-4">Up to 10 users</div>
                <ul className="space-y-3 text-gray-600">
                  <li>• Automated data migration</li>
                  <li>• Custom branding & configuration</li>
                  <li>• 10 user accounts</li>
                  <li>• Mobile app access</li>
                  <li>• Real-time dashboards</li>
                  <li>• Quarterly data updates</li>
                  <li>• Priority email & chat support</li>
                  <li>• Training & onboarding</li>
                  <li>• Monthly check-ins</li>
                </ul>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold">
                Get Started
              </Button>
            </div>

            {/* Unlimited */}
            <div className="bg-white p-8 rounded-lg shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Unlimited</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$2,000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="mb-6">
                <span className="text-lg text-gray-600 line-through">$4,000</span>
                <span className="text-lg font-semibold text-green-600 ml-2">$2,000 setup fee</span>
                <div className="text-sm text-gray-500">(50% off launch special)</div>
              </div>
              <div className="mb-6">
                <div className="text-lg font-semibold text-gray-900 mb-4">Unlimited users</div>
                <ul className="space-y-3 text-gray-600">
                  <li>• Automated data migration</li>
                  <li>• Custom branding & configuration</li>
                  <li>• Unlimited user accounts</li>
                  <li>• Mobile app access</li>
                  <li>• Real-time dashboards</li>
                  <li>• Quarterly data updates</li>
                  <li>• Dedicated support channel</li>
                  <li>• Training & onboarding</li>
                  <li>• Weekly check-ins</li>
                  <li>• Custom integrations</li>
                </ul>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Let's Talk About Your Nonprofit's Needs</h2>
            <p className="text-xl text-gray-600">Schedule a conversation with someone who understands the nonprofit world</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <Input 
                    type="text" 
                    className="w-full h-12 border-2 border-gray-200 rounded-md px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                  <Input 
                    type="text" 
                    className="w-full h-12 border-2 border-gray-200 rounded-md px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <Input 
                    type="email" 
                    className="w-full h-12 border-2 border-gray-200 rounded-md px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Title (Optional)</label>
                  <Input 
                    type="text" 
                    className="w-full h-12 border-2 border-gray-200 rounded-md px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                  <Input 
                    type="tel" 
                    className="w-full h-12 border-2 border-gray-200 rounded-md px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Budget Range (Optional)</label>
                  <select className="w-full h-12 border-2 border-gray-200 rounded-md px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <option>Select budget range</option>
                    <option>Under $500K</option>
                    <option>$500K - $1M</option>
                    <option>$1M - $5M</option>
                    <option>$5M - $10M</option>
                    <option>Over $10M</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current CRM (Optional)</label>
                <Input 
                  type="text" 
                  className="w-full h-12 border-2 border-gray-200 rounded-md px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="text-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-semibold">
                  Schedule Demo
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-lg mx-auto px-6">
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
                  className="w-full h-14 border-2 border-gray-200 rounded-xl text-lg px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 border-2 border-gray-200 rounded-xl text-lg px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xl shadow-lg hover:shadow-xl transition-all"
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
                        <p className="text-gray-600">{tenant.slug}.crmblr.com</p>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
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
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">CRMblr</h3>
              <p className="text-gray-400">The nonprofit CRM that builds itself from your data.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#about" className="hover:text-white">About Us</Link></li>
                <li><Link href="#contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#security" className="hover:text-white">Security</Link></li>
                <li><Link href="#privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 CRMblr. All rights reserved. | Built with ❤️ for nonprofits</p>
          </div>
        </div>
      </footer>
    </div>
  );
}