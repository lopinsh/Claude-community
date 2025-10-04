/**
 * CalendarEvent Component
 * Reusable event rendering - theme-aware, no hardcoded styles
 */

import { Paper, Text, Group, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { getEventColor } from './theme';

interface CalendarEventProps {
  event: {
    id: string;
    title: string | null;
    eventType: string;
    location?: string | null;
    startDateTime: string;
    endDateTime?: string | null;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTime?: boolean;
  showLocation?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
}

export default function CalendarEvent({
  event,
  size = 'sm',
  showTime = false,
  showLocation = false,
  onClick,
}: CalendarEventProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const colorName = getEventColor(event.eventType);
  const startTime = showTime ? new Date(event.startDateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) : null;

  return (
    <Paper
      p={size === 'xs' ? 4 : size === 'sm' ? 6 : 8}
      radius="sm"
      bg={`${colorName}.6`}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${theme.colors[colorName][7]}`,
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          backgroundColor: theme.colors[colorName][7],
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows.sm,
        } : undefined,
      }}
      onClick={(e) => {
        e?.stopPropagation();
        onClick?.(e);
      }}
    >
      <Group gap={4} wrap="nowrap" align="flex-start">
        {startTime && (
          <Text
            size={size === 'xs' ? '9px' : size === 'sm' ? '10px' : 'xs'}
            c="white"
            opacity={0.9}
            fw={600}
            style={{ whiteSpace: 'nowrap' }}
          >
            {startTime}
          </Text>
        )}
        <Text
          size={size === 'xs' ? '10px' : size === 'sm' ? 'xs' : 'sm'}
          c="white"
          fw={size === 'lg' ? 700 : 600}
          lineClamp={size === 'lg' ? 2 : 1}
          style={{ flex: 1 }}
        >
          {event.title || 'Untitled'}
        </Text>
      </Group>

      {showLocation && event.location && (
        <Group gap={4} mt={4}>
          <IconMapPin size={10} color="white" opacity={0.8} />
          <Text size="10px" c="white" opacity={0.8} lineClamp={1}>
            {event.location}
          </Text>
        </Group>
      )}
    </Paper>
  );
}
