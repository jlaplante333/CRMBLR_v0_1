'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Tenant } from '@crmblr/types';

interface BrandContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  setTenant: (tenant: Tenant | null) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant?.branding?.palette) {
      // Apply tenant branding to CSS custom properties
      const root = document.documentElement;
      const palette = tenant.branding.palette;
      
      root.style.setProperty('--primary', palette[1] || '#0ea5e9');
      root.style.setProperty('--primary-foreground', palette[3] || '#ffffff');
      root.style.setProperty('--secondary', palette[2] || '#fbbf24');
      root.style.setProperty('--secondary-foreground', palette[0] || '#111827');
      root.style.setProperty('--background', palette[3] || '#ffffff');
      root.style.setProperty('--foreground', palette[0] || '#111827');
      root.style.setProperty('--muted', palette[3] || '#f8fafc');
      root.style.setProperty('--muted-foreground', palette[0] || '#64748b');
      root.style.setProperty('--border', palette[0] || '#e2e8f0');
      root.style.setProperty('--accent', palette[1] || '#0ea5e9');
      root.style.setProperty('--accent-foreground', palette[3] || '#ffffff');
    }
  }, [tenant]);

  return (
    <BrandContext.Provider value={{ tenant, isLoading, error, setTenant }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
