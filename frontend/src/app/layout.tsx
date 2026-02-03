import type { Metadata } from 'next';
import { Inter, Commissioner, VT323 } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/contexts/ToastContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const commissioner = Commissioner({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const vt323 = VT323({
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
  weight: '400',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Wizard Match | Find Your Wizard Match',
  description: 'Finding your perfect wizard match since 2026. Join our Valentine matchmaking platform and discover meaningful connections.',
  keywords: ['Wizard Match', 'Valentine', 'Dating', 'Matchmaking', 'Wizards'],
  authors: [{ name: 'Wizard Match Team' }],
  openGraph: {
    title: 'Wizard Match',
    description: 'Finding your perfect wizard match since 2026',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} ${commissioner.variable} ${vt323.variable} font-body antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
