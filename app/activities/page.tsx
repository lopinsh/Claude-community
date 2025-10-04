'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Container,
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Button,
  Center,
  Loader,
  Alert,
  Tabs,
  Badge,
  Select,
  Modal,
  Card
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconEye,
  IconLock,
  IconAlertCircle,
  IconFilter
} from '@tabler/icons-react';
import Header from '@/components/layout/Header';
import LightweightCalendarWrapper from '@/components/calendar/LightweightCalendarWrapper';
import { CurrentView } from '@/components/calendar/lightweight/Calendar/Calendar.types';

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
    creator: {
      id: string;
      name: string | null;
    };
  };
  _count: {
    attendees: number;
  };
}

export default function ActivitiesPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailModal, setEventDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all public events and events from user's groups
      const response = await fetch('/api/calendar/events');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err: any) {
      console.error('Calendar fetch error:', err);
      setError(err.message || 'An error occurred while loading the calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDetailModal(true);
  };

  // Filter events based on active tab and filters
  const filteredEvents = events.filter(event => {
    // Tab filtering
    if (activeTab === 'public' && event.visibility !== 'PUBLIC') return false;
    if (activeTab === 'private' && event.visibility !== 'PRIVATE') return false;

    // Event type filtering
    if (eventTypeFilter && event.eventType !== eventTypeFilter) return false;

    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Header />
        <Container size="xl" py="xl">
          <Center style={{ minHeight: 400 }}>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text>Loading activities...</Text>
            </Stack>
          </Center>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <Header />

      <Container size="xl" py="md">
        <Stack gap="lg">
          {/* Header */}
          <Paper p="lg" withBorder>
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={1} size="h2" mb="xs">
                  Community Activities
                </Title>
                <Text c="dimmed">
                  Discover upcoming events from groups across the community
                </Text>
              </div>

              <Group>
                <Select
                  placeholder="Filter by type"
                  leftSection={<IconFilter size={16} />}
                  data={[
                    { value: '', label: 'All Types' },
                    { value: 'REGULAR', label: 'Regular Events' },
                    { value: 'SPECIAL', label: 'Special Events' },
                  ]}
                  value={eventTypeFilter}
                  onChange={(value) => setEventTypeFilter(value || '')}
                  w={150}
                />
              </Group>
            </Group>

            {/* Event Type Tabs */}
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')} mt="md">
              <Tabs.List>
                <Tabs.Tab value="all" leftSection={<IconCalendar size={16} />}>
                  All Events
                  <Badge variant="light" size="xs" ml="xs">
                    {events.length}
                  </Badge>
                </Tabs.Tab>
                <Tabs.Tab value="public" leftSection={<IconEye size={16} />}>
                  Public Events
                  <Badge variant="light" size="xs" ml="xs" color="green">
                    {events.filter(e => e.visibility === 'PUBLIC').length}
                  </Badge>
                </Tabs.Tab>
                <Tabs.Tab value="private" leftSection={<IconLock size={16} />}>
                  Group Events
                  <Badge variant="light" size="xs" ml="xs" color="blue">
                    {events.filter(e => e.visibility === 'PRIVATE').length}
                  </Badge>
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </Paper>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}

          {/* Calendar */}
          <Paper p="lg" withBorder>
            {filteredEvents.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <IconCalendar size={48} color="var(--mantine-color-gray-5)" />
                  <Text size="lg" c="dimmed">No events found</Text>
                  <Text size="sm" c="dimmed">
                    {activeTab === 'all'
                      ? 'There are no events scheduled yet.'
                      : `No ${activeTab} events found.`
                    }
                  </Text>
                </Stack>
              </Center>
            ) : (
              <LightweightCalendarWrapper
                events={filteredEvents}
                onSelectEvent={handleSelectEvent}
                defaultView={CurrentView.MONTH}
                cellClickMode="navigate"
              />
            )}
          </Paper>
        </Stack>
      </Container>

      {/* Event Detail Modal */}
      <Modal
        opened={eventDetailModal}
        onClose={() => setEventDetailModal(false)}
        title="Event Details"
        size="md"
        centered
      >
        {selectedEvent && (
          <Stack gap="md">
            <div>
              <Title order={3} mb="xs">
                {selectedEvent.title || selectedEvent.group.title}
              </Title>
              <Text c="dimmed" mb="sm">
                Organized by {selectedEvent.group.title}
              </Text>
            </div>

            {selectedEvent.description && (
              <div>
                <Text fw={500} size="sm" mb="xs">Description</Text>
                <Text size="sm">{selectedEvent.description}</Text>
              </div>
            )}

            <Group gap="xl">
              <Group gap="xs">
                <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
                <div>
                  <Text size="sm" fw={500}>Date & Time</Text>
                  <Text size="sm" c="dimmed">
                    {selectedEvent.isAllDay
                      ? new Date(selectedEvent.startDateTime).toLocaleDateString()
                      : `${new Date(selectedEvent.startDateTime).toLocaleString()}${
                          selectedEvent.endDateTime
                            ? ` - ${new Date(selectedEvent.endDateTime).toLocaleString()}`
                            : ''
                        }`
                    }
                  </Text>
                </div>
              </Group>

              <Group gap="xs">
                <IconMapPin size={16} color="var(--mantine-color-green-6)" />
                <div>
                  <Text size="sm" fw={500}>Location</Text>
                  <Text size="sm" c="dimmed">
                    {selectedEvent.location || selectedEvent.group.location}
                  </Text>
                </div>
              </Group>

              <Group gap="xs">
                <IconUsers size={16} color="var(--mantine-color-orange-6)" />
                <div>
                  <Text size="sm" fw={500}>Attendance</Text>
                  <Text size="sm" c="dimmed">
                    {selectedEvent._count.attendees} attending
                  </Text>
                </div>
              </Group>
            </Group>

            <Group gap="sm">
              <Badge
                variant="light"
                color={selectedEvent.eventType === 'SPECIAL' ? 'orange' : 'blue'}
              >
                {selectedEvent.eventType} Event
              </Badge>
              <Badge
                variant="light"
                color={selectedEvent.visibility === 'PUBLIC' ? 'green' : 'blue'}
              >
                {selectedEvent.visibility}
              </Badge>
            </Group>

            <Group justify="flex-end" mt="md">
              <Button
                variant="filled"
                onClick={() => window.open(`/groups/${selectedEvent.group.id}`, '_blank')}
              >
                View Group
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}