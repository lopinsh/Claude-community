'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, addDays, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO, startOfDay, differenceInMinutes, getHours, getMinutes, isWithinInterval, addMinutes } from 'date-fns';
import { Box, Badge, Text, Stack, useMantineTheme, useMantineColorScheme, Group, Paper, ActionIcon, Button, SimpleGrid, Tooltip, Popover } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconMapPin } from '@tabler/icons-react';
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
  const [openedPopover, setOpenedPopover] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for the time indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Time grid configuration
  const START_HOUR = 6; // 6 AM
  const END_HOUR = 23; // 11 PM
  const HOUR_HEIGHT = 60; // pixels per hour
  const MINUTES_PER_SLOT = 60;

  // Generate time slots for day/week view
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  // Generate week days for week view
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  }, [currentDate]);

  // Calculate event position and height
  const getEventPosition = (event: CalendarEvent) => {
    const startDate = parseISO(event.startDateTime);
    const endDate = event.endDateTime ? parseISO(event.endDateTime) : addMinutes(startDate, 60);

    const startMinutes = getHours(startDate) * 60 + getMinutes(startDate);
    const endMinutes = getHours(endDate) * 60 + getMinutes(endDate);
    const startOffset = (startMinutes - START_HOUR * 60) / 60; // hours from start
    const duration = (endMinutes - startMinutes) / 60; // duration in hours

    return {
      top: startOffset * HOUR_HEIGHT,
      height: Math.max(duration * HOUR_HEIGHT, 30), // minimum 30px
      startTime: startDate,
      endTime: endDate,
    };
  };

  // Get events for a specific day (for week/day view)
  const getEventsForDayGrid = (day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);

    return events.filter(event => {
      const eventStart = parseISO(event.startDateTime);
      const eventEnd = event.endDateTime ? parseISO(event.endDateTime) : addMinutes(eventStart, 60);

      return isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
             isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
             (eventStart < dayStart && eventEnd > dayEnd);
    });
  };

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    const hours = getHours(currentTime);
    const minutes = getMinutes(currentTime);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = START_HOUR * 60;
    const offset = (totalMinutes - startMinutes) / 60; // hours from start
    return offset * HOUR_HEIGHT;
  };

  // Check if current time is within displayed hours
  const isCurrentTimeVisible = () => {
    const hours = getHours(currentTime);
    return hours >= START_HOUR && hours <= END_HOUR;
  };

  // Detect overlapping events and calculate layout
  const calculateEventColumns = (dayEvents: CalendarEvent[]) => {
    if (dayEvents.length === 0) return [];

    const sortedEvents = [...dayEvents].sort((a, b) =>
      parseISO(a.startDateTime).getTime() - parseISO(b.startDateTime).getTime()
    );

    const columns: CalendarEvent[][] = [];

    sortedEvents.forEach(event => {
      const eventStart = parseISO(event.startDateTime);
      const eventEnd = event.endDateTime ? parseISO(event.endDateTime) : addMinutes(eventStart, 60);

      let placed = false;
      for (let col of columns) {
        const lastEvent = col[col.length - 1];
        const lastEventEnd = lastEvent.endDateTime
          ? parseISO(lastEvent.endDateTime)
          : addMinutes(parseISO(lastEvent.startDateTime), 60);

        if (eventStart >= lastEventEnd) {
          col.push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([event]);
      }
    });

    return sortedEvents.map(event => {
      const columnIndex = columns.findIndex(col => col.includes(event));
      return {
        event,
        column: columnIndex,
        totalColumns: columns.length,
      };
    });
  };

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

      {/* Event Type Legend */}
      <Group
        gap="lg"
        p="xs"
        justify="center"
        style={{
          borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
        }}
      >
        <Group gap={6}>
          <Box
            w={12}
            h={12}
            style={{
              backgroundColor: theme.colors.categoryTeal[6],
              borderRadius: theme.radius.xs,
            }}
          />
          <Text size="xs" c="dimmed">Regular Events</Text>
        </Group>
        <Group gap={6}>
          <Box
            w={12}
            h={12}
            style={{
              backgroundColor: theme.colors.categoryBlue[6],
              borderRadius: theme.radius.xs,
            }}
          />
          <Text size="xs" c="dimmed">Special Events</Text>
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
                const isWeekEnd = index % 7 === 0 || index % 7 === 6;
                const isSaturday = index % 7 === 6;

                return (
                  <Box
                    key={index}
                    p="xs"
                    sx={{
                      minHeight: 120,
                      height: '100%',
                      aspectRatio: '1 / 1',
                      borderRight: isSaturday ? 'none' : `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      backgroundColor: isToday
                        ? colorScheme === 'dark'
                          ? theme.colors.categoryBlue[9]
                          : theme.colors.categoryBlue[0]
                        : isWeekEnd
                        ? colorScheme === 'dark'
                          ? theme.colors.dark[6]
                          : theme.colors.gray[0]
                        : colorScheme === 'dark'
                        ? theme.colors.dark[7]
                        : 'white',
                      opacity: isCurrentMonth ? 1 : 0.5,
                      border: isToday ? `2px solid ${theme.colors.categoryBlue[6]}` : undefined,
                      '&:nth-last-child(-n+7)': { borderBottom: 'none' },
                    }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Text
                        size="xs"
                        fw={isToday ? 700 : 500}
                        c={isToday ? 'categoryBlue' : isCurrentMonth ? undefined : 'dimmed'}
                      >
                        {format(day, 'd')}
                      </Text>
                      {isToday && (
                        <Badge size="xs" variant="filled" color="categoryBlue">
                          Today
                        </Badge>
                      )}
                    </Group>

                    <Stack gap={4}>
                      {dayEvents.slice(0, 3).map((event) => {
                        const colorName = getEventColor(event);
                        const eventTime = format(parseISO(event.startDateTime), event.isAllDay ? '' : 'HH:mm');
                        const eventEndTime = event.endDateTime ? format(parseISO(event.endDateTime), 'HH:mm') : null;

                        return (
                          <Tooltip
                            key={event.id}
                            label={
                              <Stack gap={4}>
                                <Text size="xs" fw={600}>
                                  {event.title || 'Untitled'}
                                </Text>
                                <Text size="xs">
                                  {event.isAllDay
                                    ? 'All day'
                                    : `${eventTime}${eventEndTime ? ` - ${eventEndTime}` : ''}`
                                  }
                                </Text>
                                {event.location && (
                                  <Group gap={4}>
                                    <IconMapPin size={10} />
                                    <Text size="xs">{event.location}</Text>
                                  </Group>
                                )}
                                <Badge size="xs" variant="light" color={colorName}>
                                  {event.eventType}
                                </Badge>
                              </Stack>
                            }
                            position="top"
                            withArrow
                            transitionProps={{ duration: 200 }}
                          >
                            <Box
                              p={4}
                              sx={{
                                backgroundColor: theme.colors[colorName][6],
                                borderRadius: theme.radius.xs,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: theme.colors[colorName][7],
                                  transform: 'translateX(2px)',
                                  boxShadow: theme.shadows.sm,
                                },
                              }}
                              onClick={() => onSelectEvent?.(event)}
                            >
                              <Group gap={4} wrap="nowrap">
                                {!event.isAllDay && (
                                  <Text size="9px" c="white" opacity={0.9} fw={600} style={{ whiteSpace: 'nowrap' }}>
                                    {eventTime}
                                  </Text>
                                )}
                                <Text size="10px" c="white" lineClamp={1} fw={500} style={{ flex: 1 }}>
                                  {event.title || 'Untitled'}
                                </Text>
                              </Group>
                            </Box>
                          </Tooltip>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <Popover
                          opened={openedPopover === `${day.getTime()}`}
                          onChange={(opened) => setOpenedPopover(opened ? `${day.getTime()}` : null)}
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
                              style={{
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                '&:hover': {
                                  opacity: 0.8,
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenedPopover(`${day.getTime()}`);
                              }}
                            >
                              +{dayEvents.length - 3} more
                            </Text>
                          </Popover.Target>
                          <Popover.Dropdown p="sm">
                            <Stack gap="xs">
                              <Text size="sm" fw={600}>
                                {format(day, 'MMMM d, yyyy')}
                              </Text>
                              {dayEvents.slice(3).map((event) => {
                                const colorName = getEventColor(event);
                                const eventTime = format(parseISO(event.startDateTime), event.isAllDay ? '' : 'HH:mm');
                                return (
                                  <Paper
                                    key={event.id}
                                    p="xs"
                                    radius="sm"
                                    bg={`${colorName}.6`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      onSelectEvent?.(event);
                                      setOpenedPopover(null);
                                    }}
                                  >
                                    <Stack gap={4}>
                                      <Group gap={4} wrap="nowrap">
                                        {!event.isAllDay && (
                                          <Text size="xs" c="white" opacity={0.9} fw={600}>
                                            {eventTime}
                                          </Text>
                                        )}
                                        <Text size="xs" c="white" fw={500} style={{ flex: 1 }}>
                                          {event.title || 'Untitled'}
                                        </Text>
                                      </Group>
                                      {event.location && (
                                        <Group gap={4}>
                                          <IconMapPin size={10} color="white" opacity={0.8} />
                                          <Text size="xs" c="white" opacity={0.8}>
                                            {event.location}
                                          </Text>
                                        </Group>
                                      )}
                                    </Stack>
                                  </Paper>
                                );
                              })}
                            </Stack>
                          </Popover.Dropdown>
                        </Popover>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>
        ) : currentView === 'WEEK' ? (
          // Week Grid View
          <Box sx={{ position: 'relative', overflowX: 'auto' }}>
            {/* All-day events row */}
            <Box sx={{ display: 'flex', minWidth: 800, borderBottom: `2px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` }}>
              <Box sx={{ width: 60, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` }}>
                <Text size="10px" c="dimmed" fw={600}>ALL DAY</Text>
              </Box>
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDayGrid(day);
                const allDayEvents = dayEvents.filter(e => e.isAllDay);

                return (
                  <Box
                    key={`allday-${dayIndex}`}
                    sx={{
                      flex: 1,
                      minHeight: allDayEvents.length > 0 ? 50 : 30,
                      padding: 4,
                      borderRight: dayIndex < 6 ? `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` : 'none',
                    }}
                  >
                    <Stack gap={4}>
                      {allDayEvents.map(event => {
                        const colorName = getEventColor(event);
                        return (
                          <Paper
                            key={event.id}
                            p={6}
                            radius="sm"
                            bg={`${colorName}.6`}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: theme.colors[colorName][7],
                              },
                            }}
                            onClick={() => onSelectEvent?.(event)}
                          >
                            <Text size="10px" c="white" fw={600} lineClamp={1}>
                              {event.title || 'Untitled'}
                            </Text>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ display: 'flex', minWidth: 800 }}>
              {/* Time column */}
              <Box sx={{ width: 60, flexShrink: 0, borderRight: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` }}>
                <Box sx={{ height: 40, borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` }} />
                {timeSlots.map((hour) => (
                  <Box
                    key={hour}
                    sx={{
                      height: HOUR_HEIGHT,
                      borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      paddingTop: 4,
                    }}
                  >
                    <Text size="xs" c="dimmed">
                      {format(new Date().setHours(hour, 0), 'HH:mm')}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDayGrid(day);
                const eventLayout = calculateEventColumns(dayEvents.filter(e => !e.isAllDay));
                const allDayEvents = dayEvents.filter(e => e.isAllDay);
                const isToday = isSameDay(day, new Date());

                return (
                  <Box
                    key={dayIndex}
                    sx={{
                      flex: 1,
                      position: 'relative',
                      borderRight: dayIndex < 6 ? `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` : 'none',
                      backgroundColor: isToday
                        ? colorScheme === 'dark'
                          ? theme.colors.categoryBlue[9]
                          : theme.colors.categoryBlue[0]
                        : 'transparent',
                    }}
                  >
                    {/* Day header */}
                    <Box
                      sx={{
                        height: 40,
                        borderBottom: `2px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <Text size="xs" c="dimmed" fw={500}>
                        {format(day, 'EEE')}
                      </Text>
                      <Text size="sm" fw={isToday ? 700 : 500} c={isToday ? 'categoryBlue' : undefined}>
                        {format(day, 'd')}
                      </Text>
                    </Box>

                    {/* Time grid */}
                    {timeSlots.map((hour, hourIndex) => (
                      <Box
                        key={hour}
                        sx={{
                          height: HOUR_HEIGHT,
                          borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                          '&:hover': {
                            backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() => onSelectSlot?.({
                          start: new Date(day.setHours(hour, 0)),
                          end: new Date(day.setHours(hour + 1, 0)),
                        })}
                      />
                    ))}

                    {/* Current time indicator */}
                    {isToday && isCurrentTimeVisible() && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: getCurrentTimePosition(),
                          left: 0,
                          right: 0,
                          height: 2,
                          backgroundColor: theme.colors.red[6],
                          zIndex: 20,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: -4,
                            top: -4,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: theme.colors.red[6],
                          },
                        }}
                      />
                    )}

                    {/* Events */}
                    {eventLayout.map(({ event, column, totalColumns }) => {
                      const position = getEventPosition(event);
                      const colorName = getEventColor(event);
                      const width = totalColumns > 1 ? `${95 / totalColumns}%` : '95%';
                      const left = totalColumns > 1 ? `${(column * 95) / totalColumns}%` : '2.5%';

                      return (
                        <Tooltip
                          key={event.id}
                          label={
                            <Stack gap={4}>
                              <Text size="xs" fw={600}>{event.title || 'Untitled'}</Text>
                              <Text size="xs">
                                {format(position.startTime, 'HH:mm')} - {format(position.endTime, 'HH:mm')}
                              </Text>
                              {event.location && (
                                <Group gap={4}>
                                  <IconMapPin size={10} />
                                  <Text size="xs">{event.location}</Text>
                                </Group>
                              )}
                            </Stack>
                          }
                          position="top"
                          withArrow
                        >
                          <Paper
                            p="xs"
                            radius="sm"
                            bg={`${colorName}.6`}
                            sx={{
                              position: 'absolute',
                              top: position.top,
                              left: left,
                              width: width,
                              height: position.height,
                              cursor: 'pointer',
                              overflow: 'hidden',
                              border: `1px solid ${theme.colors[colorName][7]}`,
                              '&:hover': {
                                backgroundColor: theme.colors[colorName][7],
                                zIndex: 10,
                              },
                            }}
                            onClick={() => onSelectEvent?.(event)}
                          >
                            <Text size="xs" c="white" fw={600} lineClamp={1}>
                              {event.title || 'Untitled'}
                            </Text>
                            <Text size="10px" c="white" opacity={0.9}>
                              {format(position.startTime, 'HH:mm')}
                            </Text>
                            {event.location && position.height > 60 && (
                              <Group gap={4} mt={4}>
                                <IconMapPin size={10} color="white" opacity={0.8} />
                                <Text size="10px" c="white" opacity={0.8} lineClamp={1}>
                                  {event.location}
                                </Text>
                              </Group>
                            )}
                          </Paper>
                        </Tooltip>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          // Day Grid View
          <Box sx={{ position: 'relative' }}>
            {/* All-day events row */}
            <Box sx={{ display: 'flex', borderBottom: `2px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` }}>
              <Box sx={{ width: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` }}>
                <Text size="xs" c="dimmed" fw={600}>ALL DAY</Text>
              </Box>
              <Box sx={{ flex: 1, minHeight: 40, padding: 8 }}>
                <Stack gap={6}>
                  {(() => {
                    const dayEvents = getEventsForDayGrid(currentDate);
                    const allDayEvents = dayEvents.filter(e => e.isAllDay);

                    if (allDayEvents.length === 0) {
                      return (
                        <Text size="xs" c="dimmed" ta="center">
                          No all-day events
                        </Text>
                      );
                    }

                    return allDayEvents.map(event => {
                      const colorName = getEventColor(event);
                      return (
                        <Paper
                          key={event.id}
                          p="sm"
                          radius="md"
                          bg={`${colorName}.6`}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: theme.colors[colorName][7],
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => onSelectEvent?.(event)}
                        >
                          <Group gap="sm" wrap="nowrap">
                            <Text size="sm" c="white" fw={700} style={{ flex: 1 }}>
                              {event.title || 'Untitled'}
                            </Text>
                            {event.location && (
                              <Group gap={4}>
                                <IconMapPin size={12} color="white" opacity={0.8} />
                                <Text size="xs" c="white" opacity={0.9}>
                                  {event.location}
                                </Text>
                              </Group>
                            )}
                            <Badge size="sm" variant="white" c={`${colorName}.6`}>
                              {event.eventType}
                            </Badge>
                          </Group>
                        </Paper>
                      );
                    });
                  })()}
                </Stack>
              </Box>
            </Box>

            <Box sx={{ display: 'flex' }}>
              {/* Time column */}
              <Box sx={{ width: 80, flexShrink: 0, borderRight: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` }}>
                <Box sx={{ height: 60, borderBottom: `2px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text size="sm" fw={600}>
                    {format(currentDate, 'EEE, MMM d')}
                  </Text>
                </Box>
                {timeSlots.map((hour) => (
                  <Box
                    key={hour}
                    sx={{
                      height: HOUR_HEIGHT,
                      borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      paddingTop: 4,
                    }}
                  >
                    <Text size="sm" c="dimmed">
                      {format(new Date().setHours(hour, 0), 'HH:mm')}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Day column */}
              <Box sx={{ flex: 1, position: 'relative' }}>
                {/* Header */}
                <Box
                  sx={{
                    height: 60,
                    borderBottom: `2px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="lg" fw={600}>
                    Today
                  </Text>
                </Box>

                {/* Time grid */}
                {timeSlots.map((hour) => (
                  <Box
                    key={hour}
                    sx={{
                      height: HOUR_HEIGHT,
                      borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                      '&:hover': {
                        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => onSelectSlot?.({
                      start: new Date(currentDate.setHours(hour, 0)),
                      end: new Date(currentDate.setHours(hour + 1, 0)),
                    })}
                  />
                ))}

                {/* Current time indicator */}
                {isSameDay(currentDate, new Date()) && isCurrentTimeVisible() && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: getCurrentTimePosition(),
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: theme.colors.red[6],
                      zIndex: 20,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -6,
                        top: -5,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: theme.colors.red[6],
                        border: `2px solid ${colorScheme === 'dark' ? theme.colors.dark[7] : 'white'}`,
                      },
                      '&::after': {
                        content: `"${format(currentTime, 'HH:mm')}"`,
                        position: 'absolute',
                        left: 12,
                        top: -8,
                        fontSize: '11px',
                        fontWeight: 600,
                        color: theme.colors.red[6],
                        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : 'white',
                        padding: '2px 6px',
                        borderRadius: theme.radius.sm,
                        border: `1px solid ${theme.colors.red[6]}`,
                      },
                    }}
                  />
                )}

                {/* Events */}
                {(() => {
                  const dayEvents = getEventsForDayGrid(currentDate);
                  const eventLayout = calculateEventColumns(dayEvents.filter(e => !e.isAllDay));

                  return eventLayout.map(({ event, column, totalColumns }) => {
                    const position = getEventPosition(event);
                    const colorName = getEventColor(event);
                    const width = totalColumns > 1 ? `${95 / totalColumns}%` : '95%';
                    const left = totalColumns > 1 ? `${(column * 95) / totalColumns + 2.5}%` : '2.5%';

                    return (
                      <Tooltip
                        key={event.id}
                        label={
                          <Stack gap={4}>
                            <Text size="xs" fw={600}>{event.title || 'Untitled'}</Text>
                            <Text size="xs">
                              {format(position.startTime, 'HH:mm')} - {format(position.endTime, 'HH:mm')}
                            </Text>
                            {event.location && (
                              <Group gap={4}>
                                <IconMapPin size={10} />
                                <Text size="xs">{event.location}</Text>
                              </Group>
                            )}
                          </Stack>
                        }
                        position="right"
                        withArrow
                      >
                        <Paper
                          p="md"
                          radius="md"
                          bg={`${colorName}.6`}
                          sx={{
                            position: 'absolute',
                            top: position.top,
                            left: left,
                            width: width,
                            height: position.height,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            border: `2px solid ${theme.colors[colorName][7]}`,
                            '&:hover': {
                              backgroundColor: theme.colors[colorName][7],
                              zIndex: 10,
                              transform: 'scale(1.02)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => onSelectEvent?.(event)}
                        >
                          <Stack gap="xs">
                            <Text size="sm" c="white" fw={700} lineClamp={2}>
                              {event.title || 'Untitled'}
                            </Text>
                            <Text size="xs" c="white" opacity={0.9} fw={600}>
                              {format(position.startTime, 'HH:mm')} - {format(position.endTime, 'HH:mm')}
                            </Text>
                            {event.location && (
                              <Group gap={6} mt="xs">
                                <IconMapPin size={14} color="white" opacity={0.8} />
                                <Text size="xs" c="white" opacity={0.9} lineClamp={1}>
                                  {event.location}
                                </Text>
                              </Group>
                            )}
                            <Badge size="sm" variant="white" c={`${colorName}.6`} mt="xs">
                              {event.eventType}
                            </Badge>
                          </Stack>
                        </Paper>
                      </Tooltip>
                    );
                  });
                })()}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
