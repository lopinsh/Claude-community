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
} from '@mantine/core'
import { useForm } from '@mantine/form'
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
}

export default function CreateGroupModal({ opened, onClose }: CreateGroupModalProps) {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Tag management
  const [level1Tags, setLevel1Tags] = useState<Array<{ value: string; label: string }>>([])
  const [level2Tags, setLevel2Tags] = useState<Array<{ value: string; label: string }>>([])
  const [level3Tags, setLevel3Tags] = useState<Array<{ value: string; label: string }>>([])
  const [loadingTags, setLoadingTags] = useState({ level1: false, level2: false, level3: false })

  // Search states for custom tag creation
  const [searchValues, setSearchValues] = useState({ level1: '', level2: '', level3: '' })

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      location: '',
      maxMembers: '',
      level1TagIds: [] as string[],
      level2TagIds: [] as string[],
      level3TagIds: [] as string[],
    },
    validate: {
      title: (value) => !value.trim() ? 'Title is required' : null,
      location: (value) => !value.trim() ? 'Location is required' : null,
      level1TagIds: (value) => value.length === 0 ? 'Please select at least one main category' : null,
    },
  })

  // Fetch tags by level (many-to-many, no parent restrictions)
  const fetchTags = async (level: number) => {
    setLoadingTags(prev => ({ ...prev, [`level${level}`]: true }))
    try {
      const url = `/api/tags?level=${level}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const tagOptions = data.tags.map((tag: Tag) => ({
          value: tag.id,
          label: tag.name
        }))

        if (level === 1) setLevel1Tags(tagOptions)
        else if (level === 2) setLevel2Tags(tagOptions)
        else if (level === 3) setLevel3Tags(tagOptions)
      }
    } catch (error) {
      console.error(`Failed to fetch level ${level} tags:`, error)
    } finally {
      setLoadingTags(prev => ({ ...prev, [`level${level}`]: false }))
    }
  }

  // Load all tag levels independently when modal opens
  useEffect(() => {
    if (opened) {
      fetchTags(1)
      fetchTags(2)
      fetchTags(3)
    }
  }, [opened])

  // Handle custom tag creation
  const handleCreateCustomTag = (level: number, query: string) => {
    if (!query.trim()) return

    const customTag = {
      value: `custom_${Date.now()}_${query}`,
      label: `${query} (pending approval)`
    }

    if (level === 1) {
      setLevel1Tags(prev => [...prev, customTag])
      form.setFieldValue('level1TagIds', [...form.values.level1TagIds, customTag.value])
    } else if (level === 2) {
      setLevel2Tags(prev => [...prev, customTag])
      form.setFieldValue('level2TagIds', [...form.values.level2TagIds, customTag.value])
    } else if (level === 3) {
      setLevel3Tags(prev => [...prev, customTag])
      form.setFieldValue('level3TagIds', [...form.values.level3TagIds, customTag.value])
    }

    // Clear search value
    setSearchValues(prev => ({ ...prev, [`level${level}`]: '' }))
  }

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    try {
      // Combine all selected tags
      const allTagIds = [
        ...values.level1TagIds,
        ...values.level2TagIds,
        ...values.level3TagIds
      ].filter(Boolean)

      const groupResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          location: values.location,
          maxMembers: values.maxMembers ? parseInt(values.maxMembers) : undefined,
          groupType: 'RECURRING_GROUP', // Default since we removed the step
          tagIds: allTagIds,
        }),
      })

      if (!groupResponse.ok) {
        throw new Error('Failed to create group')
      }

      const { group } = await groupResponse.json()

      notifications.show({
        title: 'Success!',
        message: `Group "${values.title}" created successfully.`,
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
    setLevel1Tags([])
    setLevel2Tags([])
    setLevel3Tags([])
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Group"
      size="lg"
      centered
    >
      <Stack gap="lg">
        <Stepper
          active={activeStep}
          allowNextStepsSelect={true}
          onStepClick={setActiveStep}
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
            label="Categories"
            description="Tag your group"
            icon={<IconTags size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text c="dimmed" size="sm">Help people find your group with relevant categories</Text>

              {/* Level 1: Global type */}
              <div>
                <Text size="sm" fw={500} mb="xs">1. Main Categories</Text>
                <MultiSelect
                  placeholder="Select or type main categories for your group"
                  data={level1Tags}
                  searchable
                  disabled={loadingTags.level1}
                  required
                  description="What is the primary focus of your group? Type and press Enter to create custom tags"
                  searchValue={searchValues.level1}
                  onSearchChange={(value) => setSearchValues(prev => ({ ...prev, level1: value }))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && searchValues.level1.trim()) {
                      event.preventDefault()
                      handleCreateCustomTag(1, searchValues.level1.trim())
                    }
                  }}
                  {...form.getInputProps('level1TagIds')}
                  rightSection={loadingTags.level1 ? <Loader size="xs" /> : null}
                />
              </div>

              {/* Level 2: Specific activity */}
              <div>
                <Text size="sm" fw={500} mb="xs">2. Specific Activities</Text>
                <MultiSelect
                  placeholder="Select or type specific activities"
                  data={level2Tags}
                  searchable
                  clearable
                  disabled={loadingTags.level2}
                  description="What specific activities does your group focus on? Type and press Enter to create custom tags"
                  searchValue={searchValues.level2}
                  onSearchChange={(value) => setSearchValues(prev => ({ ...prev, level2: value }))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && searchValues.level2.trim()) {
                      event.preventDefault()
                      handleCreateCustomTag(2, searchValues.level2.trim())
                    }
                  }}
                  {...form.getInputProps('level2TagIds')}
                  rightSection={loadingTags.level2 ? <Loader size="xs" /> : null}
                />
              </div>

              {/* Level 3: Nuances */}
              <div>
                <Text size="sm" fw={500} mb="xs">3. Additional Details</Text>
                <MultiSelect
                  placeholder="Select or type additional details"
                  data={level3Tags}
                  searchable
                  clearable
                  disabled={loadingTags.level3}
                  description="Any specific style, skill level, or additional information? Type and press Enter to create custom tags"
                  searchValue={searchValues.level3}
                  onSearchChange={(value) => setSearchValues(prev => ({ ...prev, level3: value }))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && searchValues.level3.trim()) {
                      event.preventDefault()
                      handleCreateCustomTag(3, searchValues.level3.trim())
                    }
                  }}
                  {...form.getInputProps('level3TagIds')}
                  rightSection={loadingTags.level3 ? <Loader size="xs" /> : null}
                />
              </div>

              <Alert icon={<IconInfoCircle size={16} />} variant="light" color="blue">
                <Text size="sm">
                  <strong>Tip:</strong> Type custom tags and press <kbd>Enter</kbd> to create them. Custom tags will be marked "pending approval" and need moderator review.
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

                  {/* Show selected categories */}
                  <Group ml={24} gap="xs" mt="xs">
                    <ThemeIcon size="xs" variant="subtle" color="orange">
                      <IconTags size={10} />
                    </ThemeIcon>
                    <Group gap="xs">
                      {form.values.level1TagIds.map(tagId => {
                        const tag = level1Tags.find(t => t.value === tagId)
                        return tag ? (
                          <Badge key={tagId} variant="filled" size="xs" color="blue">
                            {tag.label}
                          </Badge>
                        ) : null
                      })}
                      {form.values.level2TagIds.map(tagId => {
                        const tag = level2Tags.find(t => t.value === tagId)
                        return tag ? (
                          <Badge key={tagId} variant="light" size="xs" color="cyan">
                            {tag.label}
                          </Badge>
                        ) : null
                      })}
                      {form.values.level3TagIds.map(tagId => {
                        const tag = level3Tags.find(t => t.value === tagId)
                        return tag ? (
                          <Badge key={tagId} variant="dot" size="xs" color="gray">
                            {tag.label}
                          </Badge>
                        ) : null
                      })}
                    </Group>
                  </Group>
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

        {/* Navigation Buttons */}
        <Group justify="space-between" mt="xl">
          <Button
            variant="subtle"
            onClick={activeStep > 0 ? prevStep : handleClose}
          >
            {activeStep > 0 ? 'Back' : 'Cancel'}
          </Button>

          {activeStep < 2 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button
              onClick={() => form.onSubmit(handleSubmit)()}
              loading={loading}
              leftSection={<IconCheck size={16} />}
            >
              Create Group
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  )
}