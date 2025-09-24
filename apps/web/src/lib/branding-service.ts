// Dynamic Branding Service - Extracts colors, fonts, and styling from nonprofit websites
// This service analyzes nonprofit websites and generates CRM branding that matches their existing design

// Allow logo to be either a public URL string or a statically imported image
export interface WebsiteBranding {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  fonts: {
    heading: string;
    body: string;
    numeric: string;
  };
  // string for public path, or any for StaticImport from next/image
  logoUrl?: string | any;
  tagline?: string;
}

export interface NonprofitWebsite {
  domain: string;
  name: string;
  description?: string;
}

// Pre-analyzed branding for demo tenants based on their actual websites
export const DEMO_WEBSITE_BRANDING: Record<string, WebsiteBranding> = {
  makelit: {
    // Based on makelit.org - literary arts organization (REAL COLORS)
    primary: '#000000',      // Black from makelit.org
    secondary: '#EC272E',    // Red accent from makelit.org
    accent: '#0DC8FF',       // Blue accent from makelit.org
    background: '#f5f5f5',   // Light gray background from makelit.org
    text: '#000000',         // Black text
    muted: '#666666',        // Muted gray
    border: '#e8e8e8',       // Light border from makelit.org
    success: '#EC272E',      // Red for donations (makelit brand color)
    warning: '#fbbf24',      // Amber for campaigns
    error: '#EC272E',        // Red for alerts (makelit brand color)
    fonts: {
      heading: 'var(--font-eb-garamond), serif',     // EB Garamond for headings from makelit.org
      body: 'var(--font-libre-franklin), sans-serif', // Libre Franklin for body text from makelit.org
      numeric: 'var(--font-space-mono), monospace'   // Space Mono for numbers/currency from makelit.org
    },
    // Prefer local lib/logos asset when available; falls back to public path
    logoUrl: (() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('@/lib/logos/makelit_logo.png');
      } catch {
        return '/brand/makelit-logo.png';
      }
    })(),
    tagline: 'Supporting Cross-Cultural Artistic and Literary Collaboration'
  },
  
  oneinsix: {
    // Based on 1in6.org - men's support organization
    primary: '#0b3d91',      // Navy blue from their site
    secondary: '#1f73b7',    // Medium blue
    accent: '#4299e1',       // Light blue accent
    background: '#f2f5f7',   // Light blue-gray background
    text: '#0f172a',         // Very dark text
    muted: '#64748b',        // Muted text
    border: '#cbd5e0',       // Light border
    success: '#38a169',      // Green for donations
    warning: '#d69e2e',      // Amber for campaigns
    error: '#e53e3e',        // Red for alerts
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      numeric: 'Inter, system-ui, sans-serif'
    },
    logoUrl: (() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('@/lib/logos/1in6.png');
      } catch {
        return '/brand/1in6.svg';
      }
    })(),
    tagline: 'Supporting Men Who Have Experienced Sexual Abuse'
  },
  
  fallenfruit: {
    // Based on fallenfruit.org - urban agriculture organization
    primary: '#e11d48',      // Red from their site
    secondary: '#f97316',    // Orange
    accent: '#f59e0b',       // Amber accent
    background: '#fef3c7',  // Light yellow background
    text: '#111827',         // Dark text
    muted: '#6b7280',        // Muted text
    border: '#f3f4f6',       // Light border
    success: '#10b981',      // Green for donations
    warning: '#f59e0b',      // Amber for campaigns
    error: '#ef4444',        // Red for alerts
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      numeric: 'Inter, system-ui, sans-serif'
    },
    logoUrl: '/brand/fallenfruit.svg',
    tagline: 'Urban Agriculture and Public Art'
  },
  
  homeboy: {
    // Based on homeboyindustries.org - social enterprise
    primary: '#0f172a',      // Very dark blue from their site
    secondary: '#38bdf8',    // Sky blue
    accent: '#0ea5e9',       // Blue accent
    background: '#e2e8f0',   // Light gray background
    text: '#1f2937',         // Dark text
    muted: '#6b7280',        // Muted text
    border: '#d1d5db',       // Light border
    success: '#10b981',      // Green for donations
    warning: '#f59e0b',      // Amber for campaigns
    error: '#ef4444',        // Red for alerts
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      numeric: 'Inter, system-ui, sans-serif'
    },
    logoUrl: (() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('@/lib/logos/homeboy.png');
      } catch {
        return '/brand/homeboy.svg';
      }
    })(),
    tagline: 'Jobs Not Jails - Social Enterprise'
  }
};

// Function to extract branding from any nonprofit website
export async function extractWebsiteBranding(website: NonprofitWebsite): Promise<WebsiteBranding> {
  try {
    // In a real implementation, this would:
    // 1. Fetch the website's HTML
    // 2. Extract CSS colors from stylesheets
    // 3. Analyze the color palette
    // 4. Extract fonts and typography
    // 5. Find logo and branding elements
    // 6. Generate a cohesive color scheme
    
    // For now, return a default branding that can be customized
    return {
      primary: '#1a365d',
      secondary: '#2d3748',
      accent: '#3182ce',
      background: '#f7fafc',
      text: '#2d3748',
      muted: '#718096',
      border: '#e2e8f0',
      success: '#38a169',
      warning: '#d69e2e',
      error: '#e53e3e',
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
        numeric: 'Inter, system-ui, sans-serif'
      },
      logoUrl: undefined,
      tagline: website.description
    };
  } catch (error) {
    console.error('Error extracting website branding:', error);
    // Return fallback branding
    return DEMO_WEBSITE_BRANDING.makelit;
  }
}

// Function to generate CSS custom properties for dynamic theming
export function generateCSSVariables(branding: WebsiteBranding): string {
  return `
    :root {
      --primary: ${branding.primary};
      --primary-foreground: #ffffff;
      --secondary: ${branding.secondary};
      --secondary-foreground: #ffffff;
      --accent: ${branding.accent};
      --accent-foreground: #ffffff;
      --background: ${branding.background};
      --foreground: ${branding.text};
      --muted: ${branding.muted};
      --muted-foreground: ${branding.muted};
      --border: ${branding.border};
      --success: ${branding.success};
      --warning: ${branding.warning};
      --error: ${branding.error};
      --font-heading: ${branding.fonts.heading};
      --font-body: ${branding.fonts.body};
    }
  `;
}

// Function to apply branding to a React component
export function applyBranding(branding: WebsiteBranding) {
  const root = document.documentElement;
  
  root.style.setProperty('--primary', branding.primary);
  root.style.setProperty('--primary-foreground', '#ffffff');
  root.style.setProperty('--secondary', branding.secondary);
  root.style.setProperty('--secondary-foreground', '#ffffff');
  root.style.setProperty('--accent', branding.accent);
  root.style.setProperty('--accent-foreground', '#ffffff');
  root.style.setProperty('--background', branding.background);
  root.style.setProperty('--foreground', branding.text);
  root.style.setProperty('--muted', branding.muted);
  root.style.setProperty('--muted-foreground', branding.muted);
  root.style.setProperty('--border', branding.border);
  root.style.setProperty('--success', branding.success);
  root.style.setProperty('--warning', branding.warning);
  root.style.setProperty('--error', branding.error);
  root.style.setProperty('--font-heading', branding.fonts.heading);
  root.style.setProperty('--font-body', branding.fonts.body);
  root.style.setProperty('--font-numeric', branding.fonts.numeric);
}

// Function to get branding for a tenant slug
export function getTenantBranding(slug: string): WebsiteBranding {
  return DEMO_WEBSITE_BRANDING[slug] || DEMO_WEBSITE_BRANDING.makelit;
}
