'use client'
// components/layout/Header.tsx
import { Group, Button, Title, Box } from '@mantine/core'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import NotificationBell from '../NotificationBell'

export default function Header() {
  const { data: session } = useSession()

  return (
    <Box component="header" py="md" px="lg" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      <Group justify="space-between">
        <Group>
          <Title order={3} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Latvian Community
            </Link>
          </Title>
        </Group>

        <Group>
          {session?.user ? (
            <>
              <Button variant="subtle" component={Link} href="/activities">
                Activities
              </Button>
              <Button variant="subtle" component={Link} href="/activities/create">
                Create Activity
              </Button>
              <Button variant="subtle" component={Link} href="/profile">
                Profile
              </Button>
              <NotificationBell />
              <Button variant="light" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="subtle" component={Link} href="/auth/signin">
                Sign In
              </Button>
              <Button component={Link} href="/auth/signup">
                Sign Up
              </Button>
            </>
          )}
        </Group>
      </Group>
    </Box>
  )
}