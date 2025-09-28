'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Badge,
  Center,
  Loader,
  ActionIcon,
  Flex,
  Divider,
  Avatar,
  Modal,
  Textarea
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Header from '@/components/layout/Header';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string;
  maxMembers: number | null;
  createdAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  applications: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      name: string | null;
    };
  }>;
}

const ACTIVITY_TYPES: { [key: string]: { label: string; color: string; icon: string } } = {
  'choir': { label: 'Choir', color: 'violet', icon: '🎵' },
  'folk-dance': { label: 'Folk Dancing', color: 'green', icon: '💃' },
  'workout': { label: 'Workout', color: 'orange', icon: '💪' },
  'language': { label: 'Language', color: 'blue', icon: '💬' },
  'cultural': { label: 'Cultural', color: 'indigo', icon: '🎭' },
  'other': { label: 'Other', color: 'gray', icon: '📋' },
};

export default function ActivityDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

  const activityId = params.id as string;

  useEffect(() => {
    if (activityId) {
      fetchActivity();
    }
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      if (response.ok) {
        const data = await response.json();
        setActivity(data.activity);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Activity not found',
          color: 'red',
        });
        router.push('/activities');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load activity',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`/api/activities/${activityId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: applicationMessage,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Application Sent!',
          message: 'Your request to join has been sent to the organizer',
          color: 'green',
        });
        close();
        fetchActivity(); // Refresh activity data
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to send application',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred. Please try again.',
        color: 'red',
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
        <Header />
        <Center style={{ minHeight: '50vh' }}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading activity...</Text>
          </Stack>
        </Center>
      </div>
    );
  }

  if (!activity) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
        <Header />
        <Container size="md" py="xl">
          <Card shadow="lg" radius="lg" p="xl">
            <Center>
              <Stack align="center">
                <Text size="4rem">😕</Text>
                <Title order={2}>Activity Not Found</Title>
                <Link href="/activities" style={{ textDecoration: 'none' }}>
                  <Button>Back to Activities</Button>
                </Link>
              </Stack>
            </Center>
          </Card>
        </Container>
      </div>
    );
  }

  const typeConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.other;
  const acceptedMembers = activity.applications.filter(app => app.status === 'accepted');
  const userApplication = session ? activity.applications.find(app => app.user.id === session.user?.id) : null;
  const isOrganizer = session?.user?.id === activity.creator.id;
  const isFull = activity.maxMembers ? acceptedMembers.length >= activity.maxMembers : false;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      <Header />

      <Container size="md" py="xl">
        <Flex align="center" gap="md" mb="xl">
          <ActionIcon 
            component={Link}
            href="/activities" 
            variant="subtle" 
            size="lg"
            color="blue"
          >
            ←
          </ActionIcon>
          <Text c="dimmed">Back to Activities</Text>
        </Flex>

        <Card shadow="lg" radius="lg" p="xl">
          <Stack gap="lg">
            {/* Header */}
            <div>
              <Flex justify="space-between" align="flex-start" mb="md">
                <Badge 
                  color={typeConfig.color} 
                  leftSection={typeConfig.icon}
                  size="lg"
                  variant="light"
                >
                  {typeConfig.label}
                </Badge>
                <Text size="sm" c="dimmed">
                  {acceptedMembers.length} {activity.maxMembers ? `/ ${activity.maxMembers}` : ''} members
                </Text>
              </Flex>
              
              <Title order={1} mb="md">{activity.title}</Title>
              
              <Group gap="lg" mb="md">
                <Group gap="xs">
                  <Text size="sm">📍</Text>
                  <Text size="sm" fw={500}>{activity.location}</Text>
                </Group>
                
                <Group gap="xs">
                  <Text size="sm">📅</Text>
                  <Text size="sm" c="dimmed">
                    Created {new Date(activity.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Group>
            </div>

            <Divider />

            {/* Description */}
            {activity.description && (
              <div>
                <Title order={3} mb="md">About This Activity</Title>
                <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {activity.description}
                </Text>
              </div>
            )}

            <Divider />

            {/* Organizer */}
            <div>
              <Title order={3} mb="md">Organizer</Title>
              <Group>
                <Avatar size="md" />
                <div>
                  <Text fw={500}>{activity.creator.name || 'Anonymous'}</Text>
                  <Text size="sm" c="dimmed">Activity Organizer</Text>
                </div>
              </Group>
            </div>

            {/* Members */}
            {acceptedMembers.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title order={3} mb="md">Current Members</Title>
                  <Stack gap="sm">
                    {acceptedMembers.map((application) => (
                      <Group key={application.id}>
                        <Avatar size="sm" />
                        <Text size="sm">{application.user.name || 'Anonymous'}</Text>
                      </Group>
                    ))}
                  </Stack>
                </div>
              </>
            )}

            <Divider />

            {/* Action Buttons */}
            <div>
              {!session ? (
                <Button 
                  size="lg" 
                  fullWidth
                  component={Link}
                  href="/auth/signin"
                >
                  Sign In to Join
                </Button>
              ) : isOrganizer ? (
                <Stack gap="sm">
                  <Button 
                    size="lg" 
                    fullWidth
                    variant="outline"
                    component={Link}
                    href={`/activities/${activity.id}/manage`}
                  >
                    Manage Applications
                  </Button>
                  <Button 
                    size="lg" 
                    fullWidth
                    variant="outline"
                    component={Link}
                    href={`/activities/${activity.id}/messages`}
                    leftSection="💬"
                  >
                    Group Messages
                  </Button>
                </Stack>
              ) : userApplication?.status === 'accepted' ? (
                <Stack gap="sm">
                  <Button 
                    size="lg" 
                    fullWidth
                    variant="outline"
                    color="green"
                    disabled
                  >
                    ✓ You're a member!
                  </Button>
                  <Button 
                    size="lg" 
                    fullWidth
                    component={Link}
                    href={`/activities/${activity.id}/messages`}
                    leftSection="💬"
                  >
                    Group Messages
                  </Button>
                </Stack>
              ) : userApplication ? (
                <Button 
                  size="lg" 
                  fullWidth
                  variant="outline"
                  color={userApplication.status === 'declined' ? 'red' : 'yellow'}
                  disabled
                >
                  {userApplication.status === 'declined' ? 'Application declined' : 'Application pending...'}
                </Button>
              ) : isFull ? (
                <Button size="lg" fullWidth disabled>
                  Activity Full
                </Button>
              ) : (
                <Button size="lg" fullWidth onClick={open}>
                  Request to Join
                </Button>
              )}
            </div>
          </Stack>
        </Card>
      </Container>

      {/* Join Application Modal */}
      <Modal opened={opened} onClose={close} title="Request to Join Activity" centered>
        <Stack>
          <Text size="sm" c="dimmed">
            Send a message to the organizer explaining why you'd like to join this activity.
          </Text>
          
          <Textarea
            placeholder="Hi! I'm interested in joining your activity because..."
            minRows={4}
            value={applicationMessage}
            onChange={(event) => setApplicationMessage(event.currentTarget.value)}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button loading={applying} onClick={handleJoinRequest}>
              Send Request
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}