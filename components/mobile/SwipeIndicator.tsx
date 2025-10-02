'use client';

import { useState, useEffect } from 'react';
import { Box, Text, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

interface SwipeIndicatorProps {
  /**
   * Whether to show the indicator
   * @default true
   */
  show?: boolean;

  /**
   * How long to show the indicator before auto-hiding (ms)
   * @default 3000
   */
  duration?: number;
}

const STORAGE_KEY = 'swipe-hint-shown';

export default function SwipeIndicator({ show = true, duration = 3000 }: SwipeIndicatorProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if hint has been shown before
    const hasSeenHint = localStorage.getItem(STORAGE_KEY);

    if (!hasSeenHint && show) {
      setVisible(true);

      // Hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!visible) return null;

  return (
    <>
      {/* Edge Indicator */}
      <Box
        pos="fixed"
        left={0}
        top="50%"
        style={{
          transform: 'translateY(-50%)',
          zIndex: 999,
          pointerEvents: 'none',
        }}
      >
        <Box
          w={4}
          h={60}
          style={{
            background: `linear-gradient(to right, ${theme.colors.categoryBlue[5]}, ${theme.colors.categoryTeal[5]})`,
            borderRadius: '0 4px 4px 0',
            boxShadow: theme.shadows.lg,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </Box>

      {/* Tooltip */}
      <Box
        pos="fixed"
        left={16}
        top="50%"
        style={{
          transform: 'translateY(-50%)',
          zIndex: 1000,
          pointerEvents: 'none',
          animation: 'slideInFromLeft 0.5s ease-out',
        }}
      >
        <Box
          px="md"
          py="sm"
          bg={colorScheme === 'dark' ? 'dark.7' : 'white'}
          style={{
            borderRadius: theme.radius.md,
            boxShadow: theme.shadows.xl,
            border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}
        >
          <IconChevronRight size={16} color={theme.colors.categoryBlue[5]} />
          <Text size="sm" fw={500}>
            Swipe to open filters
          </Text>
        </Box>
      </Box>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateY(-50%) translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(-50%) translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
