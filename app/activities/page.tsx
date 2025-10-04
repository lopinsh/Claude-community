'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Badge,
  Select,
  Modal,
  Card,
  Box,
  useMantineColorScheme,
  useMantineTheme
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconAlertCircle,
  IconFilter
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import MainLayout from '@/components/layout/MainLayout';
import LeftSidebar from '@/components/dashboard/LeftSidebar';
import { FilterDrawer, SearchOverlay } from '@/components/mobile';
import LightweightCalendarWrapper from '@/components/calendar/LightweightCalendarWrapper';
import { CurrentView } from '@/components/calendar/lightweight/Calendar/Calendar.types';
import { useFilterStore } from '@/hooks/useFilterStore';

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
  const { data: session, status } = useSession();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailModal, setEventDetailModal] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');

  // Filter state from shared store
  const {
    searchQuery,
    selectedCategories,
    selectedLevel2,
    selectedLevel3,
    selectedLocation,
    setSearchQuery,
    setSelectedCategories,
    setSelectedLevel2,
    setSelectedLevel3,
    setSelectedLocation,
  } = useFilterStore();

  // Search overlay state
  const [searchOverlayOpened, setSearchOverlayOpened] = useState(false);

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile sidebar drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
      if (selectedLevel2.length > 0) params.set('level2', selectedLevel2.join(','));
      if (selectedLevel3.length > 0) params.set('level3', selectedLevel3.join(','));
      if (selectedLocation) params.set('location', selectedLocation);

      // Fetch all public events and events from user's groups
      const response = await fetch(`/api/calendar/events?${params.toString()}`);

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
  }, [searchQuery, selectedCategories, selectedLevel2, selectedLevel3, selectedLocation]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDetailModal(true);
  };

  // Filter events based on event type only (authorization handled by backend)
  const filteredEvents = events.filter(event => {
    if (eventTypeFilter && event.eventType !== eventTypeFilter) return false;
    return true;
  });

  // Calculate total event count for stats
  const totalEventCount = useMemo(() => filteredEvents.length, [filteredEvents]);

  if (status === 'loading') {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <MainLayout onBurgerClick={isMobile ? () => setMobileSidebarOpen(true) : undefined}>
      <Box style={{
        display: isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : (sidebarCollapsed ? '60px 1fr' : 'minmax(320px, 320px) 1fr'),
        transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: 'calc(100vh - 72px)',
        gap: 0,
        flex: 1,
      }}>
        {/* Hide sidebar on mobile */}
        {!isMobile && (
          <LeftSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            selectedLevel2={selectedLevel2}
            onLevel2Change={setSelectedLevel2}
            selectedLevel3={selectedLevel3}
            onLevel3Change={setSelectedLevel3}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            itemCount={totalEventCount}
            totalMembers={0}
            onCreateGroup={() => {}}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        <Box
          p={isMobile ? 'md' : 'clamp(24px, 4vw, 40px)'}
          bg={colorScheme === 'dark' ? 'dark.8' : 'white'}
          style={{
            borderLeft: isMobile ? 'none' : `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
            overflow: 'auto',
            flex: 1,
          }}
        >
          <Stack gap="lg">
            {/* Header */}
            <Paper p="lg" withBorder>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <div>
                  <Title order={1} size="h2" mb="xs">
                    Community Activities
                  </Title>
                  <Text c="dimmed">
                    Discover upcoming events from groups across the community
                  </Text>
                </div>

                <Group>
                  <Badge variant="light" size="lg" color="categoryBlue">
                    {totalEventCount} events
                  </Badge>
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
            </Paper>

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {error}
              </Alert>
            )}

            {/* Calendar */}
            <Paper p="lg" withBorder>
              {loading ? (
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <Loader size="lg" />
                    <Text>Loading activities...</Text>
                  </Stack>
                </Center>
              ) : filteredEvents.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <IconCalendar size={48} color="var(--mantine-color-gray-5)" />
                    <Text size="lg" c="dimmed">No events found</Text>
                    <Text size="sm" c="dimmed">
                      Try adjusting your filters to see more events
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
        </Box>
      </Box>

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <FilterDrawer
          opened={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          selectedLevel2={selectedLevel2}
          onLevel2Change={setSelectedLevel2}
          selectedLevel3={selectedLevel3}
          onLevel3Change={setSelectedLevel3}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          itemCount={totalEventCount}
          totalMembers={0}
          onCreateGroup={() => {}}
        />
      )}

      {/* Search Overlay */}
      <SearchOverlay opened={searchOverlayOpened} onClose={() => setSearchOverlayOpened(false)} />

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