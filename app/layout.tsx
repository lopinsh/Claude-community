import './globals.css';
import { Inter } from 'next/font/google';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { SessionProvider } from '@/components/SessionProvider';
import { theme } from '@/theme';
import { MobileLayout } from '@/components/mobile';
import Footer from '@/components/layout/Footer';

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
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications />
          <SessionProvider>
            <MobileLayout>
              {children}
              <Footer />
            </MobileLayout>
          </SessionProvider>
        </MantineProvider>
      </body>
    </html>
  );
}