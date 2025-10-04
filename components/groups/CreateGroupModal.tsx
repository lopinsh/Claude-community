'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Stepper,
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Text,
  Paper,
  Badge,
  Alert,
  MultiSelect,
  ThemeIcon,
  Loader,
  ActionIcon,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconUsers,
  IconTags,
  IconSettings,
  IconCheck,
  IconPlus,
  IconMapPin,
  IconInfoCircle,
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from '@mantine/hooks'
import NaturalTagInput from './NaturalTagInput'
import L2SelectionModal from './L2SelectionModal'

const LATVIAN_CITIES = [
  { value: 'riga', label: 'Rīga' },
  { value: 'daugavpils', label: 'Daugavpils' },
  { value: 'liepaja', label: 'Liepāja' },
  { value: 'jelgava', label: 'Jelgava' },
  { value: 'jurmala', label: 'Jūrmala' },
  { value: 'ventspils', label: 'Ventspils' },
  { value: 'rezekne', label: 'Rēzekne' },
  { value: 'valmiera', label: 'Valmiera' },
  { value: 'jekabpils', label: 'Jēkabpils' },
  { value: 'ogre', label: 'Ogre' },
  { value: 'other', label: 'Other' },
]

interface Tag {
  id: string
  name: string
  level: number
  parentId: string | null
}

interface CreateGroupModalProps {
  opened: boolean
  onClose: () => void
  prefilledTagIds?: string[]
}

export default function CreateGroupModal({ opened, onClose, prefilledTagIds = [] }: CreateGroupModalProps) {
  const router = useRouter()
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Tag management - simplified for new flow
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [pendingTagSuggestions, setPendingTagSuggestions] = useState<Array<{
    nameEn: string
    l2TagId: string
    l1Category: string
    l1ColorKey: string
  }>>([])

  // Natural tag input state
  const [tagInputValue, setTagInputValue] = useState('')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  // L2 Selection Modal state
  const [l2ModalOpened, l2ModalHandlers] = useDisclosure(false)
  const [pendingTagName, setPendingTagName] = useState('')

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      location: '',
      maxMembers: '',
    },
    validate: {
      title: (value) => !value.trim() ? 'Title is required' : null,
      location: (value) => !value.trim() ? 'Location is required' : null,
    },
  })

  // Handle tag selection from existing tags
  const handleTagSelect = (tag: Tag | null) => {
    setSelectedTag(tag)
    if (tag && !selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(prev => [...prev, tag])
      setTagInputValue('')
    }
  }

  // Handle creating new tag - open L2 selection modal
  const handleCreateNew = (searchTerm: string) => {
    setPendingTagName(searchTerm)
    l2ModalHandlers.open()
  }

  // Handle L2 selection - create tag suggestion
  const handleL2Submit = async (l2TagId: string, l1Category: any) => {
    try {
      // Create tag suggestion
      const response = await fetch('/api/tags/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: pendingTagName,
          nameLv: pendingTagName, // For now, use same name for both
          level: 3,
          parentTagIds: [l2TagId],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create tag suggestion')
      }

      const data = await response.json()

      // Add to pending suggestions
      setPendingTagSuggestions(prev => [
        ...prev,
        {
          nameEn: pendingTagName,
          l2TagId,
          l1Category: l1Category.name,
          l1ColorKey: l1Category.colorKey,
        },
      ])

      notifications.show({
        title: 'Tag suggestion submitted',
        message: `"${pendingTagName}" will be reviewed by moderators`,
        color: 'blue',
      })

      // Clear inputs and close modal
      setTagInputValue('')
      setPendingTagName('')
      l2ModalHandlers.close()
    } catch (error: any) {
      console.error('Error creating tag suggestion:', error)
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create tag suggestion',
        color: 'red',
      })
    }
  }

  // Handle tag removal
  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId))
  }

  const handleRemovePendingTag = (index: number) => {
    setPendingTagSuggestions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (values: typeof form.values) => {
    // Validation: require at least one tag (existing or pending)
    if (selectedTags.length === 0 && pendingTagSuggestions.length === 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please add at least one tag to your group',
        color: 'red',
      })
      return
    }

    setLoading(true)
    try {
      // Get tag IDs from selected existing tags
      const tagIds = selectedTags.map(t => t.id)

      const groupResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          location: values.location,
          maxMembers: values.maxMembers ? parseInt(values.maxMembers) : undefined,
          groupType: 'RECURRING_GROUP',
          tagIds,
          // Note: Pending tags are already created as suggestions in the database
          // The group can still be created and will be linked once tags are approved
        }),
      })

      if (!groupResponse.ok) {
        throw new Error('Failed to create group')
      }

      const { group } = await groupResponse.json()

      const pendingCount = pendingTagSuggestions.length
      const successMessage = pendingCount > 0
        ? `Group created! ${pendingCount} tag${pendingCount > 1 ? 's' : ''} pending moderator approval.`
        : `Group "${values.title}" created successfully.`

      notifications.show({
        title: 'Success!',
        message: successMessage,
        color: 'green',
      })

      handleClose()
      router.push(`/groups/${group.id}`)
    } catch (error) {
      console.error('Group creation error:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to create group. Please try again.',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setActiveStep((current) => Math.min(current + 1, 2))
  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0))

  const handleClose = () => {
    form.reset()
    setActiveStep(0)
    setSelectedTags([])
    setPendingTagSuggestions([])
    setTagInputValue('')
    setSelectedTag(null)
    setPendingTagName('')
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Group"
      size="lg"
      centered={!isMobile}
      fullScreen={isMobile}
      styles={{
        body: {
          padding: isMobile ? theme.spacing.md : undefined,
        },
      }}
    >
      <Stack gap="lg">
        <Stepper
          active={activeStep}
          allowNextStepsSelect={true}
          onStepClick={setActiveStep}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          iconSize={isMobile ? 32 : 42}
        >
          {/* Step 1: Basic Information */}
          <Stepper.Step
            label="Basic Information"
            description="Group details"
            icon={<IconUsers size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text c="dimmed" size="sm">Tell us about your group</Text>

              <TextInput
                label="Group Title"
                placeholder="e.g., Hamlet Theater Group, Morning Yoga, Weekly Football"
                required
                {...form.getInputProps('title')}
              />

              <Textarea
                label="Description"
                placeholder="What is this group about? What should people expect?"
                minRows={3}
                {...form.getInputProps('description')}
              />

              <Group grow>
                <Select
                  label="Location"
                  placeholder="Select city"
                  data={LATVIAN_CITIES}
                  searchable
                  required
                  {...form.getInputProps('location')}
                />

                <NumberInput
                  label="Max Members"
                  placeholder="Leave empty for unlimited"
                  min={1}
                  max={1000}
                  {...form.getInputProps('maxMembers')}
                />
              </Group>
            </Stack>
          </Stepper.Step>

          {/* Step 2: Categories */}
          <Stepper.Step
            label="Topics"
            description="What's this about?"
            icon={<IconTags size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text c="dimmed" size="sm">
                Describe what your group focuses on. Search for existing topics or create new ones.
              </Text>

              <NaturalTagInput
                value={tagInputValue}
                onChange={setTagInputValue}
                onTagSelect={handleTagSelect}
                onCreateNew={handleCreateNew}
                placeholder="What's your group about? (e.g., 'Basketball', 'Urban Foraging', 'Book Club')"
              />

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <Paper p="md" withBorder>
                  <Text size="sm" fw={600} mb="xs">
                    Selected Topics:
                  </Text>
                  <Group gap="xs">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="filled"
                        color="blue"
                        size="lg"
                        rightSection={
                          <ActionIcon
                            size="xs"
                            variant="transparent"
                            onClick={() => handleRemoveTag(tag.id)}
                          >
                            <IconPlus size={12} style={{ transform: 'rotate(45deg)' }} />
                          </ActionIcon>
                        }
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </Group>
                </Paper>
              )}

              {/* Pending Tag Suggestions */}
              {pendingTagSuggestions.length > 0 && (
                <Paper p="md" withBorder style={{
                  borderStyle: 'dashed',
                  backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
                }}>
                  <Text size="sm" fw={600} mb="xs">
                    Pending Topics (awaiting approval):
                  </Text>
                  <Group gap="xs">
                    {pendingTagSuggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="light"
                        color={suggestion.l1ColorKey}
                        size="lg"
                        rightSection={
                          <ActionIcon
                            size="xs"
                            variant="transparent"
                            onClick={() => handleRemovePendingTag(index)}
                          >
                            <IconPlus size={12} style={{ transform: 'rotate(45deg)' }} />
                          </ActionIcon>
                        }
                      >
                        {suggestion.nameEn} (pending)
                      </Badge>
                    ))}
                  </Group>
                </Paper>
              )}

              <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
                <Text size="sm">
                  <strong>Tip:</strong> Can't find your topic? Type it in and create a new one. New topics require moderator approval but your group will be visible immediately.
                </Text>
              </Alert>
            </Stack>
          </Stepper.Step>

          {/* Step 3: Summary & Create */}
          <Stepper.Step
            label="Create Group"
            description="Review and create"
            icon={<IconCheck size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text c="dimmed" size="sm">Review and create your group</Text>

              <Paper withBorder p="md">
                <Stack gap="xs">
                  <Group>
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconUsers size={14} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">{form.values.title}</Text>
                    <Badge variant="light" size="xs" color="green">
                      Group
                    </Badge>
                  </Group>

                  {form.values.description && (
                    <Text size="xs" c="dimmed" ml={24}>{form.values.description}</Text>
                  )}

                  <Group ml={24} gap="lg">
                    <Group gap="xs">
                      <ThemeIcon size="xs" variant="subtle" color="gray">
                        <IconMapPin size={10} />
                      </ThemeIcon>
                      <Text size="xs">{form.values.location}</Text>
                    </Group>

                    {form.values.maxMembers && (
                      <Group gap="xs">
                        <ThemeIcon size="xs" variant="subtle" color="gray">
                          <IconUsers size={10} />
                        </ThemeIcon>
                        <Text size="xs">Max {form.values.maxMembers} members</Text>
                      </Group>
                    )}
                  </Group>

                  {/* Show selected and pending tags */}
                  {(selectedTags.length > 0 || pendingTagSuggestions.length > 0) && (
                    <Group ml={24} gap="xs" mt="xs">
                      <ThemeIcon size="xs" variant="subtle" color="orange">
                        <IconTags size={10} />
                      </ThemeIcon>
                      <Group gap="xs">
                        {selectedTags.map((tag) => (
                          <Badge key={tag.id} variant="filled" size="xs" color="blue">
                            {tag.name}
                          </Badge>
                        ))}
                        {pendingTagSuggestions.map((suggestion, index) => (
                          <Badge
                            key={index}
                            variant="light"
                            size="xs"
                            color={suggestion.l1ColorKey}
                          >
                            {suggestion.nameEn} (pending)
                          </Badge>
                        ))}
                      </Group>
                    </Group>
                  )}
                </Stack>
              </Paper>

              <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                <Text size="sm" fw={500} mb="xs">Next Steps:</Text>
                <Text size="sm" c="dimmed">
                  After creating your group, you'll be able to schedule events directly from the group page.
                  Group managers can create both private events (for members) and public events (open to everyone).
                </Text>
              </Paper>
            </Stack>
          </Stepper.Step>
        </Stepper>

        {/* Premium Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: isMobile ? '16px' : '32px',
          paddingTop: isMobile ? '16px' : '24px',
          borderTop: '1px solid #f1f5f9',
          gap: isMobile ? '12px' : '0'
        }}>
          <button
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: isMobile ? '14px 24px' : '12px 24px',
              minHeight: isMobile ? '44px' : 'auto',
              borderRadius: '12px',
              fontWeight: 500,
              fontSize: '14px',
              color: '#64748b',
              transition: 'all 0.2s ease',
              backgroundColor: 'transparent'
            }}
            onClick={activeStep > 0 ? prevStep : handleClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            {activeStep > 0 ? 'Back' : 'Cancel'}
          </button>

          {activeStep < 2 ? (
            <button
              style={{
                all: 'unset',
                cursor: 'pointer',
                padding: isMobile ? '14px 32px' : '12px 32px',
                minHeight: isMobile ? '44px' : 'auto',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
              }}
              onClick={nextStep}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.25)';
              }}
            >
              Next
            </button>
          ) : (
            <button
              style={{
                all: 'unset',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: isMobile ? '14px 32px' : '12px 32px',
                minHeight: isMobile ? '44px' : 'auto',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                color: '#ffffff',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 2px 8px rgba(34, 197, 94, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1
              }}
              onClick={() => form.onSubmit(handleSubmit)()}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.25)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  Create Group
                </>
              )}
            </button>
          )}
        </div>
      </Stack>

      {/* L2 Selection Modal */}
      <L2SelectionModal
        opened={l2ModalOpened}
        onClose={l2ModalHandlers.close}
        tagName={pendingTagName}
        onSubmit={handleL2Submit}
      />
    </Modal>
  )
}