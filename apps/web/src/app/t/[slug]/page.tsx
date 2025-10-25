'use client';

import { useParams } from 'next/navigation';
import { DEMO_TENANTS } from '@crmblr/types';
import { Button } from '@crmblr/ui';
import Link from 'next/link';
import { getTenantBranding, applyBranding } from '@/lib/branding-service';
import { getTenantDashboardData, formatCurrency, formatDate } from '@/lib/tenant-data-service';
import { useEffect } from 'react';

export default function TenantDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Debug logging
  console.log('TenantDashboard - slug:', slug);
  console.log('TenantDashboard - DEMO_TENANTS:', DEMO_TENANTS);
  console.log('TenantDashboard - available slugs:', DEMO_TENANTS.map(t => t.slug));
  
  // Find tenant directly
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);
  console.log('TenantDashboard - found tenant:', tenant);

  // Get dynamic branding based on tenant's website
  const branding = getTenantBranding(slug);

  // Get tenant-specific dashboard data
  const dashboardData = getTenantDashboardData(slug);

  // Apply branding to CSS custom properties
  useEffect(() => {
    applyBranding(branding);
    
    // Apply fonts to document
    const root = document.documentElement;
    root.style.setProperty('--font-heading', branding.fonts.heading);
    root.style.setProperty('--font-body', branding.fonts.body);
    root.style.setProperty('--font-numeric', branding.fonts.numeric);
  }, [branding]);

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
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: branding.fonts.heading }}>Dashboard</h1>
        <p className="text-gray-600" style={{ fontFamily: branding.fonts.body }}>Welcome to {tenant.name}</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: branding.fonts.numeric }}>
              {formatCurrency(dashboardData.metrics.yearToDate)}
            </div>
            <div className="text-sm text-gray-600">Year to Date</div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: branding.fonts.numeric }}>
              {formatCurrency(dashboardData.metrics.last30Days)}
            </div>
            <div className="text-sm text-gray-600">Last 30 Days</div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: branding.fonts.numeric }}>
              {dashboardData.metrics.totalDonors}
            </div>
            <div className="text-sm text-gray-600">Total Donors</div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: branding.fonts.numeric }}>
              {dashboardData.metrics.avgEngagementScore}
            </div>
            <div className="text-sm text-gray-600">Avg Engagement Score</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requires Attention */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Requires Attention</h3>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <span className="text-gray-700">{dashboardData.requiresAttention.count} {dashboardData.requiresAttention.message}</span>
              <div className="flex space-x-2 ml-auto">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1">
                  Dismiss All
                </Button>
                <Button size="sm" variant="outline" className="text-xs px-3 py-1">
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Grant Deadlines */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Grant Deadlines</h3>
            </div>
            <div className="space-y-3">
              {dashboardData.grantDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900">{deadline.name}</div>
                      <div className="text-sm text-gray-600">Application: {deadline.applicationDate}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{deadline.daysRemaining} Days</div>
                </div>
              ))}
            </div>
          </div>

          {/* Donor Cultivation */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Donor Cultivation</h3>
            </div>
            <div className="space-y-3">
              {dashboardData.donorCultivation.map((donor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900">{donor.name}</div>
                      <div className="text-sm text-gray-600">Last Contact: {donor.lastContact} → {donor.action}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-xs px-3 py-1">View</Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1">Log Touch</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pipeline Overview */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pipeline Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Identified</span>
                <span className="font-semibold text-gray-900">({dashboardData.pipelineOverview.identified})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">In Cultivation</span>
                <span className="font-semibold text-gray-900">({dashboardData.pipelineOverview.inCultivation})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">At Risk</span>
                <span className="font-semibold text-gray-900">({dashboardData.pipelineOverview.atRisk})</span>
              </div>
              <Button className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white">
                View Full Pipeline
              </Button>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>Recent Donations</h3>
            </div>
            <div className="space-y-3">
              {dashboardData.recentDonations.map((donation, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{donation.donorName}</div>
                    <div className="text-sm text-gray-600" style={{ fontFamily: branding.fonts.body }}>{formatDate(donation.date)}</div>
                  </div>
                  <div className="font-semibold text-gray-900" style={{ fontFamily: branding.fonts.numeric }}>{formatCurrency(donation.amount)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>Active Campaigns</h3>
            </div>
            <div>
              {dashboardData.activeCampaigns.map((campaign, index) => (
                <div key={index}>
                  <div className="font-medium text-gray-900 mb-2" style={{ fontFamily: branding.fonts.heading }}>{campaign.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${campaign.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600" style={{ fontFamily: branding.fonts.numeric }}>
                    {formatCurrency(campaign.currentAmount)} of {formatCurrency(campaign.targetAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}