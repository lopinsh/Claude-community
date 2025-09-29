'use client';

import { useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Box, Badge, Text, Stack } from '@mantine/core';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

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
  height?: number;
}

export default function EventCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  height = 600
}: EventCalendarProps) {
  // Transform events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title || event.group.title,
      start: new Date(event.startDateTime),
      end: event.endDateTime
        ? new Date(event.endDateTime)
        : new Date(new Date(event.startDateTime).getTime() + 60 * 60 * 1000), // Default 1 hour
      allDay: event.isAllDay,
      resource: event, // Store original event data
    }));
  }, [events]);

  // Custom event component
  const EventComponent = ({ event }: { event: any }) => {
    const originalEvent: CalendarEvent = event.resource;

    return (
      <Stack gap={2} style={{ height: '100%', padding: '2px 4px' }}>
        <Text size="xs" fw={500} truncate>
          {event.title}
        </Text>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <Badge
            size="xs"
            variant="dot"
            color={originalEvent.eventType === 'SPECIAL' ? 'orange' : 'blue'}
          >
            {originalEvent.eventType.toLowerCase()}
          </Badge>
          {originalEvent.visibility === 'PUBLIC' && (
            <Badge size="xs" variant="dot" color="green">
              public
            </Badge>
          )}
        </div>
      </Stack>
    );
  };

  // Custom agenda event component
  const AgendaEvent = ({ event }: { event: any }) => {
    const originalEvent: CalendarEvent = event.resource;

    return (
      <Stack gap="xs" p="xs">
        <div>
          <Text fw={500}>{event.title}</Text>
          <Text size="sm" c="dimmed">
            {originalEvent.group.title}
          </Text>
        </div>
        {originalEvent.description && (
          <Text size="sm">{originalEvent.description}</Text>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge
            size="sm"
            variant="light"
            color={originalEvent.eventType === 'SPECIAL' ? 'orange' : 'blue'}
          >
            {originalEvent.eventType}
          </Badge>
          {originalEvent.visibility === 'PUBLIC' && (
            <Badge size="sm" variant="light" color="green">
              Public Event
            </Badge>
          )}
          <Badge size="sm" variant="outline">
            {originalEvent._count.attendees} attending
          </Badge>
        </div>
        <Text size="xs" c="dimmed">
          📍 {originalEvent.location || originalEvent.group.location}
        </Text>
      </Stack>
    );
  };

  // Custom day header
  const CustomHeader = ({ date, localizer }: { date: Date; localizer: any }) => {
    const today = moment().startOf('day');
    const currentDate = moment(date).startOf('day');
    const isToday = today.isSame(currentDate);

    return (
      <Text
        fw={isToday ? 600 : 400}
        c={isToday ? 'blue' : undefined}
        size="sm"
      >
        {localizer.format(date, 'ddd MM/DD')}
      </Text>
    );
  };

  const handleSelectEvent = (event: any) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource);
    }
  };

  const eventStyleGetter = (event: any) => {
    const originalEvent: CalendarEvent = event.resource;

    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    // Color code by event type
    if (originalEvent.eventType === 'SPECIAL') {
      backgroundColor = '#fd7e14';
      borderColor = '#fd7e14';
    }

    // Lighter colors for public events
    if (originalEvent.visibility === 'PUBLIC') {
      backgroundColor = backgroundColor + '88'; // Add transparency
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
      }
    };
  };

  return (
    <Box style={{ height }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"
        titleAccessor="title"
        onSelectEvent={handleSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        step={30}
        showMultiDayTimes
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          agenda: {
            event: AgendaEvent,
          },
          month: {
            header: CustomHeader,
          },
          week: {
            header: CustomHeader,
          },
        }}
        messages={{
          today: 'Today',
          previous: 'Back',
          next: 'Next',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Time',
          event: 'Event',
          noEventsInRange: 'No events found',
          showMore: (total: number) => `+${total} more`,
        }}
        formats={{
          agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
          agendaDateFormat: 'ddd MMM DD',
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
        }}
        style={{
          height: '100%',
          fontFamily: 'inherit',
        }}
      />
    </Box>
  );
}