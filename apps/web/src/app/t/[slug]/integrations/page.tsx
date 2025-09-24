"use client";

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@crmblr/ui';
import { getTenantBranding } from '@/lib/branding-service';
import { DEMO_TENANTS } from '@crmblr/types';
import { useState } from 'react';
import { getIntegrations, setIntegration, setPaymentsConnected } from '@/lib/payments';

export default function IntegrationsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tenant = DEMO_TENANTS.find(t => t.slug === slug);
  const branding = getTenantBranding(slug);

  const [stripeKey, setStripeKey] = useState('');
  const [paypalKey, setPaypalKey] = useState('');
  const flags = getIntegrations(slug);

  if (!tenant) return <div>Tenant not found</div>;

  const connectStripe = () => {
    // Accept any fake key
    setIntegration(slug, 'stripe', true);
    router.push(`/t/${slug}/transactions`);
  };

  const connectPaypal = () => {
    setIntegration(slug, 'paypal', true);
    router.push(`/t/${slug}/transactions`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: branding.fonts.heading }}>Integrations</h1>
        <p className="text-gray-600" style={{ fontFamily: branding.fonts.body }}>Connect external services to your CRM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {/* Stripe logo */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 0C6.268 0 0 6.268 0 14s6.268 14 14 14 14-6.268 14-14S21.732 0 14 0Z" fill="#635BFF"/>
                  <path d="M18.9 14.3c0-2.3-1.9-3.7-4.8-3.7-2 0-3.7.5-4.6 1l.8 2c.8-.5 2-.8 3.2-.8 1 0 1.6.4 1.6 1 0 .5-.4.8-1.7 1-2.3.5-3.9 1.3-3.9 3.3 0 2 1.7 3.2 4.1 3.2 1.4 0 2.4-.3 3.2-.7v-2c-.8.4-1.7.7-2.8.7-1 0-1.7-.4-1.7-1 0-.6.6-.8 1.9-1.1 2.2-.5 3.7-1.4 3.7-3.2Z" fill="#fff"/>
                </svg>
                Stripe
              </CardTitle>
              <span className="text-xs text-gray-400">Donations</span>
            </div>
            <CardDescription>Integrate Stripe to sync all transactions in realtime from Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="stripe_pk" className="text-sm font-medium">Publishable Key</label>
                <Input id="stripe_pk" placeholder="pk_test_..." className="mt-1" />
              </div>
              <div>
                <label htmlFor="stripe" className="text-sm font-medium">Secret Key</label>
                <Input id="stripe" value={stripeKey} onChange={e => setStripeKey(e.target.value)} placeholder="sk_test_..." className="mt-1" />
              </div>
              <div>
                <label htmlFor="stripe_wh" className="text-sm font-medium">Webhook Secret</label>
                <Input id="stripe_wh" placeholder="whsec_..." className="mt-1" />
              </div>
              <div>
                <label htmlFor="stripe_acct" className="text-sm font-medium">Account ID (optional)</label>
                <Input id="stripe_acct" placeholder="acct_..." className="mt-1" />
              </div>
              <div className="flex gap-3">
                <Button onClick={connectStripe} disabled={!!flags.stripe} className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60">{flags.stripe ? 'Stripe Connected' : 'Connect Stripe'}</Button>
                <Button variant="outline" className="border-2">Test Webhook</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {/* PayPal logo */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="28" height="28" rx="14" fill="#003087"/>
                  <path d="M19 8.5c-.6-1-2-1.7-3.7-1.7H10.4a.9.9 0 0 0-.9.8l-1.6 10c-.1.6.4 1.1 1 1.1h2.1l.3-1.9-.1.8c0 .5.4.9.9.9h1.7c2.5 0 4.6-1.2 5.2-4 .3-1.4.1-2.6-.3-3.3-.2-.3-.4-.6-.7-.7Z" fill="#fff"/>
                </svg>
                PayPal
              </CardTitle>
              <span className="text-xs text-gray-400">Donations</span>
            </div>
            <CardDescription>Integrate PayPal to sync all transactions in realtime from PayPal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="pp_id" className="text-sm font-medium">Client ID</label>
                <Input id="pp_id" placeholder="AQX..." className="mt-1" />
              </div>
              <div>
                <label htmlFor="paypal" className="text-sm font-medium">Client Secret</label>
                <Input id="paypal" value={paypalKey} onChange={e => setPaypalKey(e.target.value)} placeholder="EAA..." className="mt-1" />
              </div>
              <div>
                <label htmlFor="pp_webhook" className="text-sm font-medium">Webhook ID</label>
                <Input id="pp_webhook" placeholder="WH-..." className="mt-1" />
              </div>
              <div>
                <label htmlFor="pp_env" className="text-sm font-medium">Environment</label>
                <select id="pp_env" className="mt-1 block w-full border rounded-md h-10 px-3 text-sm">
                  <option>Sandbox</option>
                  <option>Live</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button onClick={connectPaypal} disabled={!!flags.paypal} className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60">{flags.paypal ? 'PayPal Connected' : 'Connect PayPal'}</Button>
                <Button variant="outline" className="border-2">Send Test</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* Google logo */}
              <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303C33.682,31.657,29.19,35,24,35c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.957,3.043l5.657-5.657C34.046,5.053,29.268,3,24,3C12.955,3,4,11.955,4,23 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.818C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.957,3.043l5.657-5.657 C34.046,5.053,29.268,3,24,3C16.318,3,9.656,7.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,43c5.115,0,9.797-1.957,13.305-5.148l-6.146-5.2C29.12,34.68,26.715,35,24,35 c-5.176,0-9.65-3.317-11.292-7.946l-6.522,5.025C9.488,39.556,16.227,43,24,43z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.091,3.178-3.513,5.74-6.498,7.05l6.146,5.2 C33.973,41.095,44,34,44,23C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              Google Calendar
            </CardTitle>
            <CardDescription>Sync events and deadlines (demo only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="g_id" className="text-sm font-medium">Client ID</label>
                <Input id="g_id" placeholder="xxxxxxxx.apps.googleusercontent.com" className="mt-1" />
              </div>
              <div>
                <label htmlFor="g_secret" className="text-sm font-medium">Client Secret</label>
                <Input id="g_secret" placeholder="GOCSPX-..." className="mt-1" />
              </div>
              <div>
                <label htmlFor="g_cal" className="text-sm font-medium">Calendar ID</label>
                <Input id="g_cal" placeholder="primary" className="mt-1" />
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!!flags.google} onClick={() => { setIntegration(slug, 'google', true); router.push(`/t/${slug}/calendar`); }}>{flags.google ? 'Google Connected' : 'Connect Google'}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* Mailchimp logo (simple M) */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#FFE01B"/><path d="M6 17V7h2.5l3 6 3-6H17v10h-2V11.5l-2 4h-2l-2-4V17H6Z" fill="#000"/></svg>
              Mailchimp
            </CardTitle>
            <CardDescription>Sync contacts and campaigns (demo only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="mc_api" className="text-sm font-medium">API Key</label>
                <Input id="mc_api" placeholder="xxxx-us21" className="mt-1" />
              </div>
              <div>
                <label htmlFor="mc_list" className="text-sm font-medium">Audience ID (List)</label>
                <Input id="mc_list" placeholder="a1b2c3d4e5" className="mt-1" />
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!!flags.mailchimp} onClick={() => { setIntegration(slug, 'mailchimp', true); router.push(`/t/${slug}/mail-campaign`); }}>{flags.mailchimp ? 'Mailchimp Connected' : 'Connect Mailchimp'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


