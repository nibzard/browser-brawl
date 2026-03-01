import type { Metadata } from 'next';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Browser Brawl',
  description: 'AI vs AI — browser battle arena',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
