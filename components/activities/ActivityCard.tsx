import { Card, Group, Text, Badge, Stack, Box, useMantineTheme, useMantineColorScheme, Center } from '@mantine/core'
import { IconCalendar, IconMapPin, IconUsers, IconClock, IconUsersGroup } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'
import Link from 'next/link'
import { format } from 'date-fns'
import { useState } from 'react'

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
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isHovered, setIsHovered] = useState(false)

  const eventTitle = event.title || `${event.group.title} Event`
  const eventLocation = event.location || event.group.location
  const startDate = new Date(event.startDateTime)
  const endDate = event.endDateTime ? new Date(event.endDateTime) : null

  const formatTime = (date: Date) => {
    if (event.isAllDay) return 'All day'
    return format(date, 'HH:mm')
  }

  return (
    <Card
      component={Link}
      href={`/events/${event.id}`}
      p={isMobile ? 'lg' : 'md'}
      radius="xl"
      withBorder
      h={isMobile ? undefined : 380}
      mih={280}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        cursor: 'pointer',
        transform: isHovered && !isMobile ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? theme.shadows.xl : theme.shadows.sm,
        transition: theme.other.transition,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with gradient */}
      <Card.Section
        h={120}
        style={{
          background: theme.other.brandGradient,
          position: 'relative',
        }}
      >
        <Badge
          pos="absolute"
          top={12}
          left={12}
          variant="filled"
          color={event.eventType === 'SPECIAL' ? 'categoryBlue' : 'categoryTeal'}
          size="xs"
        >
          {event.eventType === 'SPECIAL' ? 'Special' : 'Event'}
        </Badge>

        <Badge
          pos="absolute"
          top={12}
          right={12}
          variant="filled"
          color="categoryGreen"
          size="xs"
        >
          Public
        </Badge>

        {/* Date display */}
        <Box pos="absolute" bottom={16} left={16}>
          <Text size="xl" fw={800} c="white" lh={1}>
            {format(startDate, 'dd')}
          </Text>
          <Text size="sm" fw={600} c="white" tt="uppercase">
            {format(startDate, 'MMM yyyy')}
          </Text>
        </Box>
      </Card.Section>

      {/* Content */}
      <Stack gap="md" mt="md" style={{ flex: 1 }}>
        <Box>
          <Text fw={700} size="lg" lineClamp={1} mb="xs">
            {eventTitle}
          </Text>
          {event.description && (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {event.description}
            </Text>
          )}
        </Box>

        <Stack gap="xs">
          <Group gap="xs">
            <Center w={20} h={20} bg={colorScheme === 'dark' ? 'categoryTeal.9' : 'categoryTeal.0'} style={{ borderRadius: theme.radius.sm }}>
              <IconClock size={12} color={theme.colors.categoryTeal[colorScheme === 'dark' ? 4 : 6]} />
            </Center>
            <Text size="sm" fw={500}>
              {formatTime(startDate)}
              {endDate && !event.isAllDay && ` - ${formatTime(endDate)}`}
            </Text>
          </Group>

          <Group gap="xs">
            <Center w={20} h={20} bg={colorScheme === 'dark' ? 'categoryGreen.9' : 'categoryGreen.0'} style={{ borderRadius: theme.radius.sm }}>
              <IconMapPin size={12} color={theme.colors.categoryGreen[colorScheme === 'dark' ? 4 : 6]} />
            </Center>
            <Text size="sm" fw={500} lineClamp={1}>
              {eventLocation}
            </Text>
          </Group>

          <Group gap="xs">
            <Center w={20} h={20} bg={colorScheme === 'dark' ? 'categoryYellow.9' : 'categoryYellow.0'} style={{ borderRadius: theme.radius.sm }}>
              <IconUsersGroup size={12} color={theme.colors.categoryYellow[colorScheme === 'dark' ? 4 : 7]} />
            </Center>
            <Text size="sm" fw={500} lineClamp={1}>
              {event.group.title}
            </Text>
          </Group>
        </Stack>

        <Box style={{ flex: 1 }} />

        {/* Footer */}
        <Group justify="space-between" pt="md" style={{ borderTop: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}` }}>
          <Group gap="xs">
            <IconUsers size={14} color={theme.colors.categoryBlue[5]} />
            <Text size="xs" c="dimmed" fw={500}>
              {event._count.attendees} attending
            </Text>
          </Group>

          {event.requiresApproval && (
            <Badge size="xs" variant="light" color="categoryYellow">
              Approval Required
            </Badge>
          )}
        </Group>
      </Stack>
    </Card>
  )
}