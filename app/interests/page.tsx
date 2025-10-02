'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Badge,
  Button,
  Box,
  Collapse,
  ThemeIcon,
  Loader,
  Center,
  useMantineTheme,
  useMantineColorScheme,
  Alert
} from '@mantine/core'
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconUsers,
  IconAlertCircle
} from '@tabler/icons-react'
import { useSession } from 'next-auth/react'
import { useDisclosure } from '@mantine/hooks'
import Header from '@/components/layout/Header'
import CreateGroupModal from '@/components/groups/CreateGroupModal'
import { getTagParentColor } from '@/utils/categoryColors'

interface Tag {
  id: string
  name: string
  level: number
  parentId: string | null
  _count?: {
    groups: number
  }
}

interface TreeNode extends Tag {
  children: TreeNode[]
}

export default function InterestsPage() {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [tree, setTree] = useState<TreeNode[]>([])
  const [createModalOpened, setCreateModalOpened] = useState(false)
  const [prefilledTags, setPrefilledTags] = useState<string[]>([])

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setLoading(true)
      // Fetch all tags with group counts
      const response = await fetch('/api/tags?includeCount=true')
      if (!response.ok) throw new Error('Failed to fetch tags')

      const data = await response.json()
      setTags(data.tags)

      // Build tree structure
      const treeData = buildTree(data.tags)
      setTree(treeData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const buildTree = (allTags: Tag[]): TreeNode[] => {
    const tagMap: { [key: string]: TreeNode } = {}

    // Create nodes
    allTags.forEach(tag => {
      tagMap[tag.id] = { ...tag, children: [] }
    })

    // Build hierarchy
    const roots: TreeNode[] = []
    allTags.forEach(tag => {
      if (!tag.parentId) {
        roots.push(tagMap[tag.id])
      } else if (tagMap[tag.parentId]) {
        tagMap[tag.parentId].children.push(tagMap[tag.id])
      }
    })

    return roots.sort((a, b) => a.name.localeCompare(b.name))
  }

  const handleCreateGroup = (tagPath: string[]) => {
    setPrefilledTags(tagPath)
    setCreateModalOpened(true)
  }

  if (loading) {
    return (
      <Box mih="100vh" bg={colorScheme === 'dark' ? 'dark.7' : 'gray.0'}>
        <Header />
        <Container size="lg" py="xl">
          <Center h={400}>
            <Stack align="center">
              <Loader size="lg" />
              <Text c="dimmed">Loading interests...</Text>
            </Stack>
          </Center>
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box mih="100vh" bg={colorScheme === 'dark' ? 'dark.7' : 'gray.0'}>
        <Header />
        <Container size="lg" py="xl">
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box mih="100vh" bg={colorScheme === 'dark' ? 'dark.7' : 'gray.0'}>
      <Header />
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Page Header */}
          <Box>
            <Title order={1} mb="sm">Explore Interests</Title>
            <Text size="lg" c="dimmed">
              Discover the organic tree of interests and find your community
            </Text>
          </Box>

          {/* Interest Tree */}
          <Stack gap="md">
            {tree.map(node => (
              <TreeNodeComponent
                key={node.id}
                node={node}
                level={1}
                onCreateGroup={handleCreateGroup}
                canCreateGroup={!!session}
              />
            ))}
          </Stack>

          {tree.length === 0 && (
            <Center py="xl">
              <Text c="dimmed">No interests found. Check back soon!</Text>
            </Center>
          )}
        </Stack>
      </Container>

      {/* Create Group Modal */}
      <CreateGroupModal
        opened={createModalOpened}
        onClose={() => {
          setCreateModalOpened(false)
          setPrefilledTags([])
        }}
        prefilledTagIds={prefilledTags}
      />
    </Box>
  )
}

interface TreeNodeComponentProps {
  node: TreeNode
  level: number
  onCreateGroup: (tagPath: string[]) => void
  canCreateGroup: boolean
  parentPath?: string[]
}

function TreeNodeComponent({
  node,
  level,
  onCreateGroup,
  canCreateGroup,
  parentPath = []
}: TreeNodeComponentProps) {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const [opened, { toggle }] = useDisclosure(false)
  const hasChildren = node.children && node.children.length > 0
  const currentPath = [...parentPath, node.id]

  // Get color based on level
  const getColor = () => {
    if (level === 1) {
      const colorName = getTagParentColor({ id: node.id, name: node.name, level: 1 }, [])
      return colorName
    }
    return 'gray'
  }

  const color = getColor()
  const groupCount = node._count?.groups || 0

  return (
    <Paper
      p="md"
      withBorder
      ml={level > 1 ? 'xl' : 0}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" flex={1} style={{ cursor: hasChildren ? 'pointer' : 'default' }} onClick={hasChildren ? toggle : undefined}>
          {hasChildren && (
            <ThemeIcon size="sm" variant="subtle" color={color}>
              {opened ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            </ThemeIcon>
          )}

          {!hasChildren && <Box w={32} />}

          <Box flex={1}>
            <Group gap="xs">
              <Text fw={level === 1 ? 700 : level === 2 ? 600 : 500} size={level === 1 ? 'lg' : 'md'}>
                {node.name}
              </Text>
              <Badge
                size="sm"
                variant={level === 1 ? 'filled' : 'light'}
                color={color}
              >
                {groupCount} {groupCount === 1 ? 'group' : 'groups'}
              </Badge>
            </Group>
          </Box>
        </Group>

        {/* Subtle Create Group Button */}
        {canCreateGroup && (
          <Button
            size="xs"
            variant="subtle"
            color={color}
            leftSection={<IconPlus size={14} />}
            onClick={() => onCreateGroup(currentPath)}
          >
            Create
          </Button>
        )}
      </Group>

      {/* Children */}
      {hasChildren && (
        <Collapse in={opened}>
          <Stack gap="sm" mt="md">
            {node.children.map(child => (
              <TreeNodeComponent
                key={child.id}
                node={child}
                level={level + 1}
                onCreateGroup={onCreateGroup}
                canCreateGroup={canCreateGroup}
                parentPath={currentPath}
              />
            ))}

            {/* Empty state for leaf nodes */}
            {opened && node.children.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No sub-categories yet
              </Text>
            )}
          </Stack>
        </Collapse>
      )}
    </Paper>
  )
}
