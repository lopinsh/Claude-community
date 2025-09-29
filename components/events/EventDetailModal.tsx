'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Modal,
  Stack,
  Title,
  Text,
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
  ScrollArea
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconEdit,
  IconTrash,
  IconEye,
  IconLock,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconQuestionMark
} from '@tabler/icons-react';
import CreateEventModal from './CreateEventModal';

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

interface EventDetailModalProps {
  opened: boolean;
  onClose: () => void;
  eventId: string | null;
  onEventUpdated?: () => void;
  onEventDeleted?: () => void;
}

export default function EventDetailModal({
  opened,
  onClose,
  eventId,
  onEventUpdated,
  onEventDeleted
}: EventDetailModalProps) {
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [userAttendance, setUserAttendance] = useState<string | null>(null);

  const fetchEvent = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${eventId}`);

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
    if (opened && eventId) {
      fetchEvent();
    } else {
      setEvent(null);
      setError(null);
      setUserAttendance(null);
    }
  }, [opened, eventId, session]);

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

      onEventDeleted?.();
      setDeleteModalOpened(false);
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleEventUpdated = () => {
    fetchEvent();
    onEventUpdated?.();
    setEditModalOpened(false);
  };

  if (!opened) return null;

  const isOwner = session?.user?.id === event?.group.creator.id;
  const canEdit = isOwner;
  const canRSVP = session?.user && !isOwner;

  const attendeesByStatus = event ? {
    GOING: event.attendees.filter(a => a.status === 'GOING'),
    MAYBE: event.attendees.filter(a => a.status === 'MAYBE'),
    NOT_GOING: event.attendees.filter(a => a.status === 'NOT_GOING'),
  } : { GOING: [], MAYBE: [], NOT_GOING: [] };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Event Details"
        size="lg"
        centered
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {loading && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="md" />
              <Text>Loading event...</Text>
            </Stack>
          </Center>
        )}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {event && (
          <Stack gap="lg">
            {/* Event Header */}
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="sm">
                    <Title order={3} size="h4">
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
                    <Text size="sm" c="dimmed">{event.description}</Text>
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
              <Group gap="xl" wrap="wrap">
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
            </Stack>

            <Divider />

            {/* RSVP Section */}
            {canRSVP && (
              <Stack gap="md">
                <Title order={5}>Will you attend?</Title>
                <Group gap="sm">
                  <Button
                    variant={userAttendance === 'GOING' ? 'filled' : 'outline'}
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    onClick={() => handleRSVP('GOING')}
                    loading={rsvpLoading}
                    size="sm"
                  >
                    Going
                  </Button>
                  <Button
                    variant={userAttendance === 'MAYBE' ? 'filled' : 'outline'}
                    color="yellow"
                    leftSection={<IconQuestionMark size={16} />}
                    onClick={() => handleRSVP('MAYBE')}
                    loading={rsvpLoading}
                    size="sm"
                  >
                    Maybe
                  </Button>
                  <Button
                    variant={userAttendance === 'NOT_GOING' ? 'filled' : 'outline'}
                    color="red"
                    leftSection={<IconX size={16} />}
                    onClick={() => handleRSVP('NOT_GOING')}
                    loading={rsvpLoading}
                    size="sm"
                  >
                    Can't go
                  </Button>
                </Group>
                {userAttendance && (
                  <Text size="sm" c="dimmed">
                    Your response: <strong>{userAttendance.replace('_', ' ')}</strong>
                  </Text>
                )}
                <Divider />
              </Stack>
            )}

            {/* Attendees List */}
            <Stack gap="md">
              <Title order={5}>Attendees ({event._count.attendees})</Title>

              {attendeesByStatus.GOING.length > 0 && (
                <div>
                  <Group gap="xs" mb="xs">
                    <IconCheck size={16} color="var(--mantine-color-green-6)" />
                    <Text size="sm" fw={500} c="green">Going ({attendeesByStatus.GOING.length})</Text>
                  </Group>
                  <Group gap="xs" wrap="wrap">
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
                  <Group gap="xs" wrap="wrap">
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
                  <Text size="sm" c="dimmed">No RSVPs yet</Text>
                </Center>
              )}
            </Stack>

            {/* Group Info */}
            <Divider />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Part of group: <strong>{event.group.title}</strong>
              </Text>
              <Text size="xs" c="dimmed">
                Created {new Date(event.createdAt).toLocaleDateString()}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Edit Event Modal */}
      {event && (
        <CreateEventModal
          opened={editModalOpened}
          onClose={() => setEditModalOpened(false)}
          groupId={event.group.id}
          groupTitle={event.group.title}
          groupLocation={event.group.location}
          onEventCreated={handleEventUpdated}
          editingEvent={event}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Event"
        centered
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete this event? This action cannot be undone.</Text>
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
    </>
  );
}