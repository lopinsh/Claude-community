/**
 * MonthView Component
 * Calendar month grid - uses reusable CalendarCell components
 */

import { Box, SimpleGrid, Text, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { useMemo } from 'react';
import CalendarCell from './CalendarCell';

interface MonthViewProps {
  currentDate: Date;
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

export default function MonthView({
  currentDate,
  events,
  onEventClick,
  onCellClick,
}: MonthViewProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.startDateTime), day)
    );
  };

  return (
    <Box>
      {/* Day headers */}
      <SimpleGrid
        cols={7}
        spacing={0}
        sx={{
          borderBottom: `2px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Box
            key={day}
            p="sm"
            sx={{
              borderRight: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
              '&:last-child': { borderRight: 'none' },
            }}
          >
            <Text size="xs" fw={600} ta="center" c="dimmed">
              {day}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Calendar grid */}
      <SimpleGrid
        cols={7}
        spacing={0}
        sx={{
          border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          borderTop: 'none',
        }}
      >
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          const dayEvents = getEventsForDay(day);

          return (
            <CalendarCell
              key={day.getTime()}
              day={day}
              isCurrentMonth={isCurrentMonth}
              isWeekend={isWeekend}
              events={dayEvents}
              onEventClick={onEventClick}
              onCellClick={onCellClick}
            />
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
