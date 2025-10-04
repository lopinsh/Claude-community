import { Card, Group, Text, Badge, Stack, Box, useMantineTheme, useMantineColorScheme } from '@mantine/core'
import { IconUsers, IconCalendar, IconMapPin } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'
import Link from 'next/link'
import Image from 'next/image'
import { getCardBorderStyle, getTagParentColor } from '@/utils/categoryColors'
import TagBadge from '@/components/common/TagBadge'
import { useState } from 'react'

const getPlaceholderImage = (tags: Array<{ tag: { name: string; level: number } }>) => {
  const level2Categories = tags.filter(({ tag }) => tag.level === 2)
  if (level2Categories.length > 0) {
    const category = level2Categories[0].tag.name.toLowerCase()
    if (category.includes('sport') || category.includes('fitness')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop'
    }
    if (category.includes('art') || category.includes('creative')) {
      return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop'
    }
    if (category.includes('music')) {
      return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop'
    }
    if (category.includes('food') || category.includes('culinary')) {
      return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop'
    }
  }
  return 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop'
}

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
      parentId?: string | null
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
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isHovered, setIsHovered] = useState(false)

  const memberText = group.maxMembers
    ? `${group._count.applications}/${group.maxMembers}`
    : `${group._count.applications}`

  const placeholderImage = getPlaceholderImage(group.tags)
  const nextEvent = group.events.length > 0 ? group.events[0] : null
  const eventDate = nextEvent ? new Date(nextEvent.startDateTime) : null

  // Get border style (handles single color or gradient)
  const borderStyle = getCardBorderStyle(group.tags, theme)

  return (
    <Card
      component={Link}
      href={`/groups/${group.id}`}
      p={isMobile ? 'lg' : 'md'}
      radius="xl"
      withBorder
      pos="relative"
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        cursor: 'pointer',
        height: isMobile ? undefined : 380,
        minHeight: 280,
        borderLeft: borderStyle.hasGradient ? 'none' : borderStyle.borderLeft,
        paddingLeft: borderStyle.hasGradient ? 'calc(var(--mantine-spacing-md) + 4px)' : undefined,
        transform: isHovered && !isMobile ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? theme.shadows.xl : theme.shadows.sm,
        transition: theme.other.transition,
        overflow: 'hidden',
        isolation: 'isolate'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient border for multiple Level 1 categories */}
      {borderStyle.hasGradient && borderStyle.gradientColors && (
        <Box
          pos="absolute"
          left={0}
          top={0}
          h="100%"
          w={4}
          style={{
            background: `linear-gradient(to bottom, ${borderStyle.gradientColors.join(', ')})`,
            zIndex: 1
          }}
        />
      )}
      {/* Image */}
      <Card.Section>
        <Box pos="relative" h={isMobile ? 180 : 160}>
          <Image
            src={placeholderImage}
            alt={group.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={false}
          />
          <Badge
            pos="absolute"
            top={8}
            left={8}
            variant="filled"
            color={group.groupType === 'SINGLE_EVENT' ? 'categoryOrange' : 'categoryTeal'}
            size="xs"
            style={{ zIndex: 1 }}
          >
            {group.groupType === 'SINGLE_EVENT' ? 'EVENT' : 'GROUP'}
          </Badge>
        </Box>
      </Card.Section>

      {/* Content */}
      <Stack gap="sm" mt="md" style={{ flex: 1 }}>
        <Text fw={700} size="lg" lineClamp={1}>
          {group.title}
        </Text>

        {group.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {group.description}
          </Text>
        )}

        {nextEvent && eventDate && (
          <Group gap="xs" p="xs" bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'} style={{ borderRadius: theme.radius.sm }}>
            <IconCalendar size={14} color={theme.colors.categoryBlue[5]} />
            <Text size="xs" fw={500}>
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })} • {eventDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </Text>
          </Group>
        )}

        <Box style={{ flex: 1 }} />

        {/* Stats */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconMapPin size={16} />
            <Text size="sm">{group.location}</Text>
          </Group>
          <Group gap="xs">
            <IconUsers size={16} />
            <Text size="sm">{memberText}</Text>
          </Group>
        </Group>

        {/* Tags */}
        {group.tags.length > 0 && (
          <Group gap="xs">
            {group.tags.slice(0, 3).map(({ tag }) => {
              const parentColor = getTagParentColor(tag, group.tags)
              return (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  parentColorName={parentColor}
                />
              )
            })}
          </Group>
        )}
      </Stack>
    </Card>
  )
}