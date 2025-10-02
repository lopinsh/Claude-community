import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Stack,
  Paper,
  Box,
  UnstyledButton,
  ThemeIcon,
  Text,
  Group,
  Tooltip,
  Divider
} from '@mantine/core';
import {
  IconHome,
  IconSearch,
  IconUsers,
  IconCalendar,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconUser
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';

interface NavigationSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  label: string;
  icon: any;
  href: string;
  color: string;
  authRequired?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    icon: IconHome,
    href: '/',
    color: '#6366f1'
  },
  {
    label: 'Discover',
    icon: IconSearch,
    href: '/',
    color: '#8b5cf6'
  },
  {
    label: 'My Groups',
    icon: IconUsers,
    href: '/my-groups',
    color: '#06b6d4',
    authRequired: true
  },
  {
    label: 'Profile',
    icon: IconUser,
    href: '/profile',
    color: '#10b981',
    authRequired: true
  }
];

export default function NavigationSidebar({
  isCollapsed = false,
  onToggleCollapse
}: NavigationSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const filteredNavItems = NAV_ITEMS.filter(
    item => !item.authRequired || session
  );

  return (
    <Paper
      p={isCollapsed ? "xs" : "sm"}
      style={{
        width: isCollapsed ? 60 : 320,
        height: 'calc(100vh - 72px)',
        borderRadius: 0,
        borderRight: '1px solid #f1f5f9',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        backgroundColor: '#fafafa',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 72
      }}
    >
      {/* Toggle Button */}
      {onToggleCollapse && (
        <Box style={{ position: 'absolute', top: '12px', right: isCollapsed ? '8px' : '12px', zIndex: 10 }}>
          <UnstyledButton
            onClick={onToggleCollapse}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            {isCollapsed ? (
              <IconChevronRight size={16} color="#64748b" />
            ) : (
              <IconChevronLeft size={16} color="#64748b" />
            )}
          </UnstyledButton>
        </Box>
      )}

      {/* Expanded State */}
      {!isCollapsed && (
        <Stack gap="lg" style={{ paddingTop: '52px', height: '100%', justifyContent: 'space-between' }}>
          <Box>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.075em',
              marginBottom: '16px',
              paddingLeft: '8px'
            }}>
              Navigation
            </div>
            <Stack gap={4}>
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;

                return (
                  <UnstyledButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: isActive
                        ? `${item.color}15`
                        : 'transparent',
                      borderLeft: isActive
                        ? `3px solid ${item.color}`
                        : '3px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Group gap="sm">
                      <ThemeIcon
                        size={32}
                        variant="light"
                        style={{
                          backgroundColor: isActive ? item.color : `${item.color}20`,
                          color: isActive ? '#fff' : item.color
                        }}
                      >
                        <IconComponent size={18} />
                      </ThemeIcon>
                      <Text
                        size="sm"
                        fw={isActive ? 600 : 500}
                        c={isActive ? item.color : '#334155'}
                      >
                        {item.label}
                      </Text>
                    </Group>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </Box>

          {session && (
            <Box>
              <Divider mb="md" />
              <Box>
                <UnstyledButton
                  component={Link}
                  href="/groups/create"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.25)';
                  }}
                >
                  <Group gap="sm" justify="center">
                    <IconPlus size={18} />
                    <Text size="sm" fw={600}>
                      Create Group
                    </Text>
                  </Group>
                </UnstyledButton>
              </Box>
            </Box>
          )}
        </Stack>
      )}

      {/* Collapsed State */}
      {isCollapsed && (
        <Stack gap="xs" align="center" style={{ paddingTop: '52px' }}>
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Tooltip
                key={item.href}
                label={item.label}
                position="right"
                withArrow
              >
                <UnstyledButton
                  component={Link}
                  href={item.href}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: isActive
                      ? `${item.color}15`
                      : 'transparent',
                    borderLeft: isActive
                      ? `3px solid ${item.color}`
                      : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <ThemeIcon
                    size={28}
                    variant="light"
                    style={{
                      backgroundColor: isActive ? item.color : `${item.color}20`,
                      color: isActive ? '#fff' : item.color
                    }}
                  >
                    <IconComponent size={18} />
                  </ThemeIcon>
                </UnstyledButton>
              </Tooltip>
            );
          })}

          {session && (
            <>
              <Divider style={{ width: '80%', margin: '8px 0' }} />
              <Tooltip label="Create Group" position="right" withArrow>
                <UnstyledButton
                  component={Link}
                  href="/groups/create"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.25)';
                  }}
                >
                  <ThemeIcon
                    size={28}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ffffff'
                    }}
                  >
                    <IconPlus size={18} />
                  </ThemeIcon>
                </UnstyledButton>
              </Tooltip>
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
}