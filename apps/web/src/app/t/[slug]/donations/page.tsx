'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@crmblr/ui';
import { DEMO_TENANTS } from '@crmblr/types';
import { isPaymentsConnected, setPaymentsConnected } from '@/lib/payments';

export default function DonationsPage() {
  const params = useParams();
  const slug = params.slug as string;
  // Find tenant directly
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);

  // Mock donations data - Tokyo Voice AI Hackathon themed
  const mockDonations = slug === 'tokyo-voice-ai' ? [
    { id: '1', amount: 15000, date: '2024-10-25', contact: 'Alex.Inc (Sponsor)', status: 'sent' },
    { id: '2', amount: 10000, date: '2024-10-25', contact: 'Buddy.AI (Sponsor)', status: 'sent' },
    { id: '3', amount: 5000, date: '2024-10-25', contact: 'CyberAce (Sponsor)', status: 'sent' },
    { id: '4', amount: 5000, date: '2024-10-25', contact: 'Yosuke Yasuda (Sponsor)', status: 'sent' },
    { id: '5', amount: 3000, date: '2024-10-25', contact: 'Bye: AI (Sponsor)', status: 'sent' },
    { id: '6', amount: 3000, date: '2024-10-25', contact: 'Hackathon Prize Pool', status: 'sent' },
    { id: '7', amount: 2000, date: '2024-10-24', contact: 'Tokyo Tech Community', status: 'sent' },
    { id: '8', amount: 1500, date: '2024-10-24', contact: 'Ameba Partnership', status: 'pending' },
    { id: '9', amount: 1000, date: '2024-10-23', contact: 'Voice AI Enthusiasts', status: 'sent' },
    { id: '10', amount: 500, date: '2024-10-23', contact: 'Local Developer Group', status: 'sent' },
  ] : [
    { id: '1', amount: 250, date: '2024-01-15', contact: 'John Smith', status: 'sent' },
    { id: '2', amount: 500, date: '2024-01-14', contact: 'Jane Doe', status: 'pending' },
    { id: '3', amount: 100, date: '2024-01-13', contact: 'Bob Johnson', status: 'sent' },
    { id: '4', amount: 1000, date: '2024-01-12', contact: 'Alice Brown', status: 'sent' },
    { id: '5', amount: 75, date: '2024-01-11', contact: 'Charlie Wilson', status: 'none' },
  ];

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const [paymentsReady, setPaymentsReady] = useState(false);
  useEffect(() => {
    setPaymentsReady(isPaymentsConnected(slug));
  }, [slug]);

  const totalDonations = mockDonations.reduce((sum, d) => sum + d.amount, 0);
  const ytdDonations = mockDonations.filter(d => d.date.startsWith('2024')).reduce((sum, d) => sum + d.amount, 0);
  const totalDonors = new Set(mockDonations.map(d => d.contact)).size;
  const pendingThankYous = mockDonations.filter(d => d.status === 'pending').length;
  
  // Find the biggest donation
  const biggestDonation = mockDonations.reduce((max, donation) => 
    donation.amount > max.amount ? donation : max, mockDonations[0]);
  
  // Make biggest donation info available globally for voice assistant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).biggestDonationInfo = {
        donor: biggestDonation.contact,
        amount: biggestDonation.amount,
        date: biggestDonation.date
      };
    }
  }, [biggestDonation]);

  return (
    <div className="space-y-6">
      {!paymentsReady && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Connect a payment provider</CardTitle>
            <CardDescription>Simulate connecting Stripe or PayPal to unlock Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                className="bg-[#635BFF] hover:bg-[#5851e6] text-white"
                onClick={() => { setPaymentsConnected(slug, true); setPaymentsReady(true); }}
              >
                Connect Stripe
              </Button>
              <Button
                className="bg-[#003087] hover:bg-[#001f5c] text-white"
                onClick={() => { setPaymentsConnected(slug, true); setPaymentsReady(true); }}
              >
                Connect PayPal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
        <p className="text-gray-600">Manage and track your donation pipeline</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">All-Time Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDonations.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">YTD Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytdDonations.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDonors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Thank Yous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingThankYous}</div>
          </CardContent>
        </Card>
      </div>

      {/* Biggest Donation Highlight */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">🏆 Biggest Donation</CardTitle>
          <CardDescription className="text-yellow-700">Our top supporter this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-800 mb-2">
              ${biggestDonation.amount.toLocaleString()}
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">
              {biggestDonation.contact}
            </div>
            <div className="text-sm text-gray-600">
              Donated on {biggestDonation.date}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Progress */}
      <Card>
        <CardHeader>
          <CardTitle>{slug === 'tokyo-voice-ai' ? 'Tokyo Voice AI Hackathon Campaign' : '2025 End of Year Campaign'}</CardTitle>
          <CardDescription>{slug === 'tokyo-voice-ai' ? 'Progress towards $35,000 goal' : 'Progress towards $100,000 goal'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>${ytdDonations.toLocaleString()} / ${slug === 'tokyo-voice-ai' ? '35,000' : '100,000'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((ytdDonations / (slug === 'tokyo-voice-ai' ? 35000 : 100000)) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((ytdDonations / (slug === 'tokyo-voice-ai' ? 35000 : 100000)) * 100)}% complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Latest donation activity</CardDescription>
            </div>
            <Button>Record Donation</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Donor</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Thank You</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockDonations.map((donation) => (
                  <tr key={donation.id} className="border-b">
                    <td className="py-2">{donation.date}</td>
                    <td className="py-2">{donation.contact}</td>
                    <td className="py-2">${donation.amount.toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        donation.status === 'sent' ? 'bg-green-100 text-green-800' :
                        donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="py-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
