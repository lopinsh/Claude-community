'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Button,
  ThemeIcon,
  Divider,
  Center,
  Loader,
  Alert,
  Avatar,
  ActionIcon,
  Tooltip,
  Modal
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconEdit,
  IconTrash,
  IconClock,
  IconEye,
  IconLock,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconQuestionMark
} from '@tabler/icons-react';
import MainLayout from '@/components/layout/MainLayout';
import CreateActivityModal from '@/components/activities/CreateActivityModal';

interface EventDetail {
  id: string;
  title: string | null;
  description: string | null;
  startDateTime: string;
  endDateTime: string | null;
  isAllDay: boolean;
  eventType: string;
  visibility: string;
  requiresApproval: boolean;
  maxMembers: number | null;
  location: string | null;
  createdAt: string;
  group: {
    id: string;
    title: string;
    location: string;
    creator: {
      id: string;
      name: string | null;
    };
  };
  attendees: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      name: string | null;
    };
  }>;
  _count: {
    attendees: number;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [userAttendance, setUserAttendance] = useState<string | null>(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      const data = await response.json();
      setEvent(data.event);

      // Check if current user has RSVP'd
      if (session?.user?.id && data.event.attendees) {
        const userRsvp = data.event.attendees.find(
          (attendee: any) => attendee.user.id === session.user.id
        );
        setUserAttendance(userRsvp?.status || null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id, session]);

  const handleRSVP = async (status: string) => {
    if (!session?.user || !event) return;

    setRsvpLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update RSVP');
      }

      setUserAttendance(status);
      fetchEvent(); // Refresh to update counts
    } catch (err) {
      console.error('RSVP error:', err);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      router.push(`/groups/${event.group.id}`);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container size="lg" py="xl">
          <Center>
            <Stack align="center">
              <Loader size="lg" />
              <Text>Loading event...</Text>
            </Stack>
          </Center>
        </Container>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <Container size="lg" py="xl">
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Title order={4}>Event not found</Title>
            <Text>The event you're looking for doesn't exist or you don't have permission to view it.</Text>
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  const isOwner = session?.user?.id === event.group.creator.id;
  const canEdit = isOwner;
  const canRSVP = session?.user && !isOwner;

  const attendeesByStatus = {
    GOING: event.attendees.filter(a => a.status === 'GOING'),
    MAYBE: event.attendees.filter(a => a.status === 'MAYBE'),
    NOT_GOING: event.attendees.filter(a => a.status === 'NOT_GOING'),
  };

  return (
    <MainLayout>
      <Container size="lg" py="xl">
        <Stack gap="lg">
          {/* Event Header */}
          <Paper p="xl" withBorder>
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="sm">
                    <Title order={1} size="h2">
                      {event.title || `${event.group.title} Event`}
                    </Title>
                    <Badge
                      variant="light"
                      color={event.eventType === 'SPECIAL' ? 'orange' : 'blue'}
                    >
                      {event.eventType}
                    </Badge>
                    <Badge
                      variant={event.visibility === 'PUBLIC' ? 'light' : 'filled'}
                      color={event.visibility === 'PUBLIC' ? 'green' : 'blue'}
                      leftSection={event.visibility === 'PUBLIC' ? <IconEye size={12} /> : <IconLock size={12} />}
                    >
                      {event.visibility}
                    </Badge>
                  </Group>

                  {event.description && (
                    <Text c="dimmed">{event.description}</Text>
                  )}
                </Stack>

                {canEdit && (
                  <Group gap="xs">
                    <Tooltip label="Edit event">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => setEditModalOpened(true)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete event">
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => setDeleteModalOpened(true)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                )}
              </Group>

              {/* Event Details */}
              <Group gap="xl">
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="subtle" color="blue">
                    <IconCalendar size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Date & Time</Text>
                    <Text size="sm" c="dimmed">
                      {event.isAllDay
                        ? new Date(event.startDateTime).toLocaleDateString()
                        : `${new Date(event.startDateTime).toLocaleString()}${
                            event.endDateTime
                              ? ` - ${new Date(event.endDateTime).toLocaleString()}`
                              : ''
                          }`
                      }
                    </Text>
                  </div>
                </Group>

                <Group gap="xs">
                  <ThemeIcon size="sm" variant="subtle" color="green">
                    <IconMapPin size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Location</Text>
                    <Text size="sm" c="dimmed">
                      {event.location || event.group.location}
                    </Text>
                  </div>
                </Group>

                <Group gap="xs">
                  <ThemeIcon size="sm" variant="subtle" color="orange">
                    <IconUsers size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Attendance</Text>
                    <Text size="sm" c="dimmed">
                      {attendeesByStatus.GOING.length} attending
                      {event.maxMembers && ` (max ${event.maxMembers})`}
                    </Text>
                  </div>
                </Group>
              </Group>

              <Divider />

              {/* Group Info */}
              <Group justify="space-between">
                <Group gap="sm">
                  <Text size="sm" c="dimmed">
                    Part of group:{' '}
                    <Text
                      component="a"
                      href={`/groups/${event.group.id}`}
                      fw={500}
                      c="blue"
                      style={{ textDecoration: 'none' }}
                    >
                      {event.group.title}
                    </Text>
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Created {new Date(event.createdAt).toLocaleDateString()}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* RSVP Section */}
          {canRSVP && (
            <Paper p="lg" withBorder>
              <Stack gap="md">
                <Title order={4}>Will you attend?</Title>
                <Group gap="sm">
                  <Button
                    variant={userAttendance === 'GOING' ? 'filled' : 'outline'}
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    onClick={() => handleRSVP('GOING')}
                    loading={rsvpLoading}
                  >
                    Going
                  </Button>
                  <Button
                    variant={userAttendance === 'MAYBE' ? 'filled' : 'outline'}
                    color="yellow"
                    leftSection={<IconQuestionMark size={16} />}
                    onClick={() => handleRSVP('MAYBE')}
                    loading={rsvpLoading}
                  >
                    Maybe
                  </Button>
                  <Button
                    variant={userAttendance === 'NOT_GOING' ? 'filled' : 'outline'}
                    color="red"
                    leftSection={<IconX size={16} />}
                    onClick={() => handleRSVP('NOT_GOING')}
                    loading={rsvpLoading}
                  >
                    Can't go
                  </Button>
                </Group>
                {userAttendance && (
                  <Text size="sm" c="dimmed">
                    Your response: <strong>{userAttendance.replace('_', ' ')}</strong>
                  </Text>
                )}
              </Stack>
            </Paper>
          )}

          {/* Attendees List */}
          <Paper p="lg" withBorder>
            <Stack gap="md">
              <Title order={4}>Attendees ({event._count.attendees})</Title>

              {attendeesByStatus.GOING.length > 0 && (
                <div>
                  <Group gap="xs" mb="xs">
                    <IconCheck size={16} color="var(--mantine-color-green-6)" />
                    <Text size="sm" fw={500} c="green">Going ({attendeesByStatus.GOING.length})</Text>
                  </Group>
                  <Group gap="xs">
                    {attendeesByStatus.GOING.map((attendee) => (
                      <Group key={attendee.id} gap="xs">
                        <Avatar size="sm" radius="xl">
                          {attendee.user.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Text size="sm">{attendee.user.name || 'Anonymous'}</Text>
                      </Group>
                    ))}
                  </Group>
                </div>
              )}

              {attendeesByStatus.MAYBE.length > 0 && (
                <div>
                  <Group gap="xs" mb="xs">
                    <IconQuestionMark size={16} color="var(--mantine-color-yellow-6)" />
                    <Text size="sm" fw={500} c="yellow">Maybe ({attendeesByStatus.MAYBE.length})</Text>
                  </Group>
                  <Group gap="xs">
                    {attendeesByStatus.MAYBE.map((attendee) => (
                      <Group key={attendee.id} gap="xs">
                        <Avatar size="sm" radius="xl">
                          {attendee.user.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Text size="sm">{attendee.user.name || 'Anonymous'}</Text>
                      </Group>
                    ))}
                  </Group>
                </div>
              )}

              {event._count.attendees === 0 && (
                <Center py="md">
                  <Text c="dimmed">No RSVPs yet</Text>
                </Center>
              )}
            </Stack>
          </Paper>
        </Stack>

        {/* Edit Activity Modal */}
        {event && (
          <CreateActivityModal
            opened={editModalOpened}
            onClose={() => setEditModalOpened(false)}
            groupId={event.group.id}
            groupTitle={event.group.title}
            groupLocation={event.group.location}
            onActivityCreated={fetchEvent}
            editingActivity={event}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title="Delete Activity"
          centered
        >
          <Stack gap="md">
            <Text>Are you sure you want to delete this activity? This action cannot be undone.</Text>
            <Group justify="flex-end" gap="sm">
              <Button variant="outline" onClick={() => setDeleteModalOpened(false)}>
                Cancel
              </Button>
              <Button color="red" onClick={handleDeleteEvent}>
                Delete Event
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </MainLayout>
  );
}