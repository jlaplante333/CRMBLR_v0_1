// Generic per-tenant integrations registry persisted in localStorage
// Example shape: { stripe: true, paypal: true, mailchimp: true, google: true }
export type IntegrationFlags = {
  stripe?: boolean;
  paypal?: boolean;
  mailchimp?: boolean;
  google?: boolean;
};

const keyFor = (slug: string) => `tenant:${slug}:integrations`;

export const getIntegrations = (slug: string): IntegrationFlags => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(keyFor(slug));
    return raw ? (JSON.parse(raw) as IntegrationFlags) : {};
  } catch {
    return {};
  }
};

export const setIntegration = (slug: string, name: keyof IntegrationFlags, value: boolean): void => {
  if (typeof window === 'undefined') return;
  const current = getIntegrations(slug);
  const next = { ...current, [name]: value };
  localStorage.setItem(keyFor(slug), JSON.stringify(next));
  window.dispatchEvent(new StorageEvent('storage', { key: keyFor(slug), newValue: JSON.stringify(next) }));
};

export const isPaymentsConnected = (slug: string): boolean => {
  const flags = getIntegrations(slug);
  return !!(flags.stripe || flags.paypal);
};

export const setPaymentsConnected = (slug: string, value: boolean): void => {
  // Legacy alias: mark stripe as connected when invoked from legacy path
  setIntegration(slug, 'stripe', value);
};

export const disconnectIntegration = (slug: string, name: keyof IntegrationFlags): void => {
  setIntegration(slug, name, false);
};


