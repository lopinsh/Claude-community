import { Group, Button, Title, Menu, Burger, Box } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { IconMenu2 } from '@tabler/icons-react';
import Link from 'next/link';
import NotificationBell from '../NotificationBell';
import UserAvatar from '../UserAvatar';

export default function Header() {
  const { data: session, status } = useSession();
  const [menuOpened, setMenuOpened] = useState(false);

  const isLoading = status === 'loading';

  return (
    <Group justify="space-between" h={60} px="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
      {/* Left: Logo */}
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Title order={2} size="h3" c="blue">
          Lopinsh
        </Title>
      </Link>

      {/* Center: Navigation */}
      <Group gap="md">
        {/* Calendar moved to main page */}
      </Group>

      {/* Right: User Actions */}
      <Group gap="md">
        {!isLoading && session ? (
          <>
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Avatar with Menu */}
            <UserAvatar />
          </>
        ) : (
          !isLoading && (
            <>
              <Button component={Link} href="/auth/signin" variant="subtle" size="sm">
                Log in
              </Button>
              <Button component={Link} href="/auth/signup" variant="filled" size="sm">
                Sign up
              </Button>
            </>
          )
        )}

        {/* Burger Menu for Mobile */}
        <Menu opened={menuOpened} onChange={setMenuOpened} position="bottom-end" width={200}>
          <Menu.Target>
            <Button variant="subtle" size="sm" p={4}>
              <IconMenu2 size={18} />
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {session ? (
              <>
                <Menu.Item component={Link} href="/profile">
                  Profile
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item component={Link} href="/auth/signin">
                  Sign In
                </Menu.Item>
                <Menu.Item component={Link} href="/auth/signup">
                  Sign Up
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}