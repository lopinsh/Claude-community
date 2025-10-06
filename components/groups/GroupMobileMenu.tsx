import { useState } from 'react';
import { ActionIcon, Menu, Button, Divider, useMantineTheme } from '@mantine/core';
import { IconDots, IconEdit, IconPlus, IconUsers, IconFlag, IconLogout, IconUserPlus, IconCheck } from '@tabler/icons-react';
import { Group } from '@/app/groups/[id]/page';

interface GroupMobileMenuProps {
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

export default function GroupMobileMenu({
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
}: GroupMobileMenuProps) {
  const theme = useMantineTheme();
  
  return (
    <Menu shadow="md" width={220}>
      <Menu.Target>
        <ActionIcon variant="light" size="lg" radius="xl">
          <IconDots size={18} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {userRole === 'visitor' && (
          <>
            {group.groupType === 'PRIVATE' ? (
              <Menu.Item leftSection={<IconUserPlus size={14} />} onClick={onApply}>
                Request to Join
              </Menu.Item>
            ) : (
              <Menu.Item leftSection={<IconUserPlus size={14} />} onClick={onJoin}>
                Join Group
              </Menu.Item>
            )}
            <Menu.Item 
              leftSection={<IconFlag size={14} />} 
              color="red"
              onClick={onReport}
            >
              Report
            </Menu.Item>
          </>
        )}

        {userRole === 'member' && (
          <>
            <Menu.Item 
              leftSection={<IconLogout size={14} />} 
              color="red"
              onClick={onLeave}
            >
              Leave Group
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconFlag size={14} />} 
              color="red"
              onClick={onReport}
            >
              Report
            </Menu.Item>
          </>
        )}

        {userRole === 'owner' && (
          <>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
              Edit Group
            </Menu.Item>
            <Menu.Item leftSection={<IconPlus size={14} />} onClick={onCreateEvent}>
              Create Event
            </Menu.Item>
            <Menu.Item leftSection={<IconUsers size={14} />} onClick={onManageMembers}>
              Manage Members
            </Menu.Item>
            <Menu.Item leftSection={<IconCheck size={14} />} onClick={onApprove}>
              Manage Applications
            </Menu.Item>
            <Divider my="xs" />
            <Menu.Item 
              leftSection={<IconLogout size={14} />} 
              color="red"
              onClick={onLeave}
            >
              Leave Group
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconFlag size={14} />} 
              color="red"
              onClick={onReport}
            >
              Report
            </Menu.Item>
          </>
        )}

        {userRole === 'moderator' && (
          <>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
              Edit Group
            </Menu.Item>
            <Menu.Item leftSection={<IconPlus size={14} />} onClick={onCreateEvent}>
              Create Event
            </Menu.Item>
            <Menu.Item leftSection={<IconUsers size={14} />} onClick={onManageMembers}>
              Manage Members
            </Menu.Item>
            <Menu.Item leftSection={<IconCheck size={14} />} onClick={onApprove}>
              Manage Applications
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconFlag size={14} />} 
              color="red"
              onClick={onReport}
            >
              Report Group
            </Menu.Item>
            <Divider my="xs" />
            <Menu.Item 
              leftSection={<IconLogout size={14} />} 
              color="red"
              onClick={onLeave}
            >
              Leave Group
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}