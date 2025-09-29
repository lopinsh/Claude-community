'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Title,
  Textarea,
  Button,
  Card,
  Group,
  Stack,
  TextInput,
  Select,
  NumberInput,
  Alert,
  Center,
  Loader,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import Header from '@/components/layout/Header'
import { IconArrowLeft } from '@tabler/icons-react'
import Link from 'next/link'

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
  parentId?: string
}

export default function CreateActivityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Tag states
  const [level1Tags, setLevel1Tags] = useState<Tag[]>([])
  const [level2Tags, setLevel2Tags] = useState<Tag[]>([])
  const [level3Tags, setLevel3Tags] = useState<Tag[]>([])

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      location: '',
      maxMembers: '',
      level1Tag: '',
      level2Tag: '', 
      level3Tag: '',
    },
    validate: {
      title: (value) => !value.trim() ? 'Title is required' : null,
      location: (value) => !value.trim() ? 'Location is required' : null,
      level1Tag: (value) => !value ? 'Please select a category' : null,
    },
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch Level 1 tags on mount
  useEffect(() => {
    const fetchLevel1Tags = async () => {
      try {
        const response = await fetch('/api/tags?level=1')
        if (response.ok) {
          const data = await response.json()
          setLevel1Tags(data.tags)
        }
      } catch (error) {
        console.error('Failed to fetch level 1 tags:', error)
      }
    }
    fetchLevel1Tags()
  }, [])

  // Fetch Level 2 tags when Level 1 changes
  useEffect(() => {
    if (!form.values.level1Tag) {
      setLevel2Tags([])
      form.setFieldValue('level2Tag', '')
      return
    }

    const fetchLevel2Tags = async () => {
      try {
        const response = await fetch(`/api/tags?parentId=${form.values.level1Tag}`)
        if (response.ok) {
          const data = await response.json()
          setLevel2Tags(data.tags)
        }
      } catch (error) {
        console.error('Failed to fetch level 2 tags:', error)
      }
    }
    fetchLevel2Tags()
  }, [form.values.level1Tag])

  // Fetch Level 3 tags when Level 2 changes
  useEffect(() => {
    if (!form.values.level2Tag) {
      setLevel3Tags([])
      form.setFieldValue('level3Tag', '')
      return
    }

    const fetchLevel3Tags = async () => {
      try {
        const response = await fetch(`/api/tags?parentId=${form.values.level2Tag}`)
        if (response.ok) {
          const data = await response.json()
          setLevel3Tags(data.tags)
        }
      } catch (error) {
        console.error('Failed to fetch level 3 tags:', error)
      }
    }
    fetchLevel3Tags()
  }, [form.values.level2Tag])

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    
    try {
      // Compile selected tags
      const tagIds = [values.level1Tag]
      if (values.level2Tag) tagIds.push(values.level2Tag)
      if (values.level3Tag) tagIds.push(values.level3Tag)

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim() || null,
          location: values.location.trim(),
          maxMembers: values.maxMembers ? parseInt(values.maxMembers) : null,
          tagIds,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        notifications.show({
          title: 'Success',
          message: 'Activity created successfully!',
          color: 'green',
        })
        router.push(`/activities/${data.activity.id}`)
      } else {
        const error = await response.json()
        notifications.show({
          title: 'Error',
          message: error.error || 'Failed to create activity',
          color: 'red',
        })
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred. Please try again.',
        color: 'red',
      })
    }
    
    setLoading(false)
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
        <Header />
        <Center style={{ minHeight: '50vh' }}>
          <Loader size="lg" />
        </Center>
      </div>
    )
  }

  if (!session) return null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      <Header />
      
      <Container size="md" py="xl">
        <Card shadow="lg" radius="lg" p="xl">
          <Stack gap="lg">
            <Group>
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                component={Link}
                href="/activities"
              >
                Back to Activities
              </Button>
            </Group>

            <Title order={1}>Create New Activity</Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Activity Title"
                  placeholder="e.g., Weekly Folk Dancing Practice"
                  required
                  {...form.getInputProps('title')}
                />

                <Textarea
                  label="Description"
                  placeholder="Describe your activity..."
                  minRows={3}
                  {...form.getInputProps('description')}
                />

                <Select
                  label="Location"
                  placeholder="Select city"
                  data={LATVIAN_CITIES}
                  searchable
                  required
                  {...form.getInputProps('location')}
                />

                <NumberInput
                  label="Maximum Members"
                  placeholder="Leave empty for unlimited"
                  min={1}
                  {...form.getInputProps('maxMembers')}
                />

                <Select
                  label="Category"
                  placeholder="Select main category"
                  data={level1Tags.map(tag => ({ value: tag.id, label: tag.name }))}
                  required
                  {...form.getInputProps('level1Tag')}
                />

                {level2Tags.length > 0 && (
                  <Select
                    label="Specific Activity"
                    placeholder="Select specific type"
                    data={level2Tags.map(tag => ({ value: tag.id, label: tag.name }))}
                    {...form.getInputProps('level2Tag')}
                  />
                )}

                {level3Tags.length > 0 && (
                  <Select
                    label="Additional Details"
                    placeholder="Select additional attributes"
                    data={level3Tags.map(tag => ({ value: tag.id, label: tag.name }))}
                    {...form.getInputProps('level3Tag')}
                  />
                )}

                <Group justify="flex-end">
                  <Button type="submit" loading={loading}>
                    Create Activity
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Container>
    </div>
  )
}