'use client';

import { ReactNode } from 'react';
import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import BottomNavigation from './BottomNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export default function MobileLayout({ children, showBottomNav = true }: MobileLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Box>
      {/* Main content with bottom padding for nav */}
      <Box pb={isMobile && showBottomNav ? 60 : 0}>
        {children}
      </Box>

      {/* Bottom navigation - only on mobile */}
      {isMobile && showBottomNav && <BottomNavigation />}
    </Box>
  );
}
