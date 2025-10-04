/**
 * CalendarCell Component
 * Reusable calendar day cell - theme-aware, handles light/dark mode
 */

import { Box, Text, Stack, Badge, useMantineTheme, useMantineColorScheme, Popover, Group } from '@mantine/core';
import { isSameDay } from 'date-fns';
import { useState } from 'react';
import CalendarEvent from './CalendarEvent';

interface CalendarCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  events: Array<{
    id: string;
    title: string | null;
    eventType: string;
    location?: string | null;
    startDateTime: string;
    endDateTime?: string | null;
  }>;
  onEventClick?: (eventId: string) => void;
  onCellClick?: (date: Date) => void;
}

export default function CalendarCell({
  day,
  isCurrentMonth,
  isWeekend,
  events,
  onEventClick,
  onCellClick,
}: CalendarCellProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [popoverOpened, setPopoverOpened] = useState(false);

  const isToday = isSameDay(day, new Date());
  const visibleEvents = events.slice(0, 3);
  const hiddenCount = events.length - 3;

  return (
    <Box
      p="xs"
      sx={{
        minHeight: 120,
        height: '100%',
        aspectRatio: '1 / 1',
        borderRight: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        backgroundColor: isToday
          ? colorScheme === 'dark'
            ? theme.colors.categoryBlue[9]
            : theme.colors.categoryBlue[0]
          : isWeekend
          ? colorScheme === 'dark'
            ? theme.colors.dark[6]
            : theme.colors.gray[0]
          : colorScheme === 'dark'
          ? theme.colors.dark[7]
          : 'white',
        opacity: isCurrentMonth ? 1 : 0.5,
        border: isToday ? `2px solid ${theme.colors.categoryBlue[6]}` : undefined,
        cursor: onCellClick ? 'pointer' : 'default',
        '&:hover': onCellClick ? {
          backgroundColor: colorScheme === 'dark'
            ? theme.colors.dark[5]
            : theme.colors.gray[1],
        } : undefined,
      }}
      onClick={() => onCellClick?.(day)}
    >
      <Group justify="space-between" mb="xs">
        <Text
          size="xs"
          fw={isToday ? 700 : 500}
          c={isToday ? 'categoryBlue' : isCurrentMonth ? undefined : 'dimmed'}
        >
          {day.getDate()}
        </Text>
        {isToday && (
          <Badge size="xs" variant="filled" color="categoryBlue">
            Today
          </Badge>
        )}
      </Group>

      <Stack gap={4}>
        {visibleEvents.map((event) => (
          <CalendarEvent
            key={event.id}
            event={event}
            size="xs"
            showTime
            onClick={(e) => {
              e?.stopPropagation();
              onEventClick?.(event.id);
            }}
          />
        ))}

        {hiddenCount > 0 && (
          <Popover
            opened={popoverOpened}
            onChange={setPopoverOpened}
            position="bottom"
            withArrow
            shadow="md"
            width={280}
          >
            <Popover.Target>
              <Text
                size="9px"
                c={colorScheme === 'dark' ? 'blue.4' : 'blue.6'}
                ta="center"
                fw={600}
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverOpened(true);
                }}
              >
                +{hiddenCount} more
              </Text>
            </Popover.Target>
            <Popover.Dropdown p="sm">
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
                {events.slice(3).map((event) => (
                  <CalendarEvent
                    key={event.id}
                    event={event}
                    size="sm"
                    showTime
                    showLocation
                    onClick={() => {
                      onEventClick?.(event.id);
                      setPopoverOpened(false);
                    }}
                  />
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
      </Stack>
    </Box>
  );
}
