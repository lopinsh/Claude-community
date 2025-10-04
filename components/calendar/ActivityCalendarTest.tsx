'use client';

import { useState } from 'react';
import Calendar from './lightweight/Calendar/CalendarComponent';
import { Box } from '@mantine/core';

interface ActivityCalendarTestProps {
  events?: any[];
}

export default function ActivityCalendarTest({ events = [] }: ActivityCalendarTestProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Transform our events to lightweight calendar format
  const calendarItems = events.map(event => ({
    id: event.id,
    startDate: new Date(event.startDateTime),
    endDate: event.endDateTime ? new Date(event.endDateTime) : new Date(event.startDateTime),
    title: event.title || 'Untitled',
    color: event.eventType === 'SPECIAL' ? '#577590' : '#43aa8b', // categoryBlue : categoryTeal
  }));

  return (
    <Box>
      <Calendar
        items={calendarItems}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        colorDots={[]}
      />
    </Box>
  );
}
