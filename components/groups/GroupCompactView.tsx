'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Group,
  Text,
  Badge,
  UnstyledButton,
  ThemeIcon,
  Avatar,
  useMantineTheme,
  useMantineColorScheme,
  Tooltip,
  Stack
} from '@mantine/core';
import {
  IconUsers,
  IconMapPin,
  IconCalendar,
  IconArrowRight,
  IconCategory
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { getTagParentColor } from '@/utils/categoryColors';

interface Group {
  id: string;
  title: string;
  description: string | null;
  location: string;
  maxMembers: number | null;
  groupType: string;
  createdAt: Date;
  creator: { id: string; name: string | null };
  tags: Array<{ tag: { id: string; name: string; level: number } }>;
  events: Array<{
    id: string;
    title: string | null;
    startDateTime: Date;
    endDateTime: Date | null;
    eventType: string;
    visibility: string;
  }>;
  _count: { applications: number; events: number };
}

interface GroupCompactViewProps {
  groups: Group[];
}

export default function GroupCompactView({ groups }: GroupCompactViewProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleGroupClick = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  if (isMobile) {
    // Mobile: Stack layout
    return (
      <Stack gap="xs">
        {groups.map((group) => {
          const level1Tags = group.tags.filter(t => t.tag.level === 1).slice(0, 2);
          const hasMoreTags = group.tags.length > 2;

          return (
            <UnstyledButton
              key={group.id}
              onClick={() => handleGroupClick(group.id)}
              p="md"
              bg={colorScheme === 'dark' ? 'dark.6' : 'white'}
              style={{
                borderRadius: theme.radius.md,
                border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
                transition: theme.other.transition,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.white;
              }}
            >
              <Group gap="md" wrap="nowrap">
                <Avatar
                  size="md"
                  radius="md"
                  color={level1Tags[0] ? getTagParentColor(level1Tags[0].tag.name) : 'gray'}
                >
                  <IconUsers size={20} />
                </Avatar>

                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600} size="sm" lineClamp={1} mb={4}>
                    {group.title}
                  </Text>
                  <Group gap="xs" wrap="wrap">
                    <Group gap={4}>
                      <IconMapPin size={12} color={theme.colors.gray[6]} />
                      <Text size="xs" c="dimmed">
                        {group.location}
                      </Text>
                    </Group>
                    <Group gap={4}>
                      <IconUsers size={12} color={theme.colors.gray[6]} />
                      <Text size="xs" c="dimmed">
                        {group._count.applications}
                      </Text>
                    </Group>
                    <Group gap={4}>
                      <IconCalendar size={12} color={theme.colors.gray[6]} />
                      <Text size="xs" c="dimmed">
                        {group._count.events}
                      </Text>
                    </Group>
                  </Group>
                </Box>

                <IconArrowRight size={16} color={theme.colors.gray[5]} />
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>
    );
  }

  // Desktop: Table layout
  return (
    <Box
      bg={colorScheme === 'dark' ? 'dark.6' : 'white'}
      style={{
        borderRadius: theme.radius.md,
        border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <Group
        gap="md"
        p="sm"
        bg={colorScheme === 'dark' ? 'dark.7' : 'gray.0'}
        style={{
          borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        }}
      >
        <Box w={40}></Box>
        <Box style={{ flex: '1 1 300px', minWidth: 200 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Group
          </Text>
        </Box>
        <Box w={150}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Tags
          </Text>
        </Box>
        <Box w={120}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Location
          </Text>
        </Box>
        <Box w={80} ta="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Members
          </Text>
        </Box>
        <Box w={80} ta="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Events
          </Text>
        </Box>
        <Box w={40}></Box>
      </Group>

      {/* Table Rows */}
      {groups.map((group) => {
        const level1Tags = group.tags.filter(t => t.tag.level === 1).slice(0, 2);
        const hasMoreTags = group.tags.length > 2;

        return (
          <UnstyledButton
            key={group.id}
            onClick={() => handleGroupClick(group.id)}
            w="100%"
            style={{
              borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]}`,
              transition: theme.other.transition,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Group gap="md" p="sm" wrap="nowrap">
              {/* Avatar */}
              <Avatar
                size={32}
                radius="sm"
                color={level1Tags[0] ? getTagParentColor(level1Tags[0].tag.name) : 'gray'}
              >
                <IconUsers size={16} />
              </Avatar>

              {/* Group Title */}
              <Box style={{ flex: '1 1 300px', minWidth: 200 }}>
                <Text fw={600} size="sm" lineClamp={1}>
                  {group.title}
                </Text>
                {group.description && (
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {group.description}
                  </Text>
                )}
              </Box>

              {/* Tags */}
              <Box w={150}>
                <Group gap={4}>
                  {level1Tags.map((tagRel) => (
                    <Badge
                      key={tagRel.tag.id}
                      size="xs"
                      variant="light"
                      color={getTagParentColor(tagRel.tag.name)}
                    >
                      {tagRel.tag.name}
                    </Badge>
                  ))}
                  {hasMoreTags && (
                    <Tooltip label={`${group.tags.length - 2} more tags`}>
                      <Badge size="xs" variant="outline" color="gray">
                        +{group.tags.length - 2}
                      </Badge>
                    </Tooltip>
                  )}
                </Group>
              </Box>

              {/* Location */}
              <Box w={120}>
                <Group gap={4}>
                  <IconMapPin size={14} color={theme.colors.gray[6]} />
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {group.location}
                  </Text>
                </Group>
              </Box>

              {/* Members */}
              <Box w={80} ta="center">
                <Text size="sm" fw={500}>
                  {group._count.applications}
                </Text>
              </Box>

              {/* Events */}
              <Box w={80} ta="center">
                <Badge
                  size="sm"
                  variant={group._count.events > 0 ? 'light' : 'outline'}
                  color={group._count.events > 0 ? 'categoryTeal' : 'gray'}
                >
                  {group._count.events}
                </Badge>
              </Box>

              {/* Arrow */}
              <Box w={40} ta="center">
                <IconArrowRight size={16} color={theme.colors.gray[5]} />
              </Box>
            </Group>
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
