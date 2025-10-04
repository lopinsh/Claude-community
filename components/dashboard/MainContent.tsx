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
import { IconPlus, IconUsers, IconSearch, IconCalendarEvent, IconUserPlus, IconSparkles, IconLayoutGrid, IconList } from '@tabler/icons-react';
import GroupCard from '@/components/groups/GroupCard';
import GroupCompactView from '@/components/groups/GroupCompactView';
import CreateGroupModal from '@/components/groups/CreateGroupModal';
import { GroupCardSkeleton, ListSkeleton } from '@/components/common';

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

interface MainContentProps {
  groups: Group[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateGroup: () => void;
  onSearchClick?: () => void;
}


export default function MainContent({ groups, loading, error, searchQuery, onSearchChange, onCreateGroup, onSearchClick }: MainContentProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { data: session } = useSession();
  const [createModalOpened, setCreateModalOpened] = useState(false);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<'card' | 'compact'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('groups-view-mode');
      return (saved === 'card' || saved === 'compact') ? saved : 'card';
    }
    return 'card';
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('groups-view-mode', viewMode);
    }
  }, [viewMode]);

  // Quick filters state
  const [showHasEvents, setShowHasEvents] = useState(false);
  const [showAcceptingMembers, setShowAcceptingMembers] = useState(false);
  const [showNewGroups, setShowNewGroups] = useState(false);

  // Filter groups based on quick filters
  const filteredGroups = groups.filter(group => {
    if (showHasEvents && group._count.events === 0) return false;
    if (showAcceptingMembers && group.maxMembers && group._count.applications >= group.maxMembers) return false;
    if (showNewGroups) {
      const createdDate = new Date(group.createdAt);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 30) return false; // Show groups created in last 30 days
    }
    return true;
  });

  if (loading) {
    return (
      <Box p="xl" w="100%">
        <ListSkeleton count={6} columns={{ base: 1, sm: 2, lg: 3 }}>
          <GroupCardSkeleton />
        </ListSkeleton>
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
      {/* Header with search */}
      <Stack gap="lg" mb="xl">
        {/* Quick Filters */}
        <Group gap="xs">
          <Button
            variant={showHasEvents ? 'light' : 'subtle'}
            color={showHasEvents ? 'categoryTeal' : 'gray'}
            size="sm"
            leftSection={<IconCalendarEvent size={16} />}
            onClick={() => setShowHasEvents(!showHasEvents)}
            style={{
              transition: theme.other.transition
            }}
          >
            Has Events
          </Button>
          <Button
            variant={showAcceptingMembers ? 'light' : 'subtle'}
            color={showAcceptingMembers ? 'categoryGreen' : 'gray'}
            size="sm"
            leftSection={<IconUserPlus size={16} />}
            onClick={() => setShowAcceptingMembers(!showAcceptingMembers)}
            style={{
              transition: theme.other.transition
            }}
          >
            Accepting Members
          </Button>
          <Button
            variant={showNewGroups ? 'light' : 'subtle'}
            color={showNewGroups ? 'categoryOrange' : 'gray'}
            size="sm"
            leftSection={<IconSparkles size={16} />}
            onClick={() => setShowNewGroups(!showNewGroups)}
            style={{
              transition: theme.other.transition
            }}
          >
            New Groups
          </Button>
        </Group>

        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          {/* Search Bar */}
          <Box style={{ flex: 1, maxWidth: '400px' }}>
            <TextInput
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
              onFocus={onSearchClick ? () => onSearchClick() : undefined}
              readOnly={!!onSearchClick}
              leftSection={<IconSearch size={18} />}
              size="md"
              style={{ cursor: onSearchClick ? 'pointer' : undefined }}
            />
          </Box>

          {/* View Mode Toggle */}
          <Group gap={2} p={2} bg={colorScheme === 'dark' ? 'dark.6' : 'gray.1'} style={{ borderRadius: theme.radius.md }}>
            <Button
              onClick={() => setViewMode('card')}
              variant={viewMode === 'card' ? (colorScheme === 'dark' ? 'light' : 'white') : 'subtle'}
              color={viewMode === 'card' ? 'categoryBlue' : 'gray'}
              size="sm"
              leftSection={<IconLayoutGrid size={16} />}
              fw={500}
              style={{
                boxShadow: viewMode === 'card' ? theme.shadows.xs : 'none',
                transition: theme.other.transition
              }}
            >
              Card
            </Button>
            <Button
              onClick={() => setViewMode('compact')}
              variant={viewMode === 'compact' ? (colorScheme === 'dark' ? 'light' : 'white') : 'subtle'}
              color={viewMode === 'compact' ? 'categoryBlue' : 'gray'}
              size="sm"
              leftSection={<IconList size={16} />}
              fw={500}
              style={{
                boxShadow: viewMode === 'compact' ? theme.shadows.xs : 'none',
                transition: theme.other.transition
              }}
            >
              Compact
            </Button>
          </Group>
        </Group>
      </Stack>

      {/* Content - Groups only */}
      {filteredGroups.length === 0 ? (
        <Center style={{ minHeight: 400 }}>
          <Stack align="center" gap="md">
            <Text size="lg" c="dimmed">No groups found</Text>
            <Text size="sm" c="dimmed">
              {groups.length === 0 ? 'Be the first to create a group!' : 'Try adjusting your filters'}
            </Text>
          </Stack>
        </Center>
      ) : viewMode === 'card' ? (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: 'md', lg: 'lg' }}
          verticalSpacing={{ base: 'md', lg: 'lg' }}
        >
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </SimpleGrid>
      ) : (
        <GroupCompactView groups={filteredGroups} />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
      />
    </Box>
  );
}