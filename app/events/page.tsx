'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Text, Stack, useMantineTheme, Box, Loader, Center } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useMediaQuery } from '@mantine/hooks';
import EventCalendar from '@/components/events/EventCalendar';
import { MobileLayout } from '@/components/mobile';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { IconCalendar } from '@tabler/icons-react';

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

export default function EventsPage() {
  const { data: session } = useSession();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [session]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    // Navigate to event detail page or open modal
    window.location.href = `/groups/${event.group.id}`;
  };

  const content = (
    <>
      <Header />
      <Container size="xl" py={isMobile ? 'md' : 'xl'}>
        <Stack gap="lg">
          {/* Header */}
          <Box>
            <Title order={isMobile ? 2 : 1} mb="xs">
              Events Calendar
            </Title>
            <Text c="dimmed" size={isMobile ? 'sm' : 'md'}>
              View all public events and events from your groups
            </Text>
          </Box>

          {/* Loading State */}
          {loading && (
            <Center h={400}>
              <Loader size="lg" color="categoryBlue" />
            </Center>
          )}

          {/* Events Display */}
          {!loading && (
            <>
              {events.length === 0 ? (
                <Center h={400}>
                  <Stack align="center" gap="md">
                    <IconCalendar size={48} color={theme.colors.gray[5]} />
                    <Text c="dimmed" size="lg">
                      No events found
                    </Text>
                    <Text c="dimmed" size="sm" ta="center">
                      {session
                        ? 'Join groups to see their events, or check back later for public events'
                        : 'Sign in to see events from groups you join'}
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <EventCalendar
                  events={events}
                  onSelectEvent={handleSelectEvent}
                />
              )}
            </>
          )}
        </Stack>
      </Container>
      <Footer />
    </>
  );

  // Wrap in MobileLayout if on mobile
  if (isMobile) {
    return <MobileLayout>{content}</MobileLayout>;
  }

  return content;
}
