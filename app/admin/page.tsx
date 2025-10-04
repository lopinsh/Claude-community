'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Stack,
  Group,
  Badge,
  Button,
  Loader,
  Center,
  Box,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconUsers,
  IconTags,
  IconUsersGroup,
  IconNews,
  IconFileText,
  IconAlertCircle,
  IconCheck,
  IconClock,
} from '@tabler/icons-react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { canAccessAdminDashboard } from '@/lib/authorization';

interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
  pendingGroups: number;
  pendingTagSuggestions: number;
  totalNewsArticles: number;
  publishedNews: number;
  totalPages: number;
  publishedPages: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (!canAccessAdminDashboard(session)) {
        router.push('/');
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <MainLayout>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={1}>Admin Dashboard</Title>
              <Text size="lg" c="dimmed">
                Manage content, users, and platform settings
              </Text>
            </div>
            <Badge size="lg" variant="gradient" gradient={{ from: 'categoryRed', to: 'categoryOrange' }}>
              {session?.user?.role}
            </Badge>
          </Group>

          {/* Quick Stats Grid */}
          {stats && (
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <IconUsers size={24} color={theme.colors.categoryBlue[5]} />
                      <Text size="xl" fw={700}>
                        {stats.totalUsers}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Total Users
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <IconUsersGroup size={24} color={theme.colors.categoryGreen[5]} />
                      <Text size="xl" fw={700}>
                        {stats.totalGroups}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Total Groups
                    </Text>
                    {stats.pendingGroups > 0 && (
                      <Badge size="sm" color="categoryOrange">
                        {stats.pendingGroups} pending
                      </Badge>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <IconNews size={24} color={theme.colors.categoryPeach[5]} />
                      <Text size="xl" fw={700}>
                        {stats.totalNewsArticles}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      News Articles
                    </Text>
                    <Badge size="sm" color="categoryGreen">
                      {stats.publishedNews} published
                    </Badge>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Card padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <IconFileText size={24} color={theme.colors.categoryTeal[5]} />
                      <Text size="xl" fw={700}>
                        {stats.totalPages}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Custom Pages
                    </Text>
                    <Badge size="sm" color="categoryGreen">
                      {stats.publishedPages} published
                    </Badge>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          )}

          {/* Moderation Queue */}
          <Card padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group>
                <IconClock size={24} color={theme.colors.categoryOrange[5]} />
                <Title order={3}>Moderation Queue</Title>
              </Group>

              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Card bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'} padding="md" radius="md">
                    <Group justify="space-between" mb="xs">
                      <Text fw={600}>Tag Suggestions</Text>
                      {stats && stats.pendingTagSuggestions > 0 ? (
                        <Badge color="categoryOrange" variant="filled">
                          {stats.pendingTagSuggestions} pending
                        </Badge>
                      ) : (
                        <Badge color="categoryGreen" variant="light" leftSection={<IconCheck size={14} />}>
                          All clear
                        </Badge>
                      )}
                    </Group>
                    <Button
                      component={Link}
                      href="/admin/tag-suggestions"
                      variant="light"
                      color="categoryBlue"
                      fullWidth
                    >
                      Review Suggestions
                    </Button>
                  </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Card bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'} padding="md" radius="md">
                    <Group justify="space-between" mb="xs">
                      <Text fw={600}>Group Approvals</Text>
                      {stats && stats.pendingGroups > 0 ? (
                        <Badge color="categoryOrange" variant="filled">
                          {stats.pendingGroups} pending
                        </Badge>
                      ) : (
                        <Badge color="categoryGreen" variant="light" leftSection={<IconCheck size={14} />}>
                          All clear
                        </Badge>
                      )}
                    </Group>
                    <Button
                      component={Link}
                      href="/admin/groups"
                      variant="light"
                      color="categoryBlue"
                      fullWidth
                    >
                      Review Groups
                    </Button>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          {/* Quick Actions */}
          <Card padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Quick Actions</Title>

              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Button
                    component={Link}
                    href="/admin/news/create"
                    variant="light"
                    color="categoryPeach"
                    leftSection={<IconNews size={20} />}
                    fullWidth
                    size="md"
                  >
                    Create News Article
                  </Button>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Button
                    component={Link}
                    href="/admin/pages/create"
                    variant="light"
                    color="categoryTeal"
                    leftSection={<IconFileText size={20} />}
                    fullWidth
                    size="md"
                  >
                    Create Page
                  </Button>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Button
                    component={Link}
                    href="/admin/tags/create"
                    variant="light"
                    color="categoryGreen"
                    leftSection={<IconTags size={20} />}
                    fullWidth
                    size="md"
                  >
                    Create Tag
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          {/* Management Links */}
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group>
                    <IconNews size={24} color={theme.colors.categoryPeach[5]} />
                    <Title order={4}>News Management</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Create, edit, and publish community news articles
                  </Text>
                  <Button component={Link} href="/admin/news" variant="outline" color="categoryPeach">
                    Manage News
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group>
                    <IconFileText size={24} color={theme.colors.categoryTeal[5]} />
                    <Title order={4}>Page Management</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Create and manage custom pages for the platform
                  </Text>
                  <Button component={Link} href="/admin/pages" variant="outline" color="categoryTeal">
                    Manage Pages
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group>
                    <IconTags size={24} color={theme.colors.categoryGreen[5]} />
                    <Title order={4}>Tag Management</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Manage taxonomy and approve user suggestions
                  </Text>
                  <Button component={Link} href="/admin/tags" variant="outline" color="categoryGreen">
                    Manage Tags
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Group>
                    <IconUsersGroup size={24} color={theme.colors.categoryBlue[5]} />
                    <Title order={4}>Groups & Events</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Monitor and moderate community groups and events
                  </Text>
                  <Button component={Link} href="/admin/groups" variant="outline" color="categoryBlue">
                    Manage Groups
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </MainLayout>
  );
}
