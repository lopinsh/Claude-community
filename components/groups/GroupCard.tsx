import { Card, Group, Text, Badge, Stack, ActionIcon, Button, Divider, Box, ThemeIcon } from '@mantine/core'
import { IconUsers, IconCalendar, IconMapPin, IconEye, IconClock } from '@tabler/icons-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface GroupEvent {
  id: string
  title: string | null
  startDateTime: Date
  endDateTime: Date | null
  eventType: string
  visibility: string
}

interface GroupWithRelations {
  id: string
  title: string
  description: string | null
  location: string
  maxMembers: number | null
  groupType: string
  createdAt: Date
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
  events: GroupEvent[]
  _count: {
    applications: number
    events: number
  }
}

interface GroupCardProps {
  group: GroupWithRelations
}

export default function GroupCard({ group }: GroupCardProps) {
  const memberText = group.maxMembers
    ? `${group._count.applications}/${group.maxMembers} members`
    : `${group._count.applications} members`

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group gap="xs">
              <Text fw={600} size="lg" lineClamp={1}>
                {group.title}
              </Text>
              <Badge
                variant="light"
                color={group.groupType === 'SINGLE_EVENT' ? 'orange' : 'blue'}
                size="xs"
              >
                {group.groupType === 'SINGLE_EVENT' ? 'Event' : 'Group'}
              </Badge>
            </Group>

            {group.description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {group.description}
              </Text>
            )}
          </Stack>
        </Group>

        {/* Tags */}
        {group.tags.length > 0 && (
          <Group gap="xs">
            {group.tags.slice(0, 3).map(({ tag }) => (
              <Badge key={tag.id} variant="dot" size="xs" color="gray">
                {tag.name}
              </Badge>
            ))}
            {group.tags.length > 3 && (
              <Badge variant="dot" size="xs" color="gray">
                +{group.tags.length - 3} more
              </Badge>
            )}
          </Group>
        )}

        {/* Group Info */}
        <Group gap="lg">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="subtle" color="blue">
              <IconUsers size={14} />
            </ThemeIcon>
            <Text size="sm">{memberText}</Text>
          </Group>

          <Group gap="xs">
            <ThemeIcon size="sm" variant="subtle" color="green">
              <IconMapPin size={14} />
            </ThemeIcon>
            <Text size="sm">{group.location}</Text>
          </Group>

          {group._count.events > 0 && (
            <Group gap="xs">
              <ThemeIcon size="sm" variant="subtle" color="orange">
                <IconCalendar size={14} />
              </ThemeIcon>
              <Text size="sm">{group._count.events} public events</Text>
            </Group>
          )}
        </Group>

        {/* Upcoming Public Events */}
        {group.events.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text size="xs" fw={500} c="dimmed" mb="xs">
                Upcoming Public Events:
              </Text>
              <Stack gap="xs">
                {group.events.slice(0, 2).map((event) => (
                  <Group key={event.id} gap="xs" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '4px' }}>
                    <ThemeIcon size="xs" variant="subtle" color="orange">
                      <IconClock size={10} />
                    </ThemeIcon>
                    <Text size="xs" style={{ flex: 1 }}>
                      {event.title || 'Group Event'} - {formatDistanceToNow(new Date(event.startDateTime), { addSuffix: true })}
                    </Text>
                    <ThemeIcon size="xs" variant="subtle" color="green">
                      <IconEye size={10} />
                    </ThemeIcon>
                  </Group>
                ))}
              </Stack>
            </Box>
          </>
        )}

        {/* Actions */}
        <Group justify="space-between" mt="xs">
          <Text size="xs" c="dimmed">
            by {group.creator.name} • {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
          </Text>

          <Button
            component={Link}
            href={`/groups/${group.id}`}
            size="xs"
            variant="light"
          >
            View Group
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}