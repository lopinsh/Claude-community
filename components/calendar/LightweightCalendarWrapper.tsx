'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useMantineTheme, useMantineColorScheme, Box, Badge, Text, Group } from '@mantine/core';
import { format, parseISO, getHours, isSameDay, startOfDay } from 'date-fns';
import CalendarWrapper from './lightweight/Calendar/CalendarWrapper';
import { CurrentView, CellDisplayMode, CellDisplayModeState } from './lightweight/Calendar/Calendar.types';
import { enUS } from 'date-fns/locale';
import { getEventColor } from './theme';
import './lightweight-theme.scss';

// Calculate dynamic hour range based on events for a given day
function calculateHourRange(events: CalendarEvent[], currentDate: string): { min: number; max: number } {
  const dateObj = new Date(currentDate);

  // Filter events for the current day
  const dayEvents = events.filter(event => {
    const eventStart = parseISO(event.startDateTime);
    return isSameDay(eventStart, dateObj);
  });

  // If no events, return working hours fallback (8 AM - 6 PM)
  if (dayEvents.length === 0) {
    return { min: 8, max: 18 };
  }

  let minHour = 24;
  let maxHour = 0;

  dayEvents.forEach(event => {
    const startHour = getHours(parseISO(event.startDateTime));
    const endDate = event.endDateTime ? parseISO(event.endDateTime) : parseISO(event.startDateTime);
    const endHour = getHours(endDate);

    // If event ends on a different day and before 6 AM, treat as extended hours (24-29)
    const adjustedEndHour = !isSameDay(endDate, dateObj) && endHour < 6
      ? endHour + 24
      : endHour;

    minHour = Math.min(minHour, startHour);
    maxHour = Math.max(maxHour, adjustedEndHour);
  });

  // Ensure minimum range of at least 8 hours for usability
  if (maxHour - minHour < 8) {
    const midPoint = Math.floor((minHour + maxHour) / 2);
    minHour = Math.max(0, midPoint - 4);
    maxHour = Math.min(29, midPoint + 4);
  }

  return { min: minHour, max: maxHour };
}

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

interface LightweightCalendarWrapperProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  defaultView?: CurrentView;
  cellClickMode?: 'navigate' | 'create' | 'disabled';
}

export default function LightweightCalendarWrapper({
  events,
  onSelectEvent,
  onSelectSlot,
  defaultView = CurrentView.MONTH,
  cellClickMode = 'disabled',
}: LightweightCalendarWrapperProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentView, setCurrentView] = useState<CurrentView>(defaultView);

  // Calculate dynamic hour range for day/week timeline views
  const hourRange = useMemo(() => {
    return calculateHourRange(events, currentDate);
  }, [events, currentDate]);

  // Cell display mode configuration
  const [cellDisplayMode, setCellDisplayMode] = useState<CellDisplayMode>({
    MONTH: {
      inactiveCells: [],
      state: CellDisplayModeState.CUSTOM,
    },
    WEEK_TIME: {
      inactiveCells: [],
      state: CellDisplayModeState.ALL_COLLAPSED,
    },
    DAY_IN_PLACE: {
      inactiveCells: [],
      state: CellDisplayModeState.CUSTOM,
    },
    WEEK_IN_PLACE: {
      inactiveCells: [],
      state: CellDisplayModeState.CUSTOM,
    },
  });

  // Transform our events to lightweight calendar format with limiting
  const transformedEvents = useMemo(() => {
    const MAX_EVENTS_PER_DAY = 2;
    // Only limit events in MONTH and WEEK views, not in time-based views
    const shouldLimitEvents = currentView === CurrentView.MONTH || currentView === CurrentView.WEEK;

    // If not limiting (DAY, WEEK_TIME, etc), return all events directly
    if (!shouldLimitEvents) {
      return events.map((event) => {
        const colorName = getEventColor(event.eventType);
        return {
          id: event.id,
          title: event.title || 'Untitled Event',
          startDate: event.startDateTime,
          endDate: event.endDateTime || event.startDateTime,
          bgColor: theme.colors[colorName][6],
          textColor: 'white',
          _originalEvent: event,
        };
      });
    }

    // Group events by date (YYYY-MM-DD) for month view
    const eventsByDate: Record<string, typeof events> = {};
    events.forEach((event) => {
      const dateKey = event.startDateTime.split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    // Transform events with limiting for month view
    const result: any[] = [];
    Object.entries(eventsByDate).forEach(([dateKey, dayEvents]) => {
      // Sort events by start time
      const sortedEvents = [...dayEvents].sort((a, b) =>
        a.startDateTime.localeCompare(b.startDateTime)
      );

      // Add first N events
      const visibleEvents = sortedEvents.slice(0, MAX_EVENTS_PER_DAY);
      visibleEvents.forEach((event) => {
        const colorName = getEventColor(event.eventType);
        result.push({
          id: event.id,
          title: event.title || 'Untitled Event',
          startDate: event.startDateTime,
          endDate: event.endDateTime || event.startDateTime,
          bgColor: theme.colors[colorName][6],
          textColor: 'white',
          _originalEvent: event,
        });
      });

      // Add "+N more" indicator if there are hidden events
      const hiddenCount = sortedEvents.length - MAX_EVENTS_PER_DAY;
      if (hiddenCount > 0) {
        result.push({
          id: `more-${dateKey}`,
          title: `+${hiddenCount} more`,
          startDate: `${dateKey}T23:59:00`,
          endDate: `${dateKey}T23:59:00`,
          bgColor: theme.colors.gray[5],
          textColor: colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[9],
          _isMoreIndicator: true,
          _date: dateKey,
          _hiddenEvents: sortedEvents.slice(MAX_EVENTS_PER_DAY),
        });
      }
    });

    return result;
  }, [events, theme.colors, colorScheme, currentView]);

  // Custom render for event items with Mantine styling
  const renderItem = (item: any, isHovered: boolean) => {
    // Timeline views need full height, grid views need compact height
    const isTimelineView = currentView === CurrentView.DAY || currentView === CurrentView.WEEK_TIME;

    // Handle "+N more" indicator
    if (item._isMoreIndicator) {
      return (
        <Box
          px={6}
          py={2}
          style={{
            backgroundColor: isHovered ? theme.colors.gray[6] : theme.colors.gray[5],
            color: colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[9],
            borderRadius: theme.radius.sm,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            textAlign: 'center',
            border: `1px dashed ${theme.colors.gray[4]}`,
          }}
        >
          {item.title}
        </Box>
      );
    }

    // Handle regular events
    const event = item._originalEvent as CalendarEvent;
    const colorName = getEventColor(event.eventType);

    return (
      <Box
        px={6}
        py={isTimelineView ? 4 : 2}
        style={{
          backgroundColor: theme.colors[colorName][isHovered ? 7 : 6],
          color: 'white',
          borderRadius: theme.radius.sm,
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          overflow: 'hidden',
          height: isTimelineView ? '100%' : 'auto',
          display: isTimelineView ? 'flex' : 'block',
          flexDirection: isTimelineView ? 'column' : undefined,
          justifyContent: isTimelineView ? 'flex-start' : undefined,
          border: isTimelineView ? `1px solid ${colorScheme === 'dark' ? theme.colors.dark[6] : 'white'}` : undefined,
        }}
      >
        <Text size="11px" fw={600} lineClamp={isTimelineView ? 2 : 1} c="white" style={{ lineHeight: '14px' }}>
          {currentView === CurrentView.MONTH && (
            <span style={{ opacity: 0.9, marginRight: 4 }}>
              {format(parseISO(event.startDateTime), 'HH:mm')}
            </span>
          )}
          {event.title || 'Untitled'}
        </Text>
      </Box>
    );
  };

  // Custom render for event text
  const renderItemText = (item: any) => {
    const event = item._originalEvent as CalendarEvent;
    return (
      <Box>
        <Text size="xs" fw={600} c="white" lineClamp={2}>
          {event.title || 'Untitled'}
        </Text>
        <Text size="xs" c="white" opacity={0.9}>
          {format(parseISO(event.startDateTime), 'HH:mm')}
          {event.endDateTime && ` - ${format(parseISO(event.endDateTime), 'HH:mm')}`}
        </Text>
        {event.location && (
          <Text size="xs" c="white" opacity={0.8} lineClamp={1}>
            📍 {event.location}
          </Text>
        )}
      </Box>
    );
  };

  // Handle item click
  const onItemClick = (item: any) => {
    // If clicking "+N more", switch to day view for that date
    if (item._isMoreIndicator) {
      setCurrentDate(item._date);
      setCurrentView(CurrentView.DAY);
      return;
    }

    // Regular event click
    if (item._originalEvent && onSelectEvent) {
      onSelectEvent(item._originalEvent);
    }
  };

  // Handle cell click for navigation or creating events
  const onCellClick = (value: any) => {
    // Navigate mode: Switch to day view on month/week cell clicks
    if (cellClickMode === 'navigate' && (currentView === CurrentView.MONTH || currentView === CurrentView.WEEK)) {
      setCurrentDate(value.date || value.timeDate.split('T')[0]);
      setCurrentView(CurrentView.DAY);
      return;
    }

    // Create mode: Open create event modal with pre-filled time
    if (cellClickMode === 'create' && onSelectSlot) {
      const start = new Date(value.timeDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later
      onSelectSlot({ start, end });
      return;
    }

    // Disabled mode or day/timeline views: Do nothing
  };

  // Apply dark mode styles via CSS custom properties
  const calendarStyles = useMemo(() => {
    const isDark = colorScheme === 'dark';
    return {
      '--calendar-bg': isDark ? theme.colors.dark[7] : 'white',
      '--calendar-border': isDark ? theme.colors.dark[4] : theme.colors.gray[3],
      '--calendar-text': isDark ? theme.colors.gray[0] : theme.colors.dark[9],
      '--calendar-text-dimmed': isDark ? theme.colors.gray[5] : theme.colors.gray[6],
      '--calendar-hover-bg': isDark ? theme.colors.dark[6] : theme.colors.gray[1],
      '--calendar-today-bg': isDark ? theme.colors.categoryBlue[9] : theme.colors.categoryBlue[0],
      '--calendar-today-border': theme.colors.categoryBlue[6],
    } as React.CSSProperties;
  }, [colorScheme, theme]);

  return (
    <Box
      className="calendar-wrapper"
      style={{
        ...calendarStyles,
        backgroundColor: 'var(--calendar-bg)',
        borderRadius: theme.radius.md,
        border: `1px solid var(--calendar-border)`,
        overflow: 'hidden',
        height: '600px',
        maxHeight: 'calc(100vh - 300px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* View Switcher */}
      <Group
        gap="xs"
        p="md"
        style={{
          borderBottom: `1px solid var(--calendar-border)`,
          backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
          flexShrink: 0,
        }}
      >
        <Badge
          variant={currentView === CurrentView.MONTH ? 'filled' : 'outline'}
          color="categoryBlue"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentView(CurrentView.MONTH)}
        >
          Month
        </Badge>
        <Badge
          variant={currentView === CurrentView.WEEK ? 'filled' : 'outline'}
          color="categoryBlue"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentView(CurrentView.WEEK)}
        >
          Week
        </Badge>
        <Badge
          variant={currentView === CurrentView.WEEK_TIME ? 'filled' : 'outline'}
          color="categoryBlue"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentView(CurrentView.WEEK_TIME)}
        >
          Week Timeline
        </Badge>
        <Badge
          variant={currentView === CurrentView.DAY ? 'filled' : 'outline'}
          color="categoryBlue"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentView(CurrentView.DAY)}
        >
          Day
        </Badge>
      </Group>

      {/* Calendar */}
      <Box style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <CalendarWrapper
          data={transformedEvents}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          currentView={currentView}
          activeTimeDateField="startDate-endDate"
          cellDisplayMode={cellDisplayMode}
          renderItem={renderItem}
          renderItemText={renderItemText}
          onItemClick={onItemClick}
          onCellClick={onCellClick}
          timeDateFormat={{
            hour: 'HH:mm', // 24-hour format
          }}
          locale={enUS}
          weekStartsOn={1} // Monday
          hourRange={hourRange} // Dynamic hour range for day/week timeline views
        />
      </Box>
    </Box>
  );
}
