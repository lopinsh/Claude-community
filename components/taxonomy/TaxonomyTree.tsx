'use client';

import { useState } from 'react';
import { Accordion, Badge, Box, Group, Stack, Text, UnstyledButton, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface TagNode {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  colorKey?: string | null;
  iconName?: string | null;
  description?: string | null;
  _count: {
    groups: number;
    events: number;
  };
  children?: TagNode[];
}

interface TaxonomyTreeProps {
  tree: TagNode[];
  onSuggestTag?: (parentTag: TagNode) => void;
}

export default function TaxonomyTree({ tree, onSuggestTag }: TaxonomyTreeProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Handle tag click - navigate to filtered view
  const handleTagClick = (tag: TagNode) => {
    router.push(`/?tags=${tag.id}`);
  };

  // Render Level 3 tags (leaf nodes)
  const renderLevel3Tags = (level2Tag: TagNode) => {
    if (!level2Tag.children || level2Tag.children.length === 0) {
      return (
        <Text size="sm" c="dimmed" fs="italic" ml="xl">
          No specific tags yet
        </Text>
      );
    }

    return (
      <Stack gap="xs" ml="xl">
        {level2Tag.children.map(level3Tag => (
          <UnstyledButton
            key={level3Tag.id}
            onClick={() => handleTagClick(level3Tag)}
            style={{
              padding: theme.spacing.xs,
              borderRadius: theme.radius.sm,
              transition: theme.other.transition,
              backgroundColor: colorScheme === 'dark'
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
            }}
            sx={{
              '&:hover': {
                backgroundColor: colorScheme === 'dark'
                  ? theme.colors.dark[5]
                  : theme.colors.gray[1],
              },
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <IconChevronRight size={14} color={theme.colors.gray[6]} />
                <Text size="sm">{level3Tag.name}</Text>
              </Group>
              <Group gap="xs">
                {level3Tag._count.groups > 0 && (
                  <Badge size="xs" variant="light" color="gray">
                    {level3Tag._count.groups} groups
                  </Badge>
                )}
                {level3Tag._count.events > 0 && (
                  <Badge size="xs" variant="light" color="gray">
                    {level3Tag._count.events} events
                  </Badge>
                )}
              </Group>
            </Group>
          </UnstyledButton>
        ))}
      </Stack>
    );
  };

  // Render Level 2 tags (with Level 3 children)
  const renderLevel2Section = (level2Tag: TagNode, level1Color: string) => {
    return (
      <Box key={level2Tag.id}>
        {/* Level 2 Header */}
        <Group
          justify="space-between"
          p="md"
          style={{
            borderRadius: theme.radius.md,
            backgroundColor: colorScheme === 'dark'
              ? theme.colors.dark[7]
              : theme.colors.gray[0],
            borderLeft: `4px solid ${theme.colors[level1Color][5]}`,
          }}
        >
          <Group gap="sm">
            <Text fw={600} size="sm">
              {level2Tag.name}
            </Text>
            <Badge size="sm" variant="light" color={level1Color}>
              {level2Tag._count.groups + level2Tag._count.events} total
            </Badge>
          </Group>

          {onSuggestTag && (
            <UnstyledButton
              onClick={(e) => {
                e.stopPropagation();
                onSuggestTag(level2Tag);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors[level1Color][1],
                color: theme.colors[level1Color][7],
                transition: theme.other.transition,
              }}
              sx={{
                '&:hover': {
                  backgroundColor: theme.colors[level1Color][2],
                },
              }}
            >
              <Group gap={4}>
                <IconPlus size={14} />
                <Text size="xs" fw={500}>
                  Suggest
                </Text>
              </Group>
            </UnstyledButton>
          )}
        </Group>

        {/* Level 3 Tags */}
        <Box mt="sm">{renderLevel3Tags(level2Tag)}</Box>
      </Box>
    );
  };

  return (
    <Accordion
      multiple
      value={expandedItems}
      onChange={setExpandedItems}
      variant="separated"
      radius="lg"
    >
      {tree.map(level1Tag => {
        const colorName = level1Tag.colorKey || 'gray';

        return (
          <Accordion.Item
            key={level1Tag.id}
            value={level1Tag.id}
            style={{
              border: `2px solid ${theme.colors[colorName][3]}`,
              backgroundColor: colorScheme === 'dark'
                ? theme.colors.dark[8]
                : 'white',
            }}
          >
            <Accordion.Control
              style={{
                backgroundColor: colorScheme === 'dark'
                  ? theme.colors.dark[7]
                  : theme.colors[colorName][0],
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md">
                  <Box
                    w={4}
                    h={32}
                    bg={`${colorName}.5`}
                    style={{ borderRadius: theme.radius.sm }}
                  />
                  <div>
                    <Text fw={700} size="lg" c={`${colorName}.7`}>
                      {level1Tag.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {level1Tag._count.groups} groups · {level1Tag._count.events} events
                    </Text>
                  </div>
                </Group>
              </Group>
            </Accordion.Control>

            <Accordion.Panel>
              <Stack gap="md" p="md">
                {level1Tag.children && level1Tag.children.length > 0 ? (
                  level1Tag.children.map(level2Tag =>
                    renderLevel2Section(level2Tag, colorName)
                  )
                ) : (
                  <Text size="sm" c="dimmed" fs="italic" ta="center">
                    No subcategories yet
                  </Text>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
