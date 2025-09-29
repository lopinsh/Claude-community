import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Group,
  Select,
  Text,
  Grid,
  Center,
  Loader,
  Stack,
  Title,
  Button,
  Tabs,
  Badge,
  Paper
} from '@mantine/core';
import { IconPlus, IconUsers, IconCalendar, IconApps, IconList } from '@tabler/icons-react';
import GroupCard from '@/components/groups/GroupCard';
import EventCard from '@/components/events/EventCard';
import CreateGroupModal from '@/components/groups/CreateGroupModal';
import EventCalendar from '@/components/events/EventCalendar';
import EventDetailModal from '@/components/events/EventDetailModal';

interface Group {
  id: string;
  title: string;
  description: string | null;
  location: string;
  maxMembers: number | null;
  groupType: string;
  createdAt: Date;
  creator: { id: string; name: string | null };
  tags: Array<{ tag: { id: string; name: string; level: number } }>;
  events: Array<{
    id: string;
    title: string | null;
    startDateTime: Date;
    endDateTime: Date | null;
    eventType: string;
    visibility: string;
  }>;
  _count: { applications: number; events: number };
}

interface PublicEvent {
  id: string;
  title: string | null;
  description: string | null;
  startDateTime: Date;
  endDateTime: Date | null;
  isAllDay: boolean;
  eventType: string;
  visibility: string;
  requiresApproval: boolean;
  maxMembers: number | null;
  location: string | null;
  group: {
    id: string;
    title: string;
    location: string;
    creator: { id: string; name: string | null };
  };
  _count: { attendees: number };
}

interface MainContentProps {
  groups: Group[];
  publicEvents: PublicEvent[];
  loading: boolean;
  error: string | null;
}


export default function MainContent({ groups, publicEvents, loading, error }: MainContentProps) {
  const { data: session } = useSession();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [eventViewMode, setEventViewMode] = useState<'list' | 'calendar'>('list');
  const [allEvents, setAllEvents] = useState<PublicEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetailModalOpened, setEventDetailModalOpened] = useState(false);

  // Fetch all events (public + private for logged-in users) for calendar view
  const fetchAllEvents = async () => {
    if (activeTab !== 'calendar') return;

    setEventsLoading(true);
    try {
      const response = await fetch('/api/calendar/events');
      if (response.ok) {
        const data = await response.json();
        setAllEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchAllEvents();
    }
  }, [activeTab]);

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailModalOpened(true);
  };

  const handleEventUpdated = () => {
    fetchAllEvents();
  };

  const handleEventDeleted = () => {
    fetchAllEvents();
  };

  if (loading) {
    return (
      <Box p="xl">
        <Center style={{ minHeight: 400 }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="lg" c="dimmed">Loading activities...</Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="xl">
        <Center style={{ minHeight: 400 }}>
          <Stack align="center" gap="md">
            <Text size="lg" c="red" fw={500}>Error loading activities</Text>
            <Text c="dimmed">{error}</Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box p="md" style={{ flex: 1 }}>
      {/* Header with results count and sort */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2} size="h3" mb="xs">
            Community
          </Title>
          <Text c="dimmed" mb="md">
            Discover groups and public events in your area
          </Text>

          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
            <Tabs.List>
              <Tabs.Tab value="all" leftSection={<IconApps size={16} />}>
                All
                <Badge variant="light" size="xs" ml="xs">
                  {groups.length + publicEvents.length}
                </Badge>
              </Tabs.Tab>
              <Tabs.Tab value="groups" leftSection={<IconUsers size={16} />}>
                Groups
                <Badge variant="light" size="xs" ml="xs">
                  {groups.length}
                </Badge>
              </Tabs.Tab>
              <Tabs.Tab value="events" leftSection={<IconList size={16} />}>
                Events
                <Badge variant="light" size="xs" ml="xs">
                  {publicEvents.length}
                </Badge>
              </Tabs.Tab>
              <Tabs.Tab value="calendar" leftSection={<IconCalendar size={16} />}>
                Calendar
                <Badge variant="light" size="xs" ml="xs">
                  {allEvents.length > 0 ? allEvents.length : ''}
                </Badge>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </div>

        <Group>
          {(activeTab === 'events' || activeTab === 'calendar') && (
            <Button.Group>
              <Button
                variant={eventViewMode === 'list' ? 'filled' : 'outline'}
                onClick={() => setEventViewMode('list')}
                size="sm"
                leftSection={<IconList size={14} />}
              >
                List
              </Button>
              <Button
                variant={eventViewMode === 'calendar' ? 'filled' : 'outline'}
                onClick={() => setEventViewMode('calendar')}
                size="sm"
                leftSection={<IconCalendar size={14} />}
              >
                Calendar
              </Button>
            </Button.Group>
          )}

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpened(true)}
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            variant="gradient"
          >
            Create Group
          </Button>
        </Group>
      </Group>

      {/* Content Grid based on active tab */}
      {activeTab === 'all' && (
        <>
          {groups.length === 0 && publicEvents.length === 0 ? (
            <Center style={{ minHeight: 400 }}>
              <Stack align="center" gap="md">
                <Text size="lg" c="dimmed">No groups or events found</Text>
                <Text size="sm" c="dimmed">Be the first to create a group!</Text>
              </Stack>
            </Center>
          ) : (
            <Grid gutter="lg">
              {/* Show groups first */}
              {groups.map((group) => (
                <Grid.Col key={`group-${group.id}`} span={{ base: 12, sm: 6, lg: 4 }}>
                  <GroupCard group={group} />
                </Grid.Col>
              ))}
              {/* Then show public events */}
              {publicEvents.map((event) => (
                <Grid.Col key={`event-${event.id}`} span={{ base: 12, sm: 6, lg: 4 }}>
                  <EventCard event={event} />
                </Grid.Col>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 'groups' && (
        <>
          {groups.length === 0 ? (
            <Center style={{ minHeight: 400 }}>
              <Stack align="center" gap="md">
                <Text size="lg" c="dimmed">No groups found</Text>
                <Text size="sm" c="dimmed">Create the first group in your community!</Text>
              </Stack>
            </Center>
          ) : (
            <Grid gutter="lg">
              {groups.map((group) => (
                <Grid.Col key={group.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <GroupCard group={group} />
                </Grid.Col>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 'events' && (
        <>
          {publicEvents.length === 0 ? (
            <Center style={{ minHeight: 400 }}>
              <Stack align="center" gap="md">
                <Text size="lg" c="dimmed">No public events found</Text>
                <Text size="sm" c="dimmed">Join a group to see more events!</Text>
              </Stack>
            </Center>
          ) : (
            <>
              {eventViewMode === 'list' ? (
                <Grid gutter="lg">
                  {publicEvents.map((event) => (
                    <Grid.Col key={event.id} span={{ base: 12, sm: 6, lg: 4 }}>
                      <EventCard event={event} />
                    </Grid.Col>
                  ))}
                </Grid>
              ) : (
                <Paper p="lg" withBorder>
                  <EventCalendar
                    events={publicEvents.map(event => ({
                      ...event,
                      group: {
                        id: event.group.id,
                        title: event.group.title,
                        location: event.group.location,
                        creator: event.group.creator,
                      },
                    }))}
                    onSelectEvent={(event) => handleEventClick(event.id)}
                    height={600}
                  />
                </Paper>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'calendar' && (
        <>
          {eventsLoading ? (
            <Center style={{ minHeight: 400 }}>
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text>Loading calendar...</Text>
              </Stack>
            </Center>
          ) : allEvents.length === 0 ? (
            <Center style={{ minHeight: 400 }}>
              <Stack align="center" gap="md">
                <Text size="lg" c="dimmed">No events found</Text>
                <Text size="sm" c="dimmed">
                  {session ? 'Join groups or create public events to see them here!' : 'Sign in to see events from your groups!'}
                </Text>
              </Stack>
            </Center>
          ) : (
            <>
              {eventViewMode === 'list' ? (
                <Grid gutter="lg">
                  {allEvents.map((event) => (
                    <Grid.Col key={event.id} span={{ base: 12, sm: 6, lg: 4 }}>
                      <EventCard event={event} />
                    </Grid.Col>
                  ))}
                </Grid>
              ) : (
                <Paper p="lg" withBorder>
                  <EventCalendar
                    events={allEvents.map(event => ({
                      ...event,
                      group: {
                        id: event.group.id,
                        title: event.group.title,
                        location: event.group.location,
                        creator: event.group.creator,
                      },
                    }))}
                    onSelectEvent={(event) => handleEventClick(event.id)}
                    height={600}
                  />
                </Paper>
              )}
            </>
          )}
        </>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        opened={eventDetailModalOpened}
        onClose={() => setEventDetailModalOpened(false)}
        eventId={selectedEventId}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventDeleted}
      />
    </Box>
  );
}