import type { Metadata } from 'next';
import { Banner } from '@/components/Banner';
import { JourneyHeader } from '@/components/JourneyHeader';
import { SessionProvider } from '@/lib/state';
import './globals.css';

export const metadata: Metadata = {
  title: 'Milaan — understand your connected records',
  description: 'A privacy-safe synthetic prototype for understanding record differences before an application.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Banner />
        <JourneyHeader />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
