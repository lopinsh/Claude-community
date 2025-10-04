import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import {
  Breadcrumbs,
  Anchor,
  Burger,
  Box,
  Group,
  ActionIcon,
  Button,
  Text,
  Menu,
  useMantineTheme,
  useMantineColorScheme
} from '@mantine/core'
import { IconChevronRight, IconSearch, IconSun, IconMoon, IconShield, IconDashboard, IconTags, IconSparkles, IconFileText } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'
import { useBreadcrumbStore } from '@/hooks/useBreadcrumbs'
import NotificationBell from '../NotificationBell'
import UserAvatar from '../UserAvatar'
import { SearchOverlay } from '../mobile'
import { getDesktopNavItems } from '@/utils/navigation'
import { canAccessAdminDashboard } from '@/lib/authorization'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface HeaderProps {
  onBurgerClick?: () => void;
}

const NAV_LINKS = getDesktopNavItems()

export default function Header({ onBurgerClick }: HeaderProps = {}) {
  const theme = useMantineTheme()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { customBreadcrumbs } = useBreadcrumbStore()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [searchOpened, setSearchOpened] = useState(false)

  const isLoading = status === 'loading'

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (customBreadcrumbs) {
      return customBreadcrumbs
    }

    if (!pathname || pathname === '/') {
      return [{ title: 'Groups', href: '/' }]
    }

    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Groups', href: '/' }]

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      if (segment === 'groups') {
        breadcrumbs.push({ title: 'Groups', href: '/groups' })
      } else if (segment === 'create') {
        breadcrumbs.push({ title: 'Create' })
      } else if (segment === 'profile') {
        breadcrumbs.push({ title: 'Profile' })
      } else if (segment === 'activities') {
        breadcrumbs.push({ title: 'Activities', href: currentPath })
      } else if (segments[index - 1] === 'groups' && segment !== 'create') {
        breadcrumbs.push({ title: 'Group Details' })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Hide breadcrumbs on Discover/dashboard page
  const showBreadcrumbs = pathname !== '/' && breadcrumbs.length > 0

  return (
    <>
      {/* Header Container */}
      <Box pos="sticky" top={0} style={{ zIndex: 50 }}>
        {/* Main Header */}
        <Box
          h={64}
          px="xl"
          bg={colorScheme === 'dark' ? 'dark.7' : 'white'}
          style={{
            borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
          }}
        >
          <Group h="100%" justify="space-between">
            {/* Left: Logo + Mobile Burger + Nav Links */}
            <Group gap="lg">
              {isMobile && onBurgerClick && <Burger opened={false} onClick={onBurgerClick} size="sm" />}

              {/* Logo */}
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Text
                  size="xl"
                  fw={800}
                  style={{
                    background: theme.other.brandGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Ejam Kopā!
                </Text>
              </Link>

              {/* Desktop Navigation Links */}
              {!isMobile && (
                <Group gap="xs">
                  {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Button
                        key={link.href}
                        component={Link}
                        href={link.href}
                        variant={isActive ? 'light' : 'subtle'}
                        color={isActive ? 'categoryBlue' : 'gray'}
                        size="sm"
                      >
                        {link.label}
                      </Button>
                    )
                  })}
                </Group>
              )}
            </Group>

            {/* Right: Search + Theme Toggle + Admin + Notifications + User */}
            <Group gap="sm">
              {/* Search Icon - Opens SearchOverlay (Desktop only) */}
              {!isMobile && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={() => setSearchOpened(true)}
                >
                  <IconSearch size={20} />
                </ActionIcon>
              )}

              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={toggleColorScheme}
              >
                {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>

              {!isLoading && session ? (
                <>
                  {/* Admin Menu */}
                  {canAccessAdminDashboard(session) && (
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon
                          variant="light"
                          color="categoryRed"
                          size="lg"
                        >
                          <IconShield size={20} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Label>Administration</Menu.Label>
                        <Menu.Item
                          component={Link}
                          href="/admin"
                          leftSection={<IconDashboard size={16} />}
                        >
                          Dashboard
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          component={Link}
                          href="/admin/tag-suggestions"
                          leftSection={<IconTags size={16} />}
                        >
                          Tag Suggestions
                        </Menu.Item>
                        <Menu.Item
                          component={Link}
                          href="/admin/stories"
                          leftSection={<IconSparkles size={16} />}
                        >
                          Stories
                        </Menu.Item>
                        <Menu.Item
                          component={Link}
                          href="/admin/pages"
                          leftSection={<IconFileText size={16} />}
                        >
                          Pages
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}

                  <NotificationBell />
                  <UserAvatar />
                </>
              ) : (
                !isLoading && !isMobile && (
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      color="gray"
                      size="sm"
                      component="a"
                      href="/auth/signin"
                    >
                      Log in
                    </Button>
                    <Button
                      variant="gradient"
                      gradient={{ from: 'categoryBlue', to: 'categoryTeal', deg: 135 }}
                      size="sm"
                      component="a"
                      href="/auth/signup"
                    >
                      Sign up
                    </Button>
                  </Group>
                )
              )}
            </Group>
          </Group>
        </Box>

        {/* Breadcrumb Sub-header */}
        {showBreadcrumbs && (
          <Box
            px="xl"
            py="xs"
            bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}
            style={{
              borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
            }}
          >
            <Breadcrumbs separator={<IconChevronRight size={14} />}>
              {breadcrumbs.map((crumb, index) => {
                return crumb.href ? (
                  <Anchor
                    key={index}
                    component={Link}
                    href={crumb.href}
                    size="sm"
                    c="categoryBlue"
                  >
                    {crumb.title}
                  </Anchor>
                ) : (
                  <Text key={index} size="sm" fw={600}>
                    {crumb.title}
                  </Text>
                )
              })}
            </Breadcrumbs>
          </Box>
        )}
      </Box>

      {/* Search Overlay */}
      <SearchOverlay opened={searchOpened} onClose={() => setSearchOpened(false)} />
    </>
  )
}