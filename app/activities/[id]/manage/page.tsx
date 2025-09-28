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
  Tabs,
  Modal
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Header from '@/components/layout/Header'

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
    message: string | null;
    createdAt: string;
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

export default function ActivityManagePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingApplications, setProcessingApplications] = useState<Set<string>>(new Set());
  const [removeModalOpened, { open: openRemoveModal, close: closeRemoveModal }] = useDisclosure(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

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
        
        // Check if current user is the organizer
        if (session?.user?.id !== data.activity.creator.id) {
          router.push(`/activities/${activityId}`);
          return;
        }
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

  const handleApplicationAction = async (applicationId: string, action: 'accepted' | 'declined') => {
    setProcessingApplications(prev => new Set(Array.from(prev).concat(applicationId)));

    try {
      const response = await fetch(`/api/activities/${activityId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: `Application ${action}`,
          color: action === 'accepted' ? 'green' : 'orange',
        });
        fetchActivity(); // Refresh data
      } else {
        const result = await response.json();
        notifications.show({
          title: 'Error',
          message: result.error || `Failed to ${action} application`,
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
      setProcessingApplications(prev => {
        const next = new Set(Array.from(prev));
        next.delete(applicationId);
        return next;
      });
    }
  };

  const handleRemoveMember = async (applicationId: string, memberName: string) => {
    setMemberToRemove({ id: applicationId, name: memberName });
    openRemoveModal();
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    setProcessingApplications(prev => new Set(Array.from(prev).concat(memberToRemove.id)));
    closeRemoveModal();

    try {
      const response = await fetch(`/api/activities/${activityId}/applications/${memberToRemove.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'removed' }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: `${memberToRemove.name} has been removed from the activity`,
          color: 'orange',
        });
        fetchActivity(); // Refresh data
      } else {
        const result = await response.json();
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to remove member',
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
      setProcessingApplications(prev => {
        const next = new Set(Array.from(prev));
        next.delete(memberToRemove.id);
        return next;
      });
      setMemberToRemove(null);
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
  const pendingApplications = activity.applications.filter(app => app.status === 'pending');
  const acceptedApplications = activity.applications.filter(app => app.status === 'accepted');
  const declinedApplications = activity.applications.filter(app => app.status === 'declined');
  const removedApplications = activity.applications.filter(app => app.status === 'removed');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      <Header />

      <Container size="lg" py="xl">
        <Flex align="center" gap="md" mb="xl">
          <ActionIcon 
            component={Link}
            href={`/activities/${activityId}`} 
            variant="subtle" 
            size="lg"
            color="blue"
          >
            ←
          </ActionIcon>
          <Text c="dimmed">Back to Activity</Text>
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
              </Flex>
              
              <Title order={1} mb="md">Manage: {activity.title}</Title>
              
              <Group gap="lg">
                <Group gap="xs">
                  <Text size="sm">📍</Text>
                  <Text size="sm" fw={500}>{activity.location}</Text>
                </Group>
                
                <Group gap="xs">
                  <Text size="sm">👥</Text>
                  <Text size="sm" c="dimmed">
                    {acceptedApplications.length} {activity.maxMembers ? `/ ${activity.maxMembers}` : ''} members
                  </Text>
                </Group>
              </Group>
            </div>

            <Divider />

            {/* Applications Tabs */}
            <Tabs defaultValue="pending">
              <Tabs.List>
                <Tabs.Tab value="pending">
                  Pending ({pendingApplications.length})
                </Tabs.Tab>
                <Tabs.Tab value="accepted">
                  Members ({acceptedApplications.length})
                </Tabs.Tab>
                <Tabs.Tab value="declined">
                  Declined ({declinedApplications.length})
                </Tabs.Tab>
                {removedApplications.length > 0 && (
                  <Tabs.Tab value="removed">
                    Removed ({removedApplications.length})
                  </Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="pending" pt="lg">
                {pendingApplications.length === 0 ? (
                  <Center p="xl">
                    <Stack align="center">
                      <Text size="2rem">📥</Text>
                      <Text c="dimmed">No pending applications</Text>
                    </Stack>
                  </Center>
                ) : (
                  <Stack gap="md">
                    {pendingApplications.map((application) => (
                      <Card key={application.id} padding="md" radius="md" withBorder>
                        <Flex justify="space-between" align="flex-start">
                          <Group align="flex-start" style={{ flex: 1 }}>
                            <Avatar size="md" />
                            <div style={{ flex: 1 }}>
                              <Text fw={500}>{application.user.name || 'Anonymous'}</Text>
                              <Text size="sm" c="dimmed" mb="sm">
                                Applied {new Date(application.createdAt).toLocaleDateString()}
                              </Text>
                              {application.message && (
                                <Card padding="sm" radius="sm" bg="gray.0">
                                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                    {application.message}
                                  </Text>
                                </Card>
                              )}
                            </div>
                          </Group>
                          
                          <Group>
                            <Button
                              size="sm"
                              color="green"
                              loading={processingApplications.has(application.id)}
                              onClick={() => handleApplicationAction(application.id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              color="red"
                              loading={processingApplications.has(application.id)}
                              onClick={() => handleApplicationAction(application.id, 'declined')}
                            >
                              Decline
                            </Button>
                          </Group>
                        </Flex>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="accepted" pt="lg">
                {acceptedApplications.length === 0 ? (
                  <Center p="xl">
                    <Stack align="center">
                      <Text size="2rem">👥</Text>
                      <Text c="dimmed">No members yet</Text>
                    </Stack>
                  </Center>
                ) : (
                  <Stack gap="sm">
                    {acceptedApplications.map((application) => (
                      <Card key={application.id} padding="sm" radius="sm" withBorder bg="green.0">
                        <Flex justify="space-between" align="center">
                          <Group>
                            <Avatar size="sm" />
                            <div>
                              <Text size="sm" fw={500}>{application.user.name || 'Anonymous'}</Text>
                              <Text size="xs" c="dimmed">
                                Joined {new Date(application.createdAt).toLocaleDateString()}
                              </Text>
                            </div>
                          </Group>
                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            loading={processingApplications.has(application.id)}
                            onClick={() => handleRemoveMember(application.id, application.user.name || 'Anonymous')}
                          >
                            Remove
                          </Button>
                        </Flex>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="declined" pt="lg">
                {declinedApplications.length === 0 ? (
                  <Center p="xl">
                    <Stack align="center">
                      <Text size="2rem">❌</Text>
                      <Text c="dimmed">No declined applications</Text>
                    </Stack>
                  </Center>
                ) : (
                  <Stack gap="sm">
                    {declinedApplications.map((application) => (
                      <Group key={application.id}>
                        <Avatar size="sm" />
                        <Text size="sm" c="dimmed">{application.user.name || 'Anonymous'}</Text>
                        <Badge size="sm" color="red" variant="light">Declined</Badge>
                      </Group>
                    ))}
                  </Stack>
                )}
              </Tabs.Panel>

              {removedApplications.length > 0 && (
                <Tabs.Panel value="removed" pt="lg">
                  <Stack gap="sm">
                    {removedApplications.map((application) => (
                      <Group key={application.id}>
                        <Avatar size="sm" />
                        <Text size="sm" c="dimmed">{application.user.name || 'Anonymous'}</Text>
                        <Badge size="sm" color="orange" variant="light">Removed</Badge>
                      </Group>
                    ))}
                  </Stack>
                </Tabs.Panel>
              )}
            </Tabs>
          </Stack>
        </Card>
      </Container>

      {/* Remove Member Confirmation Modal */}
      <Modal
        opened={removeModalOpened}
        onClose={closeRemoveModal}
        title="Remove Member"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from this activity?
          </Text>
          <Text size="sm" c="dimmed">
            They will be notified and lose access to the activity chat. This action can't be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeRemoveModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmRemoveMember}>
              Remove Member
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}