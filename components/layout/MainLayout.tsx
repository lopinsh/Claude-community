'use client';

import { ReactNode } from 'react';
import { Box, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  /** If true, shows the footer. Default: true */
  showFooter?: boolean;
  /** Optional burger click handler for mobile menu */
  onBurgerClick?: () => void;
}

/**
 * MainLayout provides consistent page structure with Header and Footer
 * Use this for all standard user-facing pages
 */
export default function MainLayout({
  children,
  showFooter = true,
  onBurgerClick
}: MainLayoutProps) {
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}
    >
      {/* Header - Sticky at top */}
      <Header onBurgerClick={onBurgerClick} />

      {/* Main content area - grows to fill space */}
      <Box
        component="main"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>

      {/* Footer - at bottom */}
      {showFooter && <Footer />}
    </Box>
  );
}
