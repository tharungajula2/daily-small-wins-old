import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppLifecycleManager from '@/components/core/AppLifecycleManager';
import { CircadianProvider } from '@/components/core/CircadianProvider';

export const metadata: Metadata = {
  title: 'TRELIS | The quiet structure your life grows on.',
  description: 'Trelis isn’t a habit tracker. It’s one calm daily ritual and a few promises you actually keep — built for people who need structure but live unpredictable days.',
  applicationName: 'Trelis Life',
  authors: [{ name: 'Trelis' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://your-trelis-vercel-url.vercel.app'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'TRELIS | Structure for a better life.',
    description: 'One calm daily ritual and a few promises you actually keep. It bends so you don’t break.',
    url: '/',
    siteName: 'Trelis',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Trelis - The open ring',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TRELIS | The quiet structure your life grows on.',
    description: 'One calm daily ritual and a few promises you actually keep. It bends so you don’t break.',
    images: ['/opengraph-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trelis',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F6F2' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1C1E' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink-primary antialiased min-h-screen">
        <AppLifecycleManager />
        <CircadianProvider>
          {children}
        </CircadianProvider>
      </body>
    </html>
  );
}
