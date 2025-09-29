import { Card, Group, Text, Badge, Stack, Button, ThemeIcon, Box } from '@mantine/core'
import { IconCalendar, IconMapPin, IconUsers, IconClock, IconUsersGroup } from '@tabler/icons-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'

interface EventGroup {
  id: string
  title: string
  location: string
  creator: {
    id: string
    name: string | null
  }
}

interface PublicEventWithRelations {
  id: string
  title: string | null
  description: string | null
  startDateTime: Date
  endDateTime: Date | null
  isAllDay: boolean
  eventType: string
  visibility: string
  requiresApproval: boolean
  maxMembers: number | null
  location: string | null
  group: EventGroup
  _count: {
    attendees: number
  }
}

interface EventCardProps {
  event: PublicEventWithRelations
}

export default function EventCard({ event }: EventCardProps) {
  const eventTitle = event.title || `${event.group.title} Event`
  const eventLocation = event.location || event.group.location

  const startDate = new Date(event.startDateTime)
  const endDate = event.endDateTime ? new Date(event.endDateTime) : null

  const formatTime = (date: Date) => {
    if (event.isAllDay) return 'All day'
    return format(date, 'HH:mm')
  }

  const formatDateDisplay = () => {
    if (event.isAllDay) {
      return format(startDate, 'MMM dd, yyyy')
    }

    const dateStr = format(startDate, 'MMM dd, yyyy')
    const timeStr = formatTime(startDate)
    const endTimeStr = endDate ? ` - ${formatTime(endDate)}` : ''

    return `${dateStr} at ${timeStr}${endTimeStr}`
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group gap="xs">
              <Text fw={600} size="lg" lineClamp={1}>
                {eventTitle}
              </Text>
              <Badge
                variant="light"
                color={event.eventType === 'SPECIAL' ? 'grape' : 'blue'}
                size="xs"
              >
                {event.eventType === 'SPECIAL' ? 'Special' : 'Regular'}
              </Badge>
              <Badge variant="dot" color="green" size="xs">
                Public
              </Badge>
            </Group>

            {event.description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {event.description}
              </Text>
            )}
          </Stack>
        </Group>

        {/* Event Details */}
        <Stack gap="xs">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="subtle" color="blue">
              <IconCalendar size={14} />
            </ThemeIcon>
            <Text size="sm">{formatDateDisplay()}</Text>
          </Group>

          <Group gap="xs">
            <ThemeIcon size="sm" variant="subtle" color="green">
              <IconMapPin size={14} />
            </ThemeIcon>
            <Text size="sm">{eventLocation}</Text>
          </Group>

          <Group gap="xs">
            <ThemeIcon size="sm" variant="subtle" color="orange">
              <IconUsersGroup size={14} />
            </ThemeIcon>
            <Text size="sm" component={Link} href={`/groups/${event.group.id}`} style={{ textDecoration: 'none' }}>
              {event.group.title}
            </Text>
          </Group>
        </Stack>

        {/* Attendance Info */}
        <Group gap="lg">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="subtle" color="cyan">
              <IconUsers size={14} />
            </ThemeIcon>
            <Text size="sm">
              {event._count.attendees} attending
              {event.maxMembers && ` (max ${event.maxMembers})`}
            </Text>
          </Group>

          {event.requiresApproval && (
            <Badge variant="light" color="yellow" size="xs">
              Approval Required
            </Badge>
          )}
        </Group>

        {/* Time Until Event */}
        <Box p="xs" style={{ backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: '4px' }}>
          <Group gap="xs">
            <ThemeIcon size="xs" variant="subtle" color="blue">
              <IconClock size={10} />
            </ThemeIcon>
            <Text size="xs" fw={500}>
              {formatDistanceToNow(startDate, { addSuffix: true })}
            </Text>
          </Group>
        </Box>

        {/* Actions */}
        <Group justify="space-between" mt="xs">
          <Text size="xs" c="dimmed">
            by {event.group.creator.name}
          </Text>

          <Group gap="xs">
            <Button
              component={Link}
              href={`/groups/${event.group.id}`}
              size="xs"
              variant="subtle"
            >
              View Group
            </Button>
            <Button
              component={Link}
              href={`/groups/${event.group.id}/events/${event.id}`}
              size="xs"
              variant="light"
            >
              View Event
            </Button>
          </Group>
        </Group>
      </Stack>
    </Card>
  )
}