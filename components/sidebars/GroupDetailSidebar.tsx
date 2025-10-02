import {
  Stack,
  Paper,
  Text,
  Group,
  Badge,
  Button,
  Divider,
  ThemeIcon,
  useMantineColorScheme
} from '@mantine/core';
import {
  IconUsers,
  IconCalendar,
  IconMapPin,
  IconEdit,
  IconShare,
  IconFlag
} from '@tabler/icons-react';
import ContextualSidebar from '../layout/ContextualSidebar';

interface GroupDetailSidebarProps {
  group: {
    id: string;
    title: string;
    location: string;
    _count: {
      applications: number;
      events: number;
    };
    maxMembers?: number | null;
    creator: {
      id: string;
    };
  };
  currentUserId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function GroupDetailSidebar({
  group,
  currentUserId,
  isCollapsed = false,
  onToggleCollapse
}: GroupDetailSidebarProps) {
  const { colorScheme } = useMantineColorScheme();
  const isOwner = currentUserId === group.creator.id;

  return (
    <ContextualSidebar
      backHref="/"
      backLabel="Back to Discover"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      {/* Quick Stats */}
      <Paper p="md" radius="md" withBorder>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="sm">
          Quick Stats
        </Text>
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconUsers size={14} />
            </ThemeIcon>
            <Text size="sm">
              {group._count.applications} / {group.maxMembers || '∞'} members
            </Text>
          </Group>

          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="green">
              <IconCalendar size={14} />
            </ThemeIcon>
            <Text size="sm">
              {group._count.events} {group._count.events === 1 ? 'event' : 'events'}
            </Text>
          </Group>

          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="orange">
              <IconMapPin size={14} />
            </ThemeIcon>
            <Text size="sm">{group.location}</Text>
          </Group>
        </Stack>
      </Paper>

      {/* Quick Actions */}
      <div>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="sm">
          Actions
        </Text>
        <Stack gap="xs">
          {isOwner && (
            <Button
              leftSection={<IconEdit size={16} />}
              variant="light"
              fullWidth
              size="sm"
            >
              Edit Group
            </Button>
          )}

          <Button
            leftSection={<IconShare size={16} />}
            variant="light"
            color="blue"
            fullWidth
            size="sm"
          >
            Share
          </Button>

          <Button
            leftSection={<IconFlag size={16} />}
            variant="subtle"
            color="red"
            fullWidth
            size="sm"
          >
            Report
          </Button>
        </Stack>
      </div>
    </ContextualSidebar>
  );
}