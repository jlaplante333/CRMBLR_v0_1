import type { Metadata } from 'next';
import { Inter, EB_Garamond, Space_Mono, Libre_Franklin } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const ebGaramond = EB_Garamond({ subsets: ['latin'], variable: '--font-eb-garamond' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' });
const libreFranklin = Libre_Franklin({ subsets: ['latin'], variable: '--font-libre-franklin' });

export const metadata: Metadata = {
  title: 'VCRM - CRM, but with VOICE!',
  description: 'Voice-powered AI CRM platform for nonprofits and organizations',
  keywords: ['VCRM', 'voice', 'CRM', 'nonprofit', 'AI', 'donations', 'grants', 'pipeline'],
  authors: [{ name: 'VCRM Team' }],
  openGraph: {
    title: 'VCRM - CRM, but with VOICE!',
    description: 'Voice-powered AI CRM platform for nonprofits and organizations',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VCRM - CRM, but with VOICE!',
    description: 'Voice-powered AI CRM platform for nonprofits and organizations',
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
      <body className={`${inter.className} ${ebGaramond.variable} ${spaceMono.variable} ${libreFranklin.variable}`}>
        {children}
      </body>
    </html>
  );
}
