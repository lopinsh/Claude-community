'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Box, UnstyledButton, Stack, Text, Badge, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { getMobileNavItems } from '@/utils/navigation';

const NAV_ITEMS = getMobileNavItems();

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <Box
      pos="fixed"
      bottom={0}
      left={0}
      right={0}
      h={60}
      bg={colorScheme === 'dark' ? 'dark.7' : 'white'}
      style={{
        borderTop: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)', // iOS safe area
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: theme.shadows.lg,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <UnstyledButton
            key={item.key}
            onClick={() => handleNavigation(item.href)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              position: 'relative',
              transition: theme.other.transition,
            }}
          >
            <Stack gap={2} align="center" pos="relative">
              {/* Badge for notifications */}
              {item.badge && item.badge > 0 && (
                <Badge
                  size="xs"
                  variant="filled"
                  color="categoryRed"
                  pos="absolute"
                  top={-4}
                  right={-8}
                  style={{
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    pointerEvents: 'none',
                  }}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}

              {/* Icon */}
              <Icon
                size={24}
                stroke={1.5}
                color={
                  active
                    ? theme.colors.categoryBlue[5]
                    : colorScheme === 'dark'
                    ? theme.colors.gray[5]
                    : theme.colors.gray[6]
                }
              />

              {/* Label */}
              <Text
                size="11px"
                fw={active ? 600 : 500}
                c={active ? 'categoryBlue' : 'dimmed'}
                style={{
                  lineHeight: 1,
                }}
              >
                {item.label}
              </Text>

              {/* Active indicator */}
              {active && (
                <Box
                  pos="absolute"
                  top={-8}
                  left="50%"
                  w={32}
                  h={3}
                  bg="categoryBlue.5"
                  style={{
                    transform: 'translateX(-50%)',
                    borderRadius: '0 0 4px 4px',
                  }}
                />
              )}
            </Stack>
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
