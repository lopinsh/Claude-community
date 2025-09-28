// components/layout/Header.tsx
import { Group, Button, Title, Box } from '@mantine/core'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import NotificationBell from '../NotificationBell'

export default function Header() {
  const { data: session, status } = useSession()

  // Use the session status to control what is displayed
  const isLoading = status === 'loading'
  
  return (
    <Group justify="space-between" h={60} px="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Title order={2} size="h3">
          Lopinsh
        </Title>
      </Link>
      
      <Group>
        {/* Navigation Links */}
        <Button component={Link} href="/activities" variant="subtle" size="md">
          Activities
        </Button>
        {session && (
          <Button component={Link} href="/profile" variant="subtle" size="md">
            Profile
          </Button>
        )}

        {/* Auth Buttons and Bell */}
        {!isLoading && session ? (
          <>
            <Button component={Link} href="/activities/create" variant="filled" size="md">
              + Create
            </Button>
            <NotificationBell />
            <Button onClick={() => signOut()} variant="outline" size="md">
              Sign Out
            </Button>
          </>
        ) : (
          !isLoading && (
            <>
              <Button component={Link} href="/auth/signup" variant="outline" size="md">
                Sign Up
              </Button>
              <Button component={Link} href="/auth/signin" variant="filled" size="md">
                Sign In
              </Button>
            </>
          )
        )}
      </Group>
    </Group>
  )
}