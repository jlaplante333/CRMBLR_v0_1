'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crmblr/ui';
import { getTenantBranding } from '@/lib/branding-service';
import { DEMO_TENANTS } from '@crmblr/types';
import { useMemo, useState, useEffect } from 'react';
import { getIntegrations, setIntegration, setPaymentsConnected, disconnectIntegration } from '@/lib/payments';
import { PaymentLogo } from '@/components/payment-logos';

export default function TransactionsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);
  const branding = getTenantBranding(slug);

  const [connected, setConnected] = useState<{ stripe: boolean; paypal: boolean }>(() => {
    const flags = getIntegrations(slug);
    return { stripe: !!flags.stripe, paypal: !!flags.paypal };
  });

  // Persist simulated connection per-tenant so the sidebar can react
  useEffect(() => {
    setPaymentsConnected(slug, connected.paypal || connected.stripe);
  }, [connected, slug]);

  const mockTransactions = useMemo(() => {
    const baseStripe = [
      { id: 'txn_s1', source: 'Stripe', status: 'succeeded', amount: 2500, currency: 'USD', donor: 'Sarah Johnson', date: '2025-09-10', fee: 88 },
      { id: 'txn_s2', source: 'Stripe', status: 'succeeded', amount: 1500, currency: 'USD', donor: 'Emily Rodriguez', date: '2025-09-08', fee: 63 },
      { id: 'txn_s3', source: 'Stripe', status: 'pending', amount: 7500, currency: 'USD', donor: 'Lisa Park', date: '2025-09-06', fee: 225 },
    ];
    const basePaypal = [
      { id: 'txn_p1', source: 'PayPal', status: 'completed', amount: 5000, currency: 'USD', donor: 'Michael Chen', date: '2025-09-09', fee: 145 },
      { id: 'txn_p2', source: 'PayPal', status: 'refunded', amount: 2000, currency: 'USD', donor: 'David Thompson', date: '2025-09-07', fee: 0 },
    ];
    const txns = [
      ...(connected.stripe ? baseStripe : []),
      ...(connected.paypal ? basePaypal : []),
    ];
    // Sort by date desc for realism
    return txns.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [connected]);

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  const formatAmount = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      succeeded: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-gray-200 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDeactivate = () => {
    // Disconnect all payment integrations
    disconnectIntegration(slug, 'stripe');
    disconnectIntegration(slug, 'paypal');
    setConnected({ stripe: false, paypal: false });
    // Redirect to dashboard
    router.push(`/t/${slug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>Transactions</h1>
          <p className="text-gray-600" style={{ fontFamily: branding.fonts.body }}>Connect Stripe or PayPal and view synced donations</p>
        </div>
        {(connected.stripe || connected.paypal) && (
          <Button 
            onClick={handleDeactivate}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Deactivate Integrations
          </Button>
        )}
      </div>

      {/* Connect Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Integrations</CardTitle>
          <CardDescription>Simulated connection for demo purposes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => { setConnected(s => ({ ...s, stripe: true })); setIntegration(slug, 'stripe', true); }}
              disabled={connected.stripe}
              className="bg-[#635BFF] hover:bg-[#5851e6] text-white"
            >
              {connected.stripe ? 'Stripe Connected' : 'Connect Stripe'}
            </Button>
            <Button
              onClick={() => { setConnected(s => ({ ...s, paypal: true })); setIntegration(slug, 'paypal', true); }}
              disabled={connected.paypal}
              className="bg-[#003087] hover:bg-[#001f5c] text-white"
            >
              {connected.paypal ? 'PayPal Connected' : 'Connect PayPal'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest donations from Stripe and PayPal (simulated)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Donor</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Source</th>
                  <th className="text-left py-2">Fee</th>
                  <th className="text-left py-2">Net</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Txn ID</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map(txn => (
                  <tr key={txn.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{txn.date}</td>
                    <td className="py-2">{txn.donor}</td>
                    <td className="py-2">{formatAmount(txn.amount)}</td>
                    <td className="py-2">
                      <PaymentLogo source={txn.source} />
                    </td>
                    <td className="py-2">{formatAmount(txn.fee)}</td>
                    <td className="py-2">{formatAmount(txn.amount - txn.fee)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(txn.status)}`}>{txn.status}</span>
                    </td>
                    <td className="py-2 text-gray-500 text-xs">{txn.id}</td>
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
