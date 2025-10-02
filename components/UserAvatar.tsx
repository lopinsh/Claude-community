import { Avatar, Menu, Button, Group, Text, Divider } from '@mantine/core';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface UserAvatarProps {
  size?: number;
}

export default function UserAvatar({ size = 32 }: UserAvatarProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <Menu position="bottom-end" width={200}>
      <Menu.Target>
        <Button variant="subtle" p={0} style={{ borderRadius: '50%' }}>
          <Avatar
            size={size}
            radius="xl"
            color="blue"
          >
            {getInitials(session.user.name)}
          </Avatar>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Group gap="xs">
            <Avatar size={24} radius="xl" color="blue">
              {getInitials(session.user.name)}
            </Avatar>
            <div>
              <Text size="sm" fw={500}>{session.user.name}</Text>
              <Text size="xs" c="dimmed">{session.user.email}</Text>
            </div>
          </Group>
        </Menu.Label>

        <Divider />

        <Menu.Item
          leftSection={<IconUser size={16} />}
          component={Link}
          href="/profile"
        >
          Profile
        </Menu.Item>

        <Divider />

        <Menu.Item
          leftSection={<IconLogout size={16} />}
          onClick={() => signOut()}
          color="red"
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}