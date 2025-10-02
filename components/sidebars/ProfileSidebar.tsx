import {
  Stack,
  Paper,
  Text,
  Group,
  Button,
  ThemeIcon
} from '@mantine/core';
import {
  IconUser,
  IconSettings,
  IconBell,
  IconShield
} from '@tabler/icons-react';
import ContextualSidebar from '../layout/ContextualSidebar';

interface ProfileSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function ProfileSidebar({
  isCollapsed = false,
  onToggleCollapse
}: ProfileSidebarProps) {
  return (
    <ContextualSidebar
      backHref="/"
      backLabel="Back to Discover"
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      {/* Quick Actions */}
      <div>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="sm">
          Settings
        </Text>
        <Stack gap="xs">
          <Button
            leftSection={<IconUser size={16} />}
            variant="light"
            fullWidth
            size="sm"
          >
            Edit Profile
          </Button>

          <Button
            leftSection={<IconBell size={16} />}
            variant="light"
            color="blue"
            fullWidth
            size="sm"
          >
            Notifications
          </Button>

          <Button
            leftSection={<IconShield size={16} />}
            variant="light"
            color="gray"
            fullWidth
            size="sm"
          >
            Privacy
          </Button>
        </Stack>
      </div>
    </ContextualSidebar>
  );
}