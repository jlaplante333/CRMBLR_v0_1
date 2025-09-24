export const getPaymentsKeyForTenant = (slug: string): string => `tenant:${slug}:paymentsConnected`;

export const isPaymentsConnected = (slug: string): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getPaymentsKeyForTenant(slug)) === 'true';
};

export const setPaymentsConnected = (slug: string, value: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getPaymentsKeyForTenant(slug), value ? 'true' : 'false');
  // Fire a manual storage event so same-tab listeners can react
  window.dispatchEvent(new StorageEvent('storage', { key: getPaymentsKeyForTenant(slug), newValue: value ? 'true' : 'false' }));
};


