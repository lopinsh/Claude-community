/**
 * ActivityCalendar Component
 * Wrapper around LightweightCalendarWrapper for consistent calendar across the app
 * Single source of truth - uses the forked react-lightweight-calendar
 */

'use client';

import LightweightCalendarWrapper from './LightweightCalendarWrapper';
import { CurrentView } from './lightweight/Calendar/Calendar.types';

interface ActivityCalendarProps {
  events: Array<{
    id: string;
    title: string | null;
    eventType: string;
    location?: string | null;
    startDateTime: string;
    endDateTime?: string | null;
    group?: {
      id: string;
      title: string;
      location: string;
    };
    _count?: {
      attendees: number;
    };
  }>;
  onEventClick?: (eventId: string) => void;
  onCellClick?: (date: Date) => void;
  defaultView?: 'month' | 'week' | 'day';
}

export default function ActivityCalendar({
  events,
  onEventClick,
  defaultView = 'month',
}: ActivityCalendarProps) {
  const handleSelectEvent = (event: any) => {
    if (onEventClick) {
      onEventClick(event._originalEvent?.id || event.id);
    }
  };

  // Map defaultView to CurrentView enum
  const viewMap = {
    'month': CurrentView.MONTH,
    'week': CurrentView.WEEK_TIME,
    'day': CurrentView.DAY,
  };

  return (
    <LightweightCalendarWrapper
      events={events}
      onSelectEvent={handleSelectEvent}
      onSelectSlot={() => {}}
      defaultView={viewMap[defaultView] || CurrentView.MONTH}
    />
  );
}
