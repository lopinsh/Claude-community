import { Stack, Button, Divider, useMantineTheme } from '@mantine/core';
import { IconEdit, IconPlus, IconUsers, IconFlag, IconLogout, IconUserPlus, IconCheck } from '@tabler/icons-react';
import { Group } from '@/app/groups/[id]/page';

interface GroupActionsSidebarProps {
  group: Group;
  userRole: 'visitor' | 'member' | 'owner' | 'moderator';
  onEdit?: () => void;
  onCreateEvent?: () => void;
  onManageMembers?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onReport?: () => void;
  onApply?: () => void;  // For private groups
  onApprove?: () => void; // For group owners managing applications
}

export default function GroupActionsSidebar({
  group,
  userRole,
  onEdit,
  onCreateEvent,
  onManageMembers,
  onJoin,
  onLeave,
  onReport,
  onApply,
  onApprove
}: GroupActionsSidebarProps) {
  const theme = useMantineTheme();

  return (
    <Stack gap="sm">
      {userRole === 'visitor' && (
        <>
          {group.groupType === 'PRIVATE' ? (
            <Button
              leftSection={<IconUserPlus size={16} />}
              variant="light"
              color="blue"
              fullWidth
              onClick={onApply}
            >
              Request to Join
            </Button>
          ) : (
            <Button
              leftSection={<IconUserPlus size={16} />}
              variant="light"
              color="blue"
              fullWidth
              onClick={onJoin}
            >
              Join Group
            </Button>
          )}
          <Button
            leftSection={<IconFlag size={16} />}
            variant="subtle"
            color="red"
            fullWidth
            onClick={onReport}
          >
            Report
          </Button>
        </>
      )}

      {userRole === 'member' && (
        <>
          <Button
            leftSection={<IconLogout size={16} />}
            variant="outline"
            color="red"
            fullWidth
            onClick={onLeave}
          >
            Leave Group
          </Button>
          <Button
            leftSection={<IconFlag size={16} />}
            variant="subtle"
            color="red"
            fullWidth
            onClick={onReport}
          >
            Report
          </Button>
        </>
      )}

      {userRole === 'owner' && (
        <>
          <Button
            leftSection={<IconEdit size={16} />}
            variant="light"
            color="blue"
            fullWidth
            onClick={onEdit}
          >
            Edit Group
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            color="green"
            fullWidth
            onClick={onCreateEvent}
          >
            Create Event
          </Button>
          <Button
            leftSection={<IconUsers size={16} />}
            variant="light"
            color="orange"
            fullWidth
            onClick={onManageMembers}
          >
            Manage Members
          </Button>
          <Button
            leftSection={<IconCheck size={16} />}
            variant="light"
            color="teal"
            fullWidth
            onClick={onApprove}
          >
            Manage Applications
          </Button>
          <Divider />
          <Button
            leftSection={<IconLogout size={16} />}
            variant="outline"
            color="red"
            fullWidth
            onClick={onLeave}
          >
            Leave Group
          </Button>
          <Button
            leftSection={<IconFlag size={16} />}
            variant="subtle"
            color="red"
            fullWidth
            onClick={onReport}
          >
            Report
          </Button>
        </>
      )}

      {userRole === 'moderator' && (
        <>
          <Button
            leftSection={<IconEdit size={16} />}
            variant="light"
            color="blue"
            fullWidth
            onClick={onEdit}
          >
            Edit Group
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            color="green"
            fullWidth
            onClick={onCreateEvent}
          >
            Create Event
          </Button>
          <Button
            leftSection={<IconUsers size={16} />}
            variant="light"
            color="orange"
            fullWidth
            onClick={onManageMembers}
          >
            Manage Members
          </Button>
          <Button
            leftSection={<IconCheck size={16} />}
            variant="light"
            color="teal"
            fullWidth
            onClick={onApprove}
          >
            Manage Applications
          </Button>
          <Button
            leftSection={<IconFlag size={16} />}
            variant="subtle"
            color="red"
            fullWidth
            onClick={onReport}
          >
            Report Group
          </Button>
          <Divider />
          <Button
            leftSection={<IconLogout size={16} />}
            variant="outline"
            color="red"
            fullWidth
            onClick={onLeave}
          >
            Leave Group
          </Button>
        </>
      )}
    </Stack>
  );
}