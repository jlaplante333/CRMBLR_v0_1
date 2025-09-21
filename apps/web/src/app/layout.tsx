import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRMblr - AI-Generated CRM Platform',
  description: 'Multi-tenant AI-generated CRM platform for nonprofits and organizations',
  keywords: ['CRM', 'nonprofit', 'AI', 'donations', 'grants', 'pipeline'],
  authors: [{ name: 'CRMblr Team' }],
  openGraph: {
    title: 'CRMblr - AI-Generated CRM Platform',
    description: 'Multi-tenant AI-generated CRM platform for nonprofits and organizations',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRMblr - AI-Generated CRM Platform',
    description: 'Multi-tenant AI-generated CRM platform for nonprofits and organizations',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
