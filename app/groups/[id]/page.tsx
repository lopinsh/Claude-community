'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
  Grid,
  Card,
  Center,
  Loader,
  Alert
} from '@mantine/core'
import {
  IconUsers,
  IconMapPin,
  IconCalendar,
  IconEdit,
  IconPlus,
  IconTags,
  IconAlertCircle
} from '@tabler/icons-react'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import CreateEventModal from '@/components/events/CreateEventModal'
import EventCalendar from '@/components/events/EventCalendar'
import EventDetailModal from '@/components/events/EventDetailModal'

interface Group {
  id: string
  title: string
  description: string | null
  location: string
  maxMembers: number | null
  groupType: string
  createdAt: string
  creator: {
    id: string
    name: string | null
  }
  tags: Array<{
    tag: {
      id: string
      name: string
      level: number
    }
  }>
  events: Array<{
    id: string
    title: string | null
    startDateTime: string
    endDateTime: string | null
    eventType: string
    visibility: string
  }>
  _count: {
    applications: number
    events: number
  }
}

export default function GroupDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createEventModalOpened, setCreateEventModalOpened] = useState(false)
  const [eventViewMode, setEventViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventDetailModalOpened, setEventDetailModalOpened] = useState(false)

  const fetchGroup = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch group')
      }
      const data = await response.json()
      setGroup(data.group)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchGroup()
    }
  }, [params.id])

  const handleEventCreated = () => {
    fetchGroup()
  }

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setEventDetailModalOpened(true)
  }

  const handleEventUpdated = () => {
    fetchGroup()
  }

  const handleEventDeleted = () => {
    fetchGroup()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Header />
        <Container size="lg" py="xl">
          <Center>
            <Stack align="center">
              <Loader size="lg" />
              <Text>Loading group...</Text>
            </Stack>
          </Center>
        </Container>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Header />
        <Container size="lg" py="xl">
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            <Title order={4}>Group not found</Title>
            <Text>The group you're looking for doesn't exist or has been removed.</Text>
          </Alert>
        </Container>
      </div>
    )
  }

  const isOwner = session?.user?.id === group.creator.id

  // Group tags by level for better display
  const tagsByLevel = {
    level1: group.tags.filter(({ tag }) => tag.level === 1),
    level2: group.tags.filter(({ tag }) => tag.level === 2),
    level3: group.tags.filter(({ tag }) => tag.level === 3),
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <Header />

      <Container size="lg" py="xl">
        <Stack gap="lg">
          {/* Group Header */}
          <Paper p="xl" withBorder>
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="sm">
                    <Title order={1} size="h2">{group.title}</Title>
                    <Badge variant="light" color="blue">
                      {group.groupType === 'SINGLE_EVENT' ? 'Event' : 'Group'}
                    </Badge>
                  </Group>

                  {group.description && (
                    <Text c="dimmed">{group.description}</Text>
                  )}
                </Stack>

                {isOwner && (
                  <Button
                    variant="light"
                    leftSection={<IconEdit size={16} />}
                    disabled
                  >
                    Edit Group
                  </Button>
                )}
              </Group>

              {/* Group Info */}
              <Group gap="xl">
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="subtle" color="blue">
                    <IconUsers size={14} />
                  </ThemeIcon>
                  <Text size="sm">
                    {group._count.applications} member{group._count.applications !== 1 ? 's' : ''}
                    {group.maxMembers && ` (max ${group.maxMembers})`}
                  </Text>
                </Group>

                <Group gap="xs">
                  <ThemeIcon size="sm" variant="subtle" color="green">
                    <IconMapPin size={14} />
                  </ThemeIcon>
                  <Text size="sm">{group.location}</Text>
                </Group>

                <Group gap="xs">
                  <ThemeIcon size="sm" variant="subtle" color="orange">
                    <IconCalendar size={14} />
                  </ThemeIcon>
                  <Text size="sm">{group._count.events} event{group._count.events !== 1 ? 's' : ''}</Text>
                </Group>
              </Group>

              {/* Tags */}
              <Stack gap="xs">
                <Group gap="xs" align="center">
                  <ThemeIcon size="sm" variant="subtle" color="orange">
                    <IconTags size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>Categories:</Text>
                </Group>
                <Group gap="xs" ml="lg">
                  {tagsByLevel.level1.map(({ tag }) => (
                    <Badge key={tag.id} variant="filled" size="sm" color="blue">
                      {tag.name}
                    </Badge>
                  ))}
                  {tagsByLevel.level2.map(({ tag }) => (
                    <Badge key={tag.id} variant="light" size="sm" color="cyan">
                      {tag.name}
                    </Badge>
                  ))}
                  {tagsByLevel.level3.map(({ tag }) => (
                    <Badge key={tag.id} variant="dot" size="sm" color="gray">
                      {tag.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>

              <Divider />

              {/* Creator Info */}
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Created by {group.creator.name} on {new Date(group.createdAt).toLocaleDateString()}
                </Text>
                {!isOwner && (
                  <Button size="sm" disabled>
                    Join Group
                  </Button>
                )}
              </Group>
            </Stack>
          </Paper>

          {/* Events Section */}
          <Paper p="lg" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>Events</Title>
                <Group gap="sm">
                  <Button.Group>
                    <Button
                      variant={eventViewMode === 'list' ? 'filled' : 'outline'}
                      onClick={() => setEventViewMode('list')}
                      size="xs"
                    >
                      List
                    </Button>
                    <Button
                      variant={eventViewMode === 'calendar' ? 'filled' : 'outline'}
                      onClick={() => setEventViewMode('calendar')}
                      size="xs"
                    >
                      Calendar
                    </Button>
                  </Button.Group>
                  {isOwner && (
                    <Button
                      size="sm"
                      variant="light"
                      leftSection={<IconPlus size={16} />}
                      onClick={() => setCreateEventModalOpened(true)}
                    >
                      Create Event
                    </Button>
                  )}
                </Group>
              </Group>

              {group.events.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <ThemeIcon size="xl" variant="light" color="gray">
                      <IconCalendar size={24} />
                    </ThemeIcon>
                    <Text size="lg" c="dimmed">No events scheduled yet</Text>
                    {isOwner && (
                      <Text size="sm" c="dimmed">
                        Create your first event to get started!
                      </Text>
                    )}
                  </Stack>
                </Center>
              ) : (
                <>
                  {eventViewMode === 'list' ? (
                    <Stack gap="sm">
                      {group.events.map((event) => (
                        <Card key={event.id} withBorder p="md" style={{ cursor: 'pointer' }} onClick={() => handleEventClick(event.id)}>
                          <Group justify="space-between" align="flex-start">
                            <Stack gap="xs" style={{ flex: 1 }}>
                              <Group gap="sm">
                                <Text fw={500}>
                                  {event.title || `${group.title} Event`}
                                </Text>
                                <Badge
                                  variant={event.visibility === 'PUBLIC' ? 'light' : 'filled'}
                                  color={event.visibility === 'PUBLIC' ? 'green' : 'blue'}
                                  size="xs"
                                >
                                  {event.visibility}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  color={event.eventType === 'SPECIAL' ? 'orange' : 'blue'}
                                  size="xs"
                                >
                                  {event.eventType}
                                </Badge>
                              </Group>
                              <Text size="sm" c="dimmed">
                                📅 {new Date(event.startDateTime).toLocaleString()}
                                {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleString()}`}
                              </Text>
                            </Stack>
                            <Group gap="xs">
                              <Text size="xs" c="dimmed">
                                Click to view details
                              </Text>
                            </Group>
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <EventCalendar
                      events={group.events.map(event => ({
                        ...event,
                        group: {
                          id: group.id,
                          title: group.title,
                          location: group.location,
                          creator: group.creator,
                        },
                        _count: { attendees: 0 }, // We'll need to fetch this if needed
                      }))}
                      onSelectEvent={(event) => handleEventClick(event.id)}
                      height={500}
                    />
                  )}
                </>
              )}
            </Stack>
          </Paper>

          {/* Members Section */}
          <Paper p="lg" withBorder>
            <Stack gap="md">
              <Title order={3}>Members ({group._count.applications})</Title>

              <Center py="xl">
                <Text c="dimmed">Member list coming soon...</Text>
              </Center>
            </Stack>
          </Paper>

          {/* Event Creation Modal */}
          {group && (
            <CreateEventModal
              opened={createEventModalOpened}
              onClose={() => setCreateEventModalOpened(false)}
              groupId={group.id}
              groupTitle={group.title}
              groupLocation={group.location}
              onEventCreated={handleEventCreated}
            />
          )}

          {/* Event Detail Modal */}
          <EventDetailModal
            opened={eventDetailModalOpened}
            onClose={() => setEventDetailModalOpened(false)}
            eventId={selectedEventId}
            onEventUpdated={handleEventUpdated}
            onEventDeleted={handleEventDeleted}
          />
        </Stack>
      </Container>
    </div>
  )
}