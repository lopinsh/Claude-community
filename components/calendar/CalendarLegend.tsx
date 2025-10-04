/**
 * CalendarLegend Component
 * Shows event type color coding - theme-aware
 */

import { Group, Box, Text, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { CALENDAR_CONFIG } from './theme';

export default function CalendarLegend() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Group
      gap="lg"
      p="xs"
      justify="center"
      sx={{
        borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
      }}
    >
      {Object.entries(CALENDAR_CONFIG.eventColors).map(([type, colorName]) => (
        <Group key={type} gap={6}>
          <Box
            w={12}
            h={12}
            sx={{
              backgroundColor: theme.colors[colorName][6],
              borderRadius: theme.radius.xs,
            }}
          />
          <Text size="xs" c="dimmed">
            {type === 'REGULAR' ? 'Regular Events' : 'Special Events'}
          </Text>
        </Group>
      ))}
    </Group>
  );
}
