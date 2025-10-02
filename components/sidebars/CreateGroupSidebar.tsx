import {
  Stack,
  Paper,
  Text,
  Group,
  ThemeIcon,
  List
} from '@mantine/core';
import {
  IconInfoCircle,
  IconCalendar,
  IconUsers,
  IconMapPin
} from '@tabler/icons-react';
import ContextualSidebar from '../layout/ContextualSidebar';

interface CreateGroupSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function CreateGroupSidebar({
  isCollapsed = false,
  onToggleCollapse
}: CreateGroupSidebarProps) {
  return (
    <ContextualSidebar
      backHref="/"
      backLabel="Back to Discover"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      {/* Tips */}
      <Paper p="md" radius="md" withBorder style={{ backgroundColor: '#ffffff' }}>
        <Group gap="xs" mb="sm">
          <ThemeIcon size="sm" variant="light" color="blue">
            <IconInfoCircle size={14} />
          </ThemeIcon>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
            Tips
          </Text>
        </Group>
        <List size="sm" spacing="xs">
          <List.Item>Choose a clear, descriptive title</List.Item>
          <List.Item>Add details about what to expect</List.Item>
          <List.Item>Set a realistic member limit</List.Item>
          <List.Item>Include location information</List.Item>
        </List>
      </Paper>

      {/* Group Types */}
      <div>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="sm">
          Group Types
        </Text>
        <Stack gap="xs">
          <Paper p="xs" radius="md" withBorder>
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="orange">
                <IconCalendar size={14} />
              </ThemeIcon>
              <div>
                <Text size="xs" fw={500}>Single Event</Text>
                <Text size="xs" c="dimmed">One-time activity</Text>
              </div>
            </Group>
          </Paper>

          <Paper p="xs" radius="md" withBorder>
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="green">
                <IconUsers size={14} />
              </ThemeIcon>
              <div>
                <Text size="xs" fw={500}>Recurring Group</Text>
                <Text size="xs" c="dimmed">Regular meetups</Text>
              </div>
            </Group>
          </Paper>
        </Stack>
      </div>
    </ContextualSidebar>
  );
}