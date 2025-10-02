'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, addDays, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { Box, Badge, Text, Stack, useMantineTheme, useMantineColorScheme, Group, Paper, ActionIcon, Button, SimpleGrid } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { AgendaView } from '@/components/mobile';

interface CalendarEvent {
  id: string;
  title: string | null;
  description: string | null;
  startDateTime: string;
  endDateTime: string | null;
  isAllDay: boolean;
  eventType: string;
  visibility: string;
  location: string | null;
  group: {
    id: string;
    title: string;
    location: string;
  };
  _count: {
    attendees: number;
  };
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function EventCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
}: EventCalendarProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Filter events by current view
  const filteredEvents = useMemo(() => {
    if (currentView === 'MONTH') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return events.filter(event => {
        const eventDate = parseISO(event.startDateTime);
        return eventDate >= monthStart && eventDate <= monthEnd;
      });
    }
    // For now, just return all events for WEEK/DAY views
    return events;
  }, [events, currentDate, currentView]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event =>
      isSameDay(parseISO(event.startDateTime), day)
    );
  };

  // Get event color based on type
  const getEventColor = (event: CalendarEvent) => {
    return event.eventType === 'SPECIAL' ? 'categoryBlue' : 'categoryTeal';
  };

  // Render event card
  const renderEventCard = (event: CalendarEvent) => {
    const colorName = getEventColor(event);

    return (
      <Paper
        p="md"
        radius="md"
        bg={`${colorName}.6`}
        onClick={() => onSelectEvent?.(event)}
        sx={{ cursor: 'pointer', border: 'none' }}
      >
        <Stack gap="xs">
          <Text size="sm" fw={600} c="white">
            {event.title || 'Untitled Event'}
          </Text>
          <Text size="xs" c="white" opacity={0.9}>
            {format(new Date(event.startDateTime), 'PPp')}
          </Text>
          <Group gap={4}>
            <Badge size="xs" variant="white" c={`${colorName}.6`}>
              {event.eventType.toLowerCase()}
            </Badge>
            {event.visibility === 'PUBLIC' && (
              <Badge size="xs" variant="white" c={`${colorName}.6`}>
                public
              </Badge>
            )}
          </Group>
          {event.location && (
            <Text size="xs" c="white" opacity={0.8}>
              📍 {event.location}
            </Text>
          )}
        </Stack>
      </Paper>
    );
  };

  // Handle date navigation
  const handlePrevious = () => {
    if (currentView === 'MONTH') {
      const newDate = addDays(startOfMonth(currentDate), -1);
      setCurrentDate(startOfMonth(newDate));
    } else if (currentView === 'WEEK') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (currentView === 'MONTH') {
      setCurrentDate(addDays(endOfMonth(currentDate), 1));
    } else if (currentView === 'WEEK') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // On mobile, render AgendaView instead
  if (isMobile) {
    return <AgendaView events={events} onSelectEvent={onSelectEvent} />;
  }

  return (
    <Box
      sx={{
        border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Custom Toolbar */}
      <Group
        justify="space-between"
        p="md"
        style={{
          borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
        }}
      >
        <Group gap="sm">
          <ActionIcon variant="default" onClick={handlePrevious} size="lg">
            <IconChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon variant="default" onClick={handleNext} size="lg">
            <IconChevronRight size={16} />
          </ActionIcon>
          <Button variant="filled" color="categoryBlue" onClick={handleToday} size="sm">
            Today
          </Button>
        </Group>

        <Text fw={600} size="lg">
          {format(currentDate, 'MMMM yyyy')}
        </Text>

        <Group gap="xs">
          <Button
            variant={currentView === 'MONTH' ? 'filled' : 'default'}
            color="categoryBlue"
            onClick={() => setCurrentView('MONTH')}
            size="sm"
          >
            Month
          </Button>
          <Button
            variant={currentView === 'WEEK' ? 'filled' : 'default'}
            color="categoryBlue"
            onClick={() => setCurrentView('WEEK')}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={currentView === 'DAY' ? 'filled' : 'default'}
            color="categoryBlue"
            onClick={() => setCurrentView('DAY')}
            size="sm"
          >
            Day
          </Button>
        </Group>
      </Group>

      {/* Calendar Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {currentView === 'MONTH' ? (
          // Month Grid View
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

            {/* Calendar days grid */}
            <SimpleGrid
              cols={7}
              spacing={0}
              sx={{
                border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                borderTop: 'none',
              }}
            >
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isWeekEnd = index % 7 === 6;

                return (
                  <Box
                    key={index}
                    p="xs"
                    sx={{
                      minHeight: 120,
                      height: '100%',
                      aspectRatio: '1 / 1',
                      borderRight: isWeekEnd ? 'none' : `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      backgroundColor: isToday
                        ? colorScheme === 'dark'
                          ? theme.colors.dark[5]
                          : theme.colors.blue[0]
                        : colorScheme === 'dark'
                        ? theme.colors.dark[7]
                        : 'white',
                      opacity: isCurrentMonth ? 1 : 0.5,
                      '&:nth-last-child(-n+7)': { borderBottom: 'none' },
                    }}
                  >
                    <Text
                      size="xs"
                      fw={isToday ? 700 : 500}
                      c={isToday ? 'categoryBlue' : isCurrentMonth ? undefined : 'dimmed'}
                      mb="xs"
                    >
                      {format(day, 'd')}
                    </Text>

                    <Stack gap={4}>
                      {dayEvents.slice(0, 3).map((event) => {
                        const colorName = getEventColor(event);
                        return (
                          <Box
                            key={event.id}
                            p={4}
                            sx={{
                              backgroundColor: theme.colors[colorName][6],
                              borderRadius: theme.radius.xs,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: theme.colors[colorName][7],
                              },
                            }}
                            onClick={() => onSelectEvent?.(event)}
                          >
                            <Text size="10px" c="white" lineClamp={1} fw={500}>
                              {event.title || 'Untitled'}
                            </Text>
                          </Box>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <Text size="9px" c="dimmed" ta="center">
                          +{dayEvents.length - 3} more
                        </Text>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>
        ) : (
          // List View (for WEEK and DAY views)
          <Stack gap="md" p="md">
            {filteredEvents.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No events for this period
              </Text>
            ) : (
              filteredEvents.map((event) => (
                <Box key={event.id}>{renderEventCard(event)}</Box>
              ))
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
