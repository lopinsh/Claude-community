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
  Center,
  Loader,
  Text,
  Divider,
  Paper,
  Badge,
  Stepper,
  MultiSelect,
  Switch,
  Alert,
  Box,
  ActionIcon,
  List,
  ThemeIcon,
  Checkbox
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import Header from '@/components/layout/Header'
import {
  IconArrowLeft,
  IconUsers,
  IconCalendar,
  IconPlus,
  IconTrash,
  IconCheck,
  IconClock,
  IconMapPin
} from '@tabler/icons-react'
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

const WEEKDAYS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
]

interface Event {
  id: string
  title: string
  weekDay: number
  startTime: string
  endTime: string
  eventType: 'REGULAR' | 'SPECIAL'
}

export default function CreateGroupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      location: '',
      maxMembers: '',
      groupType: 'RECURRING_GROUP' as 'SINGLE_EVENT' | 'RECURRING_GROUP',
      // Events for recurring groups
      events: [] as Event[],
      // Single event data
      singleEventDate: null as Date | null,
      singleEventEndDate: null as Date | null,
      singleEventAllDay: false,
    },
    validate: {
      title: (value) => !value.trim() ? 'Title is required' : null,
      location: (value) => !value.trim() ? 'Location is required' : null,
    },
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const addEvent = () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: '',
      weekDay: 1, // Monday
      startTime: '18:00',
      endTime: '20:00',
      eventType: 'REGULAR'
    }
    form.setFieldValue('events', [...form.values.events, newEvent])
  }

  const removeEvent = (eventId: string) => {
    form.setFieldValue('events', form.values.events.filter(e => e.id !== eventId))
  }

  const updateEvent = (eventId: string, field: keyof Event, value: any) => {
    const updatedEvents = form.values.events.map(event =>
      event.id === eventId ? { ...event, [field]: value } : event
    )
    form.setFieldValue('events', updatedEvents)
  }

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    try {
      // Create the group first
      const groupResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          location: values.location,
          maxMembers: values.maxMembers ? parseInt(values.maxMembers) : undefined,
          groupType: values.groupType,
        }),
      })

      if (!groupResponse.ok) {
        throw new Error('Failed to create group')
      }

      const { group } = await groupResponse.json()

      // Create events for the group
      if (values.groupType === 'RECURRING_GROUP' && values.events.length > 0) {
        for (const event of values.events) {
          // Create a sample date for this week (we'll use next occurrence of the weekday)
          const now = new Date()
          const dayOfWeek = parseInt(event.weekDay.toString())
          const daysUntilEvent = (dayOfWeek + 7 - now.getDay()) % 7
          const eventDate = new Date(now)
          eventDate.setDate(now.getDate() + (daysUntilEvent === 0 ? 7 : daysUntilEvent))

          // Set the time
          const [startHour, startMinute] = event.startTime.split(':').map(Number)
          const [endHour, endMinute] = event.endTime.split(':').map(Number)

          const startDateTime = new Date(eventDate)
          startDateTime.setHours(startHour, startMinute, 0, 0)

          const endDateTime = new Date(eventDate)
          endDateTime.setHours(endHour, endMinute, 0, 0)

          await fetch(`/api/groups/${group.id}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: event.title || undefined,
              startDateTime: startDateTime.toISOString(),
              endDateTime: endDateTime.toISOString(),
              weekDay: dayOfWeek,
              eventType: event.eventType,
            }),
          })
        }
      } else if (values.groupType === 'SINGLE_EVENT' && values.singleEventDate) {
        // Create a single event
        await fetch(`/api/groups/${group.id}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDateTime: values.singleEventDate.toISOString(),
            endDateTime: values.singleEventEndDate?.toISOString(),
            isAllDay: values.singleEventAllDay,
            eventType: 'SPECIAL',
          }),
        })
      }

      notifications.show({
        title: 'Success!',
        message: `${values.groupType === 'SINGLE_EVENT' ? 'Event' : 'Group'} created successfully`,
        color: 'green',
      })

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

  if (status === 'loading') {
    return (
      <Container>
        <Header />
        <Center style={{ height: '50vh' }}>
          <Loader size="lg" />
        </Center>
      </Container>
    )
  }

  const nextStep = () => setActiveStep((current) => Math.min(current + 1, 2))
  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0))

  return (
    <Container size="md">
      <Header />

      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group>
            <ActionIcon variant="subtle" component={Link} href="/activities">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>Create Group</Title>
          </Group>
        </Group>

        {/* Wizard */}
        <Paper withBorder p="lg" radius="md">
          <Stepper active={activeStep} allowNextStepsSelect={false}>
            <Stepper.Step
              label="Basic Information"
              description="Group details"
              icon={<IconUsers size={18} />}
            >
              <Stack gap="md">
                <Text c="dimmed">Tell us about your group or event</Text>

                <TextInput
                  label="Group/Event Title"
                  placeholder="e.g., Hamlet Rehearsals, Morning Yoga, Weekly Football"
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

            <Stepper.Step
              label="Type & Schedule"
              description="When does it happen"
              icon={<IconCalendar size={18} />}
            >
              <Stack gap="md">
                <Text c="dimmed">Choose how your group is organized</Text>

                <Select
                  label="Group Type"
                  data={[
                    { value: 'SINGLE_EVENT', label: '🎯 Single Event - One-time activity' },
                    { value: 'RECURRING_GROUP', label: '🔄 Recurring Group - Regular meetups' }
                  ]}
                  {...form.getInputProps('groupType')}
                />

                {form.values.groupType === 'SINGLE_EVENT' && (
                  <Stack gap="md" p="md" style={{ background: 'var(--mantine-color-blue-0)', borderRadius: 'var(--mantine-radius-md)' }}>
                    <Text fw={500}>Single Event Details</Text>

                    <Group grow>
                      <DateTimePicker
                        label="Event Date & Time"
                        placeholder="When does it start?"
                        minDate={new Date()}
                        required
                        {...form.getInputProps('singleEventDate')}
                      />

                      {!form.values.singleEventAllDay && (
                        <DateTimePicker
                          label="End Date & Time"
                          placeholder="When does it end?"
                          minDate={form.values.singleEventDate || new Date()}
                          {...form.getInputProps('singleEventEndDate')}
                        />
                      )}
                    </Group>

                    <Checkbox
                      label="All-day event"
                      {...form.getInputProps('singleEventAllDay', { type: 'checkbox' })}
                    />
                  </Stack>
                )}

                {form.values.groupType === 'RECURRING_GROUP' && (
                  <Stack gap="md" p="md" style={{ background: 'var(--mantine-color-green-0)', borderRadius: 'var(--mantine-radius-md)' }}>
                    <Group justify="space-between">
                      <Text fw={500}>Regular Events Schedule</Text>
                      <Button leftSection={<IconPlus size={16} />} variant="light" onClick={addEvent}>
                        Add Event
                      </Button>
                    </Group>

                    <Text size="sm" c="dimmed">
                      Add regular events like "Monday rehearsals" or "Friday matches"
                    </Text>

                    {form.values.events.map((event, index) => (
                      <Paper key={event.id} withBorder p="md">
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" fw={500}>Event #{index + 1}</Text>
                          <ActionIcon color="red" variant="subtle" onClick={() => removeEvent(event.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>

                        <Group grow>
                          <TextInput
                            label="Event Name (optional)"
                            placeholder="e.g., Rehearsal, Training, Class"
                            value={event.title}
                            onChange={(e) => updateEvent(event.id, 'title', e.target.value)}
                          />

                          <Select
                            label="Day of Week"
                            data={WEEKDAYS}
                            value={event.weekDay.toString()}
                            onChange={(value) => updateEvent(event.id, 'weekDay', parseInt(value || '1'))}
                          />
                        </Group>

                        <Group grow mt="xs">
                          <TextInput
                            label="Start Time"
                            type="time"
                            value={event.startTime}
                            onChange={(e) => updateEvent(event.id, 'startTime', e.target.value)}
                          />

                          <TextInput
                            label="End Time"
                            type="time"
                            value={event.endTime}
                            onChange={(e) => updateEvent(event.id, 'endTime', e.target.value)}
                          />
                        </Group>
                      </Paper>
                    ))}

                    {form.values.events.length === 0 && (
                      <Alert variant="light" color="blue">
                        <Text size="sm">
                          Click "Add Event" to create your first regular event. For example:
                          <List size="sm" mt="xs">
                            <List.Item>Monday 18:00-20:00 (Rehearsal)</List.Item>
                            <List.Item>Friday 20:00-22:00 (Performance)</List.Item>
                          </List>
                        </Text>
                      </Alert>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stepper.Step>

            <Stepper.Step
              label="Review & Create"
              description="Final confirmation"
              icon={<IconCheck size={18} />}
            >
              <Stack gap="md">
                <Text c="dimmed">Review your group details</Text>

                <Paper withBorder p="md">
                  <Stack gap="xs">
                    <Group>
                      <ThemeIcon variant="light" color="blue">
                        <IconUsers size={16} />
                      </ThemeIcon>
                      <Text fw={500}>{form.values.title}</Text>
                      <Badge variant="light" color={form.values.groupType === 'SINGLE_EVENT' ? 'orange' : 'green'}>
                        {form.values.groupType === 'SINGLE_EVENT' ? 'Single Event' : 'Recurring Group'}
                      </Badge>
                    </Group>

                    {form.values.description && (
                      <Text size="sm" c="dimmed" ml={36}>{form.values.description}</Text>
                    )}

                    <Group ml={36} gap="lg">
                      <Group gap="xs">
                        <ThemeIcon size="sm" variant="subtle" color="gray">
                          <IconMapPin size={12} />
                        </ThemeIcon>
                        <Text size="sm">{form.values.location}</Text>
                      </Group>

                      {form.values.maxMembers && (
                        <Group gap="xs">
                          <ThemeIcon size="sm" variant="subtle" color="gray">
                            <IconUsers size={12} />
                          </ThemeIcon>
                          <Text size="sm">Max {form.values.maxMembers} members</Text>
                        </Group>
                      )}
                    </Group>
                  </Stack>
                </Paper>

                {form.values.groupType === 'RECURRING_GROUP' && form.values.events.length > 0 && (
                  <Paper withBorder p="md">
                    <Text fw={500} mb="xs">Regular Events:</Text>
                    <Stack gap="xs">
                      {form.values.events.map((event, index) => (
                        <Group key={event.id} gap="xs" ml="md">
                          <ThemeIcon size="sm" variant="subtle" color="green">
                            <IconClock size={12} />
                          </ThemeIcon>
                          <Text size="sm">
                            {WEEKDAYS.find(d => d.value === event.weekDay.toString())?.label} {event.startTime}-{event.endTime}
                            {event.title && ` (${event.title})`}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Paper>
                )}

                {form.values.groupType === 'SINGLE_EVENT' && form.values.singleEventDate && (
                  <Paper withBorder p="md">
                    <Text fw={500} mb="xs">Event Schedule:</Text>
                    <Group gap="xs" ml="md">
                      <ThemeIcon size="sm" variant="subtle" color="orange">
                        <IconCalendar size={12} />
                      </ThemeIcon>
                      <Text size="sm">
                        {form.values.singleEventDate.toLocaleDateString()}
                        {!form.values.singleEventAllDay && ` ${form.values.singleEventDate.toLocaleTimeString()}`}
                        {form.values.singleEventEndDate && !form.values.singleEventAllDay &&
                          ` - ${form.values.singleEventEndDate.toLocaleTimeString()}`}
                        {form.values.singleEventAllDay && ' (All day)'}
                      </Text>
                    </Group>
                  </Paper>
                )}
              </Stack>
            </Stepper.Step>
          </Stepper>

          <Group justify="space-between" mt="xl">
            <Button variant="default" onClick={prevStep} disabled={activeStep === 0}>
              Previous
            </Button>

            {activeStep < 2 ? (
              <Button onClick={nextStep} disabled={
                activeStep === 0 ? (!form.values.title || !form.values.location) :
                activeStep === 1 ? (
                  form.values.groupType === 'SINGLE_EVENT' ? !form.values.singleEventDate :
                  form.values.groupType === 'RECURRING_GROUP' ? form.values.events.length === 0 :
                  false
                ) : false
              }>
                Next
              </Button>
            ) : (
              <Button
                onClick={() => form.onSubmit(handleSubmit)()}
                loading={loading}
                leftSection={<IconCheck size={16} />}
              >
                Create {form.values.groupType === 'SINGLE_EVENT' ? 'Event' : 'Group'}
              </Button>
            )}
          </Group>
        </Paper>
      </Stack>
    </Container>
  )
}