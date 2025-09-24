'use client';

import { useParams } from 'next/navigation';
import { DEMO_TENANTS } from '@crmblr/types';
import { getTenantBranding, applyBranding } from '@/lib/branding-service';
import { useEffect, useState } from 'react';
import { isPaymentsConnected } from '@/lib/payments';
import Link from 'next/link';

interface TenantLayoutProps {
  children: React.ReactNode;
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  const params = useParams();
  const slug = params.slug as string;

  // Find tenant directly
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);

  // Get dynamic branding based on tenant's website
  const branding = getTenantBranding(slug);

  // Show Transactions only after a payment integration is connected (simulated via localStorage)
  const [paymentsConnected, setPaymentsConnected] = useState(false);

  // Apply branding to CSS custom properties
  useEffect(() => {
    applyBranding(branding);
    
    // Apply fonts to document
    const root = document.documentElement;
    root.style.setProperty('--font-heading', branding.fonts.heading);
    root.style.setProperty('--font-body', branding.fonts.body);
    root.style.setProperty('--font-numeric', branding.fonts.numeric);
  }, [branding]);

  // Read connection flag from localStorage and subscribe to changes
  useEffect(() => {
    const read = () => setPaymentsConnected(isPaymentsConnected(slug));
    read();
    const onStorage = () => read();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [slug]);

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tenant Not Found</h1>
          <p className="text-gray-600">The workspace "{slug}" does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: branding.background }}>
      {/* Left Sidebar Navigation - Persistent across all pages */}
      <div className="w-64 text-white" style={{ backgroundColor: branding.primary }}>
        <div className="p-6">
          {/* Logo and Organization Name */}
          <div className="flex items-center mb-8">
            {(() => {
              const raw = (branding as any).logoUrl;
              const logoSrc = typeof raw === 'string' ? raw : (raw?.src || raw?.default?.src);
              return logoSrc ? (
              <img
                src={logoSrc}
                alt={`${tenant.name} logo`}
                className="h-8 w-auto mr-3"
              />
              ) : (
              <div 
                className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm mr-3"
                style={{ backgroundColor: branding.primary }}
              >
                {tenant.name.charAt(0)}
              </div>
              );
            })()}
            <div>
              <h1 className="text-lg font-semibold" style={{ fontFamily: branding.fonts.heading }}>{tenant.name}</h1>
              <p className="text-xs text-gray-400" style={{ fontFamily: branding.fonts.body }}>{slug}.crmblr.com</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <Link 
              href={`/t/${slug}`}
              className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              Dashboard
            </Link>
            
            <Link 
              href={`/t/${slug}/contacts`}
              className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Contacts
            </Link>
            
            <Link 
              href={`/t/${slug}/donations`}
              className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Donations
            </Link>

            {paymentsConnected && (
              <Link 
                href={`/t/${slug}/transactions`}
                className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Transactions
              </Link>
            )}
            
            <Link 
              href={`/t/${slug}/pipeline`}
              className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Pipeline
            </Link>
            
            <Link 
              href={`/t/${slug}/grants`}
              className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Grants
            </Link>
            
            <Link 
              href={`/t/${slug}/organizations`}
              className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Organizations
            </Link>
            
            <Link 
              href={`/t/${slug}/directory`}
              className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              Directory
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar - Persistent across all pages */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>{tenant.name}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
              
            {/* Add Integrations CTA */}
            <Link href={`/t/${slug}/integrations`} className="hidden sm:inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800">
              Add Integrations
            </Link>
            
              {/* User profile */}
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: branding.primary }}
                >
                  jon
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}