import './globals.css';
import { Inter } from 'next/font/google';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { SessionProvider } from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Latvian Community Platform',
  description: 'Connect with local choirs, folk dancing, workout partners and more',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <MantineProvider>
          <Notifications />
          <SessionProvider>
            {children}
          </SessionProvider>
        </MantineProvider>
      </body>
    </html>
  );
}