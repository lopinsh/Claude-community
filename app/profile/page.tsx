'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  Center,
  Loader,
  Avatar,
  Badge,
  Grid,
  Divider,
  ActionIcon
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import MainLayout from '@/components/layout/MainLayout';
import ProfileSidebar from '@/components/sidebars/ProfileSidebar';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  location: string | null;
  bio: string | null;
  activities: Array<{
    id: string;
    title: string;
  }>;
}

const LATVIAN_CITIES = [
  { value: 'riga', label: 'Riga' },
  { value: 'daugavpils', label: 'Daugavpils' },
  { value: 'liepaja', label: 'Liepāja' },
  { value: 'jelgava', label: 'Jelgava' },
  { value: 'jurmala', label: 'Jūrmala' },
  { value: 'ventspils', label: 'Ventspils' },
  { value: 'rezekne', label: 'Rēzekne' },
  { value: 'valmiera', label: 'Valmiera' },
  { value: 'jekabpils', label: 'Jēkabpils' },
  { value: 'ogre', label: 'Ogre' },
  { value: 'other', label: 'Other' },
];

const ACTIVITY_TYPES: { [key: string]: { label: string; color: string; icon: string } } = {
  'choir': { label: 'Choir', color: 'violet', icon: '🎵' },
  'folk-dance': { label: 'Folk Dancing', color: 'green', icon: '💃' },
  'workout': { label: 'Workout', color: 'orange', icon: '💪' },
  'language': { label: 'Language', color: 'blue', icon: '💬' },
  'cultural': { label: 'Cultural', color: 'indigo', icon: '🎭' },
  'other': { label: 'Other', color: 'gray', icon: '📋' },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      location: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (session) {
      fetchProfile();
    }
  }, [session, status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        form.setValues({
          name: data.profile.name || '',
          location: data.profile.location || '',
          bio: data.profile.bio || '',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load profile',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: typeof form.values) => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditing(false);
        notifications.show({
          title: 'Success!',
          message: 'Profile updated successfully',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to update profile',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <MainLayout>
        <div style={{ display: 'flex' }}>
          {!isMobile && (
            <ProfileSidebar
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          )}
          <Center style={{ flex: 1, minHeight: '50vh' }}>
            <Stack align="center">
              <Loader size="lg" />
              <Text c="dimmed">Loading profile...</Text>
            </Stack>
          </Center>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div style={{ display: 'flex' }}>
          {!isMobile && (
            <ProfileSidebar
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          )}
          <Container size="md" py="xl" style={{ flex: 1 }}>
            <Card
              shadow={isMobile ? 'none' : 'lg'}
              radius={isMobile ? 0 : 'lg'}
              p="xl"
              withBorder={!isMobile}
            >
              <Center>
                <Stack align="center">
                  <Text size="4rem">😕</Text>
                  <Title order={2}>Profile Not Found</Title>
                  <Text c="dimmed">Unable to load your profile</Text>
                </Stack>
              </Center>
            </Card>
          </Container>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ display: 'flex' }}>
        {!isMobile && (
          <ProfileSidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        <Container size="lg" py={isMobile ? 'md' : 'xl'} style={{ flex: 1 }}>
        <Grid>
          {/* Profile Info Card */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              shadow={isMobile ? 'none' : 'lg'}
              radius={isMobile ? 0 : 'lg'}
              p={isMobile ? 'lg' : 'xl'}
              h="fit-content"
              withBorder={!isMobile}
            >
              <Stack align="center" gap="lg">
                <Avatar size={isMobile ? 100 : 120} />

                <div style={{ textAlign: 'center' }}>
                  <Title order={2}>{profile.name || 'Anonymous'}</Title>
                  <Text c="dimmed" size="sm">{profile.email}</Text>

                  {profile.location && (
                    <Group justify="center" mt="sm">
                      <Text size="sm">📍</Text>
                      <Text size="sm" fw={500}>
                        {LATVIAN_CITIES.find(city => city.value === profile.location)?.label || profile.location}
                      </Text>
                    </Group>
                  )}
                </div>

                {profile.bio && (
                  <Text size="sm" ta="center" style={{ fontStyle: 'italic' }}>
                    "{profile.bio}"
                  </Text>
                )}

                <Button
                  fullWidth
                  variant={editing ? "outline" : "filled"}
                  onClick={() => setEditing(!editing)}
                  size={isMobile ? 'md' : 'sm'}
                  style={{ minHeight: isMobile ? '48px' : undefined }}
                >
                  {editing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Main Content */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Edit Profile Form */}
              {editing && (
                <Card
                  shadow={isMobile ? 'none' : 'lg'}
                  radius={isMobile ? 0 : 'lg'}
                  p={isMobile ? 'lg' : 'xl'}
                  withBorder={!isMobile}
                >
                  <Title order={3} mb="lg">Edit Profile</Title>

                  <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack gap="md">
                      <TextInput
                        label="Full Name"
                        placeholder="Your full name"
                        size={isMobile ? 'md' : 'sm'}
                        {...form.getInputProps('name')}
                      />

                      <Select
                        label="Location"
                        placeholder="Select your city"
                        data={LATVIAN_CITIES}
                        size={isMobile ? 'md' : 'sm'}
                        {...form.getInputProps('location')}
                        searchable
                      />

                      <Textarea
                        label="Bio"
                        placeholder="Tell us about yourself..."
                        minRows={3}
                        maxRows={6}
                        size={isMobile ? 'md' : 'sm'}
                        {...form.getInputProps('bio')}
                      />

                      <Group justify={isMobile ? 'stretch' : 'flex-end'} mt="lg">
                        <Button
                          variant="outline"
                          onClick={() => setEditing(false)}
                          size={isMobile ? 'md' : 'sm'}
                          style={{ minHeight: isMobile ? '48px' : undefined, flex: isMobile ? 1 : undefined }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          loading={saving}
                          size={isMobile ? 'md' : 'sm'}
                          style={{ minHeight: isMobile ? '48px' : undefined, flex: isMobile ? 1 : undefined }}
                        >
                          Save Changes
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Card>
              )}

              {/* My Activities */}
              <Card
                shadow={isMobile ? 'none' : 'lg'}
                radius={isMobile ? 0 : 'lg'}
                p={isMobile ? 'lg' : 'xl'}
                withBorder={!isMobile}
              >
                <Title order={3} mb="lg">My Activities</Title>

                {profile.activities.length === 0 ? (
                  <Center py="xl">
                    <Stack align="center">
                      <Text size="3rem">🎭</Text>
                      <Text c="dimmed">You haven't joined any activities yet</Text>
                      <Button
                        component="a"
                        href="/activities"
                        mt="md"
                        size={isMobile ? 'md' : 'sm'}
                        style={{ minHeight: isMobile ? '48px' : undefined }}
                      >
                        Browse Activities
                      </Button>
                    </Stack>
                  </Center>
                ) : (
                  <Stack gap="md">
                    {profile.activities.map((activity) => (
                      <Card key={activity.id} padding="md" radius="md" withBorder>
                        <Group justify="space-between" wrap={isMobile ? 'wrap' : 'nowrap'}>
                          <Group>
                            <Badge
                              color="blue"
                              leftSection="🎭"
                              variant="light"
                            >
                              Activity
                            </Badge>
                            <Text fw={500}>{activity.title}</Text>
                          </Group>

                          <Button
                            size={isMobile ? 'sm' : 'sm'}
                            variant="outline"
                            component="a"
                            href={`/activities/${activity.id}`}
                            style={{ minHeight: isMobile ? '44px' : undefined }}
                          >
                            View
                          </Button>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
        </Container>
      </div>
    </MainLayout>
  );
}