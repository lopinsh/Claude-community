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
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Header from '@/components/layout/Header';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  location: string | null;
  bio: string | null;
  activities: Array<{
    id: string;
    title: string;
    type: string;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
        <Header />
        <Center style={{ minHeight: '50vh' }}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading profile...</Text>
          </Stack>
        </Center>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
        <Header />
        <Container size="md" py="xl">
          <Card shadow="lg" radius="lg" p="xl">
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
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      <Header />

      <Container size="lg" py="xl">
        <Grid>
          {/* Profile Info Card */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="lg" radius="lg" p="xl" h="fit-content">
              <Stack align="center" gap="lg">
                <Avatar size={120} />
                
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
                <Card shadow="lg" radius="lg" p="xl">
                  <Title order={3} mb="lg">Edit Profile</Title>
                  
                  <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack gap="md">
                      <TextInput
                        label="Full Name"
                        placeholder="Your full name"
                        {...form.getInputProps('name')}
                      />
                      
                      <Select
                        label="Location"
                        placeholder="Select your city"
                        data={LATVIAN_CITIES}
                        {...form.getInputProps('location')}
                        searchable
                      />
                      
                      <Textarea
                        label="Bio"
                        placeholder="Tell us about yourself..."
                        minRows={3}
                        maxRows={6}
                        {...form.getInputProps('bio')}
                      />
                      
                      <Group justify="flex-end" mt="lg">
                        <Button
                          variant="outline"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          loading={saving}
                        >
                          Save Changes
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Card>
              )}

              {/* My Activities */}
              <Card shadow="lg" radius="lg" p="xl">
                <Title order={3} mb="lg">My Activities</Title>
                
                {profile.activities.length === 0 ? (
                  <Center py="xl">
                    <Stack align="center">
                      <Text size="3rem">🎭</Text>
                      <Text c="dimmed">You haven't joined any activities yet</Text>
                      <Button component="a" href="/activities" mt="md">
                        Browse Activities
                      </Button>
                    </Stack>
                  </Center>
                ) : (
                  <Stack gap="md">
                    {profile.activities.map((activity) => {
                      const typeConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.other;
                      return (
                        <Card key={activity.id} padding="md" radius="md" withBorder>
                          <Group justify="space-between">
                            <Group>
                              <Badge 
                                color={typeConfig.color} 
                                leftSection={typeConfig.icon}
                                variant="light"
                              >
                                {typeConfig.label}
                              </Badge>
                              <Text fw={500}>{activity.title}</Text>
                            </Group>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              component="a"
                              href={`/activities/${activity.id}`}
                            >
                              View
                            </Button>
                          </Group>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
}