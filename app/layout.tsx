import type { Metadata } from 'next';
import { Banner } from '@/components/Banner';
import { JourneyHeader } from '@/components/JourneyHeader';
import { SessionProvider } from '@/lib/state';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nagrik Trail — see where your application actually is',
  description: 'An independent prototype. Application status computed from document access events, not declared by an officer. Synthetic data only.',
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
