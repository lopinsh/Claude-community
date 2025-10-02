'use client';

import { useState, useMemo } from 'react';
import { Stack, Paper, Box, Text, Group, Badge, ActionIcon, ScrollArea, Divider, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCalendar, IconMapPin, IconClock, IconUsersGroup } from '@tabler/icons-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isTomorrow, addMonths, subMonths } from 'date-fns';

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

interface AgendaViewProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
}

export default function AgendaView({ events, onSelectEvent }: AgendaViewProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get month boundaries
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};

    events.forEach((event) => {
      const eventDate = new Date(event.startDateTime);
      const dateKey = format(eventDate, 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);

  // Get all dates in current month
  const datesInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get dates with events
  const datesWithEvents = datesInMonth.filter((date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateKey] && eventsByDate[dateKey].length > 0;
  });

  // Format date for section headers
  const formatSectionHeader = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };

  // Get event color
  const getEventColor = (event: CalendarEvent) => {
    return event.eventType === 'SPECIAL' ? 'categoryBlue' : 'categoryTeal';
  };

  // Format time
  const formatTime = (dateString: string, isAllDay: boolean) => {
    if (isAllDay) return 'All day';
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  };

  // Navigate months
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  return (
    <Box>
      {/* Month Navigation */}
      <Group justify="space-between" mb="md" p="sm" bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'} style={{ borderRadius: theme.radius.md }}>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={handlePrevMonth}
            size="lg"
          >
            <IconChevronLeft size={20} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={handleNextMonth}
            size="lg"
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Group>

        <Text fw={600} size="lg">
          {format(currentMonth, 'MMMM yyyy')}
        </Text>

        <ActionIcon
          variant="filled"
          color="categoryBlue"
          onClick={handleToday}
          size="lg"
        >
          <IconCalendar size={20} />
        </ActionIcon>
      </Group>

      {/* Event List */}
      <ScrollArea h="calc(100vh - 250px)">
        <Stack gap="lg">
          {datesWithEvents.length === 0 ? (
            <Paper p="xl" withBorder radius="md" ta="center">
              <Stack align="center" gap="sm">
                <IconCalendar size={48} color={theme.colors.gray[5]} />
                <Text size="lg" c="dimmed">
                  No events this month
                </Text>
                <Text size="sm" c="dimmed">
                  Check other months or browse all events
                </Text>
              </Stack>
            </Paper>
          ) : (
            datesWithEvents.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateKey] || [];

              return (
                <Box key={dateKey}>
                  {/* Date Header */}
                  <Group gap="sm" mb="sm">
                    <Box
                      w={48}
                      h={48}
                      bg={isToday(date) ? 'categoryBlue.6' : (colorScheme === 'dark' ? 'dark.5' : 'gray.2')}
                      style={{
                        borderRadius: theme.radius.md,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        size="xl"
                        fw={700}
                        c={isToday(date) ? 'white' : undefined}
                      >
                        {format(date, 'd')}
                      </Text>
                      <Text
                        size="xs"
                        fw={500}
                        c={isToday(date) ? 'white' : 'dimmed'}
                        tt="uppercase"
                      >
                        {format(date, 'EEE')}
                      </Text>
                    </Box>

                    <Box flex={1}>
                      <Text fw={600} size="sm">
                        {formatSectionHeader(date)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </Text>
                    </Box>
                  </Group>

                  {/* Events for this date */}
                  <Stack gap="xs" ml={60}>
                    {dayEvents.map((event) => {
                      const colorName = getEventColor(event);
                      const eventTitle = event.title || event.group.title;
                      const eventLocation = event.location || event.group.location;

                      return (
                        <Paper
                          key={event.id}
                          p="md"
                          withBorder
                          radius="md"
                          onClick={() => onSelectEvent?.(event)}
                          style={{
                            cursor: 'pointer',
                            borderLeft: `4px solid ${theme.colors[colorName][5]}`,
                            transition: theme.other.transition,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Stack gap="xs">
                            <Group justify="space-between" align="flex-start">
                              <Text fw={600} size="sm" lineClamp={1} flex={1}>
                                {eventTitle}
                              </Text>
                              <Badge
                                size="xs"
                                variant="light"
                                color={colorName}
                              >
                                {event.eventType.toLowerCase()}
                              </Badge>
                            </Group>

                            {event.description && (
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {event.description}
                              </Text>
                            )}

                            <Group gap="md" wrap="wrap">
                              <Group gap={4}>
                                <IconClock size={14} color={theme.colors.gray[6]} />
                                <Text size="xs" c="dimmed">
                                  {formatTime(event.startDateTime, event.isAllDay)}
                                  {event.endDateTime && !event.isAllDay && (
                                    <> - {formatTime(event.endDateTime, event.isAllDay)}</>
                                  )}
                                </Text>
                              </Group>

                              <Group gap={4}>
                                <IconMapPin size={14} color={theme.colors.gray[6]} />
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {eventLocation}
                                </Text>
                              </Group>

                              <Group gap={4}>
                                <IconUsersGroup size={14} color={theme.colors.gray[6]} />
                                <Text size="xs" c="dimmed">
                                  {event._count.attendees} attending
                                </Text>
                              </Group>
                            </Group>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>

                  <Divider my="lg" />
                </Box>
              );
            })
          )}
        </Stack>
      </ScrollArea>
    </Box>
  );
}
