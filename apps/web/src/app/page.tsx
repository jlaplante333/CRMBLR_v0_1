'use client';

import { Button, Input } from '@crmblr/ui';
import Link from 'next/link';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">CRMblr</span>
                </div>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                How It Works
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('features');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('testimonials');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Testimonials
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('pricing');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Pricing
              </button>
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                <Link href="/signup">Schedule Demo</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 mb-6">
              🚀 Launch Special: 50% Off Setup
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Nonprofit's Data,<br />
              <span className="text-gray-900">Instantly Organized</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our nonprofit experts custom-configure your CRM using your existing data. 
              No expensive consultants. No six-month implementations. Just a personalized system ready in 5 days.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-base font-semibold">
                <Link href="/signup">Schedule Your Demo</Link>
              </Button>
              <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-md text-base font-semibold">
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">5 Days</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">$45K</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Avg Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">95%</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Adoption Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">15%</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">More Donations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Nonprofits Choose CRMblr */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Nonprofits Choose CRMblr</h2>
            <p className="text-lg md:text-xl text-gray-600">Real expertise. Personal attention. Fair pricing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nonprofit Veterans</h3>
              <p className="text-gray-600 text-sm">Built by people who've actually run nonprofits and understand your challenges</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">5-Day Setup</h3>
              <p className="text-gray-600 text-sm">Expert developers configure your system rapidly without sacrificing quality</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Support</h3>
              <p className="text-gray-600 text-sm">Real humans guide you through adoption - we succeed when you succeed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚖️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mission-Aligned Pricing</h3>
              <p className="text-gray-600 text-sm">Fair, transparent pricing because we believe in your work</p>
            </div>
          </div>
        </div>
      </section>

      {/* How CRMblr Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How CRMblr Works</h2>
            <p className="text-lg md:text-xl text-gray-600">Three simple steps to transform your nonprofit's data management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">We Understand</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our team analyzes your organization's structure, programs, donors, and operations with nonprofit expertise. 
                We know what matters because we've been there.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">We Configure</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Expert developers custom-configure your CRM with your contacts, donation history, grant pipeline, and workflows. 
                Everything is tailored to match your organization's unique needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">You Succeed</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your team gets personal support during the critical adoption phase. 
                We're here to ensure success because we understand the nonprofit journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built by Nonprofit People, For Nonprofit People</h2>
            <p className="text-lg md:text-xl text-gray-600">Every feature configured with deep understanding of your mission</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Configuration</h3>
              <p className="text-gray-600 text-sm">Our nonprofit specialists carefully migrate your donor data, grant history, and organizational structure with attention to detail.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Design</h3>
              <p className="text-gray-600 text-sm">Thoughtfully customized with your branding, terminology, and workflows. Built by people who understand nonprofit culture.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unified Dashboard</h3>
              <p className="text-gray-600 text-sm">See donations, grants, contacts, and operations in one place. Real-time metrics for board reporting.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Field Operations</h3>
              <p className="text-gray-600 text-sm">Mobile-ready for staff and volunteers. Track service requests, events, and community engagement on the go.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Pipelines</h3>
              <p className="text-gray-600 text-sm">Donor cultivation stages configured for your programs. Move contacts from identified to stewarded automatically.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-2xl mb-3">🤝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ongoing Support</h3>
              <p className="text-gray-600 text-sm">Personal attention during your critical adoption phase. We're here to ensure your team succeeds, not just deliver software.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nonprofits Love CRMblr</h2>
            <p className="text-lg md:text-xl text-gray-600">Join organizations saving time and raising more</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "As a development professional, I know how critical it is to have donor data that's both accessible and actionable. 
                The challenge is that most CRM systems are either too complex for small teams or too generic to be useful."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-xs">SF</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Sarah Fundsby</div>
                  <div className="text-gray-600 text-xs">Associate Director of Development, Major Public University</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "The nonprofit sector desperately needs technology solutions that actually work for our unique challenges. 
                Too often we're forced into systems built for corporate sales teams, not mission-driven organizations."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-xs">JG</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">John Grantsman</div>
                  <div className="text-gray-600 text-xs">Director of Grants</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "Running a nonprofit, I spent countless hours trying to wrangle data from spreadsheets, donor databases, and grant tracking systems. 
                I built CRMblr because nonprofits deserve technology that works as hard as we do—without the six-month implementation nightmare."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-xs">LS</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Laurie Sartain</div>
                  <div className="text-gray-600 text-xs">Founder, CRMblr | Former Executive Director, MAKE Lit, NFP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg md:text-xl text-gray-600">Choose the plan that fits your team size</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Small Teams */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Small Teams</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$500</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="mb-4">
                <span className="text-sm text-gray-600 line-through">$1,000</span>
                <span className="text-sm font-semibold text-green-600 ml-2">$500 setup fee</span>
                <div className="text-xs text-gray-500">(50% off launch special)</div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Up to 5 users</div>
                <ul className="space-y-2 text-gray-600 text-xs">
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
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-semibold">
                Get Started
              </Button>
            </div>

            {/* Medium Teams */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">MOST POPULAR</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Medium Teams</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$1,000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="mb-4">
                <span className="text-sm text-gray-600 line-through">$2,000</span>
                <span className="text-sm font-semibold text-green-600 ml-2">$1,000 setup fee</span>
                <div className="text-xs text-gray-500">(50% off launch special)</div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Up to 10 users</div>
                <ul className="space-y-2 text-gray-600 text-xs">
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
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-semibold">
                Get Started
              </Button>
            </div>

            {/* Unlimited */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unlimited</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$2,000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="mb-4">
                <span className="text-sm text-gray-600 line-through">$4,000</span>
                <span className="text-sm font-semibold text-green-600 ml-2">$2,000 setup fee</span>
                <div className="text-xs text-gray-500">(50% off launch special)</div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">Unlimited users</div>
                <ul className="space-y-2 text-gray-600 text-xs">
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
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-semibold">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Let's Talk About Your Nonprofit's Needs</h2>
            <p className="text-lg md:text-xl text-gray-600">Schedule a conversation with someone who understands the nonprofit world</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <Input 
                    type="text" 
                    className="w-full h-10 border-2 border-gray-200 rounded-md px-3 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                  <Input 
                    type="text" 
                    className="w-full h-10 border-2 border-gray-200 rounded-md px-3 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <Input 
                    type="email" 
                    className="w-full h-10 border-2 border-gray-200 rounded-md px-3 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Title (Optional)</label>
                  <Input 
                    type="text" 
                    className="w-full h-10 border-2 border-gray-200 rounded-md px-3 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                  <Input 
                    type="tel" 
                    className="w-full h-10 border-2 border-gray-200 rounded-md px-3 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Budget Range (Optional)</label>
                  <select className="w-full h-10 border-2 border-gray-200 rounded-md px-3 focus:border-green-500 focus:ring-2 focus:ring-green-200">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Current CRM (Optional)</label>
                <Input 
                  type="text" 
                  className="w-full h-10 border-2 border-gray-200 rounded-md px-3 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
              <div className="text-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-base font-semibold">
                  Schedule Demo
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">CRMblr</h3>
              <p className="text-gray-400 text-sm">The nonprofit CRM that builds itself from your data.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#about" className="hover:text-white">About Us</Link></li>
                <li><Link href="#contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#security" className="hover:text-white">Security</Link></li>
                <li><Link href="#privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 CRMblr. All rights reserved. | Built with ❤️ for nonprofits</p>
          </div>
        </div>
      </footer>
    </div>
  );
}