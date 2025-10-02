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
  Paper,
  TextInput,
  SimpleGrid,
  useMantineTheme,
  useMantineColorScheme
} from '@mantine/core';
import { IconPlus, IconUsers, IconCalendar, IconApps, IconList, IconSearch } from '@tabler/icons-react';
import GroupCard from '@/components/groups/GroupCard';
import EventCard from '@/components/events/EventCard';
import CreateGroupModal from '@/components/groups/CreateGroupModal';
// import EventCalendar from '@/components/events/EventCalendar'; // TODO: Install react-lightweight-calendar
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateGroup: () => void;
  onSearchClick?: () => void;
}


export default function MainContent({ groups, publicEvents, loading, error, searchQuery, onSearchChange, onCreateGroup, onSearchClick }: MainContentProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { data: session } = useSession();
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [eventViewMode, setEventViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetailModalOpened, setEventDetailModalOpened] = useState(false);

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailModalOpened(true);
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
    <Box w="100%">
      {/* Header with tabs, search, and view toggle */}
      <Stack gap="lg" mb="xl">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap={2} p={4} bg={colorScheme === 'dark' ? 'dark.6' : 'gray.1'} style={{ borderRadius: theme.radius.lg }}>
            {[
              { key: 'all', label: 'All', icon: IconApps, count: groups.length + publicEvents.length },
              { key: 'groups', label: 'Groups', icon: IconUsers, count: groups.length },
              { key: 'events', label: 'Events', icon: IconList, count: publicEvents.length }
            ].map(({ key, label, icon: Icon, count }) => (
              <Button
                key={key}
                onClick={() => setActiveTab(key)}
                variant={activeTab === key ? (colorScheme === 'dark' ? 'light' : 'white') : 'subtle'}
                color={activeTab === key ? 'categoryBlue' : 'gray'}
                size="sm"
                leftSection={<Icon size={16} />}
                rightSection={count > 0 ? (
                  <Badge
                    size="xs"
                    variant="filled"
                    color={activeTab === key ? 'categoryPeach' : 'gray'}
                    style={{ minWidth: '18px' }}
                  >
                    {count}
                  </Badge>
                ) : null}
                fw={activeTab === key ? 600 : 500}
                style={{
                  boxShadow: activeTab === key ? theme.shadows.sm : 'none',
                  transition: theme.other.transition
                }}
              >
                {label}
              </Button>
            ))}
          </Group>

          {/* Search Bar - Moved here */}
          <Box style={{ flex: 1, maxWidth: '400px' }}>
            <TextInput
              placeholder="Search groups and events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
              onFocus={onSearchClick ? () => onSearchClick() : undefined}
              readOnly={!!onSearchClick}
              leftSection={<IconSearch size={18} />}
              size="md"
              style={{ cursor: onSearchClick ? 'pointer' : undefined }}
            />
          </Box>

          {/* View Toggle for Events Tab */}
          {activeTab === 'events' && (
            <Group gap={2} p={2} bg={colorScheme === 'dark' ? 'dark.6' : 'gray.1'} style={{ borderRadius: theme.radius.md }}>
              <Button
                onClick={() => setEventViewMode('list')}
                variant={eventViewMode === 'list' ? (colorScheme === 'dark' ? 'light' : 'white') : 'subtle'}
                color={eventViewMode === 'list' ? 'categoryTeal' : 'gray'}
                size="xs"
                leftSection={<IconList size={14} />}
                fw={500}
                style={{
                  boxShadow: eventViewMode === 'list' ? theme.shadows.xs : 'none',
                  transition: theme.other.transition
                }}
              >
                List
              </Button>
              <Button
                onClick={() => setEventViewMode('calendar')}
                variant={eventViewMode === 'calendar' ? (colorScheme === 'dark' ? 'light' : 'white') : 'subtle'}
                color={eventViewMode === 'calendar' ? 'categoryTeal' : 'gray'}
                size="xs"
                leftSection={<IconCalendar size={14} />}
                fw={500}
                style={{
                  boxShadow: eventViewMode === 'calendar' ? theme.shadows.xs : 'none',
                  transition: theme.other.transition
                }}
              >
                Calendar
              </Button>
            </Group>
          )}
        </Group>
      </Stack>

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
            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 3 }}
              spacing={{ base: 'md', lg: 'lg' }}
              verticalSpacing={{ base: 'md', lg: 'lg' }}
            >
              {/* Show groups first */}
              {groups.map((group) => (
                <GroupCard key={`group-${group.id}`} group={group} />
              ))}
              {/* Then show public events */}
              {publicEvents.map((event) => (
                <EventCard key={`event-${event.id}`} event={event} />
              ))}
            </SimpleGrid>
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
            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 3 }}
              spacing={{ base: 'md', lg: 'lg' }}
              verticalSpacing={{ base: 'md', lg: 'lg' }}
            >
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </SimpleGrid>
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
                <SimpleGrid
                  cols={{ base: 1, sm: 2, lg: 3 }}
                  spacing={{ base: 'md', lg: 'lg' }}
                  verticalSpacing={{ base: 'md', lg: 'lg' }}
                >
                  {publicEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </SimpleGrid>
              ) : (
                <Paper p="xl" withBorder>
                  <Stack align="center" gap="md">
                    <Text size="lg" fw={500} c="dimmed">
                      Calendar view temporarily disabled
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Please use list view for now
                    </Text>
                  </Stack>
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
      />
    </Box>
  );
}