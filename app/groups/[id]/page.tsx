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
  Alert,
  Box,
  useMantineTheme,
  useMantineColorScheme
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
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
import MainLayout from '@/components/layout/MainLayout'
import GroupDetailSidebar from '@/components/sidebars/GroupDetailSidebar'
import GroupActionsSidebar from '@/components/groups/GroupActionsSidebar'
import GroupMobileMenu from '@/components/groups/GroupMobileMenu'
import CreateActivityModal from '@/components/activities/CreateActivityModal'
import ActivityCalendar from '@/components/calendar/ActivityCalendar'
import ActivityDetailModal from '@/components/activities/ActivityDetailModal'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'

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
  applications: Array<{
    id: string
    userId: string
    status: string // 'pending', 'accepted', 'rejected'
    createdAt: string
    user: {
      id: string
      name: string | null
      email: string
    }
  }>
  _count: {
    applications: number
    events: number
  }
  userApplicationStatus: string | null // 'pending', 'accepted', 'rejected', or null if not applied
  userRole: 'visitor' | 'member' | 'owner' | 'moderator'
}

export default function GroupDetailPage() {
  const params = useParams()
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const { data: session } = useSession()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createEventModalOpened, setCreateEventModalOpened] = useState(false)
  const [defaultStartDate, setDefaultStartDate] = useState<Date | undefined>(undefined)
  const [eventViewMode, setEventViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventDetailModalOpened, setEventDetailModalOpened] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const setBreadcrumbs = useBreadcrumbs()

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

  // Update breadcrumbs when group data is loaded
  useEffect(() => {
    if (group) {
      setBreadcrumbs([
        { title: 'Home', href: '/' },
        { title: 'Groups', href: '/' },
        { title: group.title }
      ])
    }

    // Cleanup breadcrumbs when component unmounts
    return () => {
      setBreadcrumbs(null)
    }
  }, [group, setBreadcrumbs])

  const handleEventCreated = () => {
    fetchGroup()
  }

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setEventDetailModalOpened(true)
  }

  const handleCreateEventOnDate = (date: Date) => {
    setDefaultStartDate(date)
    setCreateEventModalOpened(true)
  }

  const handleEventUpdated = () => {
    fetchGroup()
  }

  const handleEventDeleted = () => {
    fetchGroup()
  }

  if (loading) {
    return (
      <MainLayout>
        <Box style={{ display: 'flex' }}>
          <Container size="lg" py="xl" style={{ flex: 1 }}>
            <Center>
              <Stack align="center">
                <Loader size="lg" />
                <Text>Loading group...</Text>
              </Stack>
            </Center>
          </Container>
        </Box>
      </MainLayout>
    )
  }

  if (error || !group) {
    return (
      <MainLayout>
        <Box style={{ display: 'flex' }}>
          <Container size="lg" py="xl" style={{ flex: 1 }}>
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              <Title order={4}>Group not found</Title>
              <Text>The group you're looking for doesn't exist or has been removed.</Text>
            </Alert>
          </Container>
        </Box>
      </MainLayout>
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
    <MainLayout>
      <Box style={{ display: 'flex' }}>
        {!isMobile && group && (
          <GroupActionsSidebar
            group={group}
            userRole={group.userRole}
            onEdit={() => setCreateEventModalOpened(true)}
            onCreateEvent={() => setCreateEventModalOpened(true)}
            onManageMembers={() => {}}
            onJoin={() => {}}
            onLeave={() => {}}
            onReport={() => {}}
            onApply={() => {}}
            onApprove={() => {}}
          />
        )}

        <Container size="lg" py={isMobile ? 'md' : 'xl'} style={{ flex: 1 }} pb={isMobile ? 100 : undefined}>
        <Stack gap={isMobile ? 'md' : 'lg'}>
          {/* Group Header */}
          <Paper
            p={isMobile ? 'lg' : 'xl'}
            withBorder={!isMobile}
            shadow={isMobile ? 'none' : undefined}
            radius={isMobile ? 0 : undefined}
          >
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" flex={1}>
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

                {isOwner && !isMobile && (
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
              <Group justify="space-between" wrap={isMobile ? 'wrap' : 'nowrap'}>
                <Text size="xs" c="dimmed">
                  Created by {group.creator.name} on {new Date(group.createdAt).toLocaleDateString()}
                </Text>
                {!isOwner && !isMobile && (
                  <Button size="sm" disabled>
                    Join Group
                  </Button>
                )}
              </Group>
            </Stack>
          </Paper>

          {/* Events Section */}
          <Paper
            p={isMobile ? 'lg' : 'lg'}
            withBorder={!isMobile}
            shadow={isMobile ? 'none' : undefined}
            radius={isMobile ? 0 : undefined}
          >
            <Stack gap="md">
              <Group justify="space-between" wrap={isMobile ? 'wrap' : 'nowrap'}>
                <Title order={3}>Activities</Title>
                <Group gap="sm">
                  <Button.Group>
                    <Button
                      variant={eventViewMode === 'list' ? 'filled' : 'outline'}
                      onClick={() => setEventViewMode('list')}
                      size={isMobile ? 'sm' : 'xs'}
                      style={{ minHeight: isMobile ? '44px' : undefined }}
                    >
                      List
                    </Button>
                    <Button
                      variant={eventViewMode === 'calendar' ? 'filled' : 'outline'}
                      onClick={() => setEventViewMode('calendar')}
                      size={isMobile ? 'sm' : 'xs'}
                      style={{ minHeight: isMobile ? '44px' : undefined }}
                    >
                      Calendar
                    </Button>
                  </Button.Group>
                  {isOwner && !isMobile && (
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

              {eventViewMode === 'list' ? (
                <>
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
                    <Stack gap="sm">
                      {group.events.map((event) => (
                        <Card key={event.id} withBorder p="md" style={{ cursor: 'pointer', transition: theme.other.transition }} onClick={() => handleEventClick(event.id)}>
                          <Group justify="space-between" align="flex-start">
                            <Stack gap="xs" flex={1}>
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
                  )}
                </>
              ) : (
                <Stack gap="xs">
                  <ActivityCalendar
                    events={group.events.map(event => ({
                      ...event,
                      location: event.location || group.location,
                      group: {
                        id: group.id,
                        title: group.title,
                        location: group.location,
                      },
                      _count: {
                        attendees: 0,
                      },
                    }))}
                    onEventClick={handleEventClick}
                    onCellClick={isOwner ? handleCreateEventOnDate : undefined}
                    cellClickMode={isOwner ? 'create' : 'navigate'}
                  />
                  {group.events.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center" mt="sm">
                      {isOwner
                        ? "Click any date on the calendar to create your first event!"
                        : "No events scheduled yet"}
                    </Text>
                  )}
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Members Section */}
          <Paper
            p={isMobile ? 'lg' : 'lg'}
            withBorder={!isMobile}
            shadow={isMobile ? 'none' : undefined}
            radius={isMobile ? 0 : undefined}
          >
            <Stack gap="md">
              <Title order={3}>Members ({group._count.applications})</Title>

              <Center py="xl">
                <Text c="dimmed">Member list coming soon...</Text>
              </Center>
            </Stack>
          </Paper>

          {/* Mobile Action Menu */}
          {isMobile && group && (
            <Box
              style={{
                position: 'fixed',
                bottom: 70,
                right: 16,
                zIndex: 100,
              }}
            >
              <GroupMobileMenu
                group={group}
                userRole={group.userRole}
                onEdit={() => setCreateEventModalOpened(true)}
                onCreateEvent={() => setCreateEventModalOpened(true)}
                onManageMembers={() => {}}
                onJoin={() => {}}
                onLeave={() => {}}
                onReport={() => {}}
                onApply={() => {}}
                onApprove={() => {}}
              />
            </Box>
          )}

          {/* Activity Creation Modal */}
          {group && (
            <CreateActivityModal
              opened={createEventModalOpened}
              onClose={() => {
                setCreateEventModalOpened(false)
                setDefaultStartDate(undefined)
              }}
              groupId={group.id}
              groupTitle={group.title}
              groupLocation={group.location}
              onActivityCreated={handleEventCreated}
              defaultStartDate={defaultStartDate}
            />
          )}

          {/* Activity Detail Modal */}
          <ActivityDetailModal
            opened={eventDetailModalOpened}
            onClose={() => setEventDetailModalOpened(false)}
            eventId={selectedEventId}
            onEventUpdated={handleEventUpdated}
            onEventDeleted={handleEventDeleted}
          />
        </Stack>
        </Container>
      </Box>
    </MainLayout>
  )
}