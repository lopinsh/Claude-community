'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Select,
  Switch,
  NumberInput,
  Text,
  Alert,
  Stepper,
  Checkbox,
  MultiSelect,
  Divider
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconCalendar, IconClock, IconMapPin, IconUsers, IconAlertCircle } from '@tabler/icons-react';

interface CreateEventModalProps {
  opened: boolean;
  onClose: () => void;
  groupId: string;
  groupTitle: string;
  groupLocation: string;
  onEventCreated?: () => void;
  editingEvent?: any;
}

interface EventFormData {
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date | null;
  isAllDay: boolean;
  eventType: string;
  visibility: string;
  requiresApproval: boolean;
  maxMembers: number | null;
  location: string;
  isRecurring: boolean;
  recurrencePattern: string;
  recurrenceEnd: Date | null;
  weekDays: number[];
  monthlyDay: number | null;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  endDateTime: null,
  isAllDay: false,
  eventType: 'REGULAR',
  visibility: 'PRIVATE',
  requiresApproval: false,
  maxMembers: null,
  location: '',
  isRecurring: false,
  recurrencePattern: 'ONCE',
  recurrenceEnd: null,
  weekDays: [],
  monthlyDay: null,
};

export default function CreateEventModal({
  opened,
  onClose,
  groupId,
  groupTitle,
  groupLocation,
  onEventCreated,
  editingEvent
}: CreateEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    ...initialFormData,
    location: groupLocation
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Populate form when editing
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        startDateTime: new Date(editingEvent.startDateTime),
        endDateTime: editingEvent.endDateTime ? new Date(editingEvent.endDateTime) : null,
        isAllDay: editingEvent.isAllDay,
        eventType: editingEvent.eventType,
        visibility: editingEvent.visibility,
        requiresApproval: editingEvent.requiresApproval,
        maxMembers: editingEvent.maxMembers,
        location: editingEvent.location || groupLocation,
        isRecurring: false, // For now, disable recurring for edits
        recurrencePattern: 'ONCE',
        recurrenceEnd: null,
        weekDays: [],
        monthlyDay: null,
      });
    } else {
      setFormData({ ...initialFormData, location: groupLocation });
    }
  }, [editingEvent, groupLocation]);

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        startDateTime: formData.startDateTime.toISOString(),
        endDateTime: formData.isAllDay ? undefined : formData.endDateTime?.toISOString(),
        isAllDay: formData.isAllDay,
        eventType: formData.eventType,
        visibility: formData.visibility,
        requiresApproval: formData.requiresApproval,
        maxMembers: formData.maxMembers || undefined,
        location: formData.location || undefined,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
        recurrenceEnd: formData.isRecurring ? formData.recurrenceEnd?.toISOString() : undefined,
        weekDays: formData.isRecurring && formData.recurrencePattern === 'WEEKLY' ? formData.weekDays : undefined,
        monthlyDay: formData.isRecurring && formData.recurrencePattern === 'MONTHLY' ? formData.monthlyDay : undefined,
      };

      const response = await fetch(
        editingEvent ? `/api/events/${editingEvent.id}` : `/api/groups/${groupId}/events`,
        {
          method: editingEvent ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      onEventCreated?.();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ ...initialFormData, location: groupLocation });
    setActiveStep(0);
    setError(null);
    onClose();
  };

  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return formData.title.trim().length > 0 && formData.startDateTime;
      case 1: // Settings
        return true;
      case 2: // Recurrence
        if (formData.isRecurring) {
          if (formData.recurrencePattern === 'WEEKLY') {
            return formData.weekDays.length > 0;
          }
          if (formData.recurrencePattern === 'MONTHLY') {
            return formData.monthlyDay !== null;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceedToNextStep()) {
      setActiveStep(current => current + 1);
    }
  };

  const prevStep = () => setActiveStep(current => current - 1);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={editingEvent ? `Edit Event` : `Create Event for ${groupTitle}`}
      size="lg"
      centered
      closeOnClickOutside={false}
    >
      <Stack gap="lg">
        <Stepper active={activeStep} allowNextStepsSelect={false}>
          <Stepper.Step label="Event Details" description="Basic event information">
            <Stack gap="md" pt="md">
              <TextInput
                label="Event Title"
                placeholder="Enter event title"
                required
                value={formData.title}
                onChange={(e) => updateFormData('title', e.currentTarget.value)}
                leftSection={<IconCalendar size={16} />}
              />

              <Textarea
                label="Description"
                placeholder="Describe what this event is about..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.currentTarget.value)}
                rows={3}
              />

              <Group grow>
                <DateTimePicker
                  label="Start Date & Time"
                  placeholder="Select start date and time"
                  required
                  value={formData.startDateTime}
                  onChange={(date) => updateFormData('startDateTime', date)}
                  leftSection={<IconClock size={16} />}
                  disabled={formData.isAllDay}
                />

                {!formData.isAllDay && (
                  <DateTimePicker
                    label="End Date & Time"
                    placeholder="Select end date and time (optional)"
                    value={formData.endDateTime}
                    onChange={(date) => updateFormData('endDateTime', date)}
                    leftSection={<IconClock size={16} />}
                    minDate={formData.startDateTime}
                  />
                )}
              </Group>

              <Switch
                label="All Day Event"
                description="Event runs for the entire day"
                checked={formData.isAllDay}
                onChange={(e) => {
                  const isAllDay = e.currentTarget.checked;
                  updateFormData('isAllDay', isAllDay);
                  if (isAllDay) {
                    updateFormData('endDateTime', null);
                  }
                }}
              />

              <TextInput
                label="Location"
                placeholder="Event location (leave blank to use group location)"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.currentTarget.value)}
                leftSection={<IconMapPin size={16} />}
              />
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Settings" description="Event configuration">
            <Stack gap="md" pt="md">
              <Select
                label="Event Type"
                data={[
                  { value: 'REGULAR', label: 'Regular Event' },
                  { value: 'SPECIAL', label: 'Special Event' },
                ]}
                value={formData.eventType}
                onChange={(value) => updateFormData('eventType', value)}
              />

              <Select
                label="Visibility"
                data={[
                  { value: 'PRIVATE', label: 'Private - Only group members can see' },
                  { value: 'PUBLIC', label: 'Public - Anyone can see' },
                ]}
                value={formData.visibility}
                onChange={(value) => updateFormData('visibility', value)}
              />

              {formData.visibility === 'PUBLIC' && (
                <Switch
                  label="Require Approval"
                  description="Non-members need approval to attend this public event"
                  checked={formData.requiresApproval}
                  onChange={(e) => updateFormData('requiresApproval', e.currentTarget.checked)}
                />
              )}

              <NumberInput
                label="Maximum Attendees"
                placeholder="Leave empty for no limit"
                value={formData.maxMembers || ''}
                onChange={(value) => updateFormData('maxMembers', value || null)}
                leftSection={<IconUsers size={16} />}
                min={1}
              />

              <Text size="sm" c="dimmed">
                Event will be created in the <strong>{groupTitle}</strong> group.
                {formData.location ? ` Location: ${formData.location}` : ` Using group location: ${groupLocation}`}
              </Text>
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Recurrence" description="Recurring event options">
            <Stack gap="md" pt="md">
              <Switch
                label="Recurring Event"
                description="Create a series of events with a regular schedule"
                checked={formData.isRecurring}
                onChange={(e) => updateFormData('isRecurring', e.currentTarget.checked)}
              />

              {formData.isRecurring && (
                <>
                  <Select
                    label="Recurrence Pattern"
                    data={[
                      { value: 'WEEKLY', label: 'Weekly' },
                      { value: 'MONTHLY', label: 'Monthly' },
                    ]}
                    value={formData.recurrencePattern}
                    onChange={(value) => updateFormData('recurrencePattern', value)}
                  />

                  {formData.recurrencePattern === 'WEEKLY' && (
                    <MultiSelect
                      label="Repeat on Days"
                      description="Select which days of the week to repeat"
                      data={[
                        { value: '0', label: 'Sunday' },
                        { value: '1', label: 'Monday' },
                        { value: '2', label: 'Tuesday' },
                        { value: '3', label: 'Wednesday' },
                        { value: '4', label: 'Thursday' },
                        { value: '5', label: 'Friday' },
                        { value: '6', label: 'Saturday' },
                      ]}
                      value={formData.weekDays.map(String)}
                      onChange={(values) => updateFormData('weekDays', values.map(Number))}
                    />
                  )}

                  {formData.recurrencePattern === 'MONTHLY' && (
                    <NumberInput
                      label="Day of Month"
                      description="Which day of the month (1-31)"
                      value={formData.monthlyDay || formData.startDateTime.getDate()}
                      onChange={(value) => updateFormData('monthlyDay', value)}
                      min={1}
                      max={31}
                    />
                  )}

                  <DateTimePicker
                    label="End Recurrence"
                    description="When should the recurring events stop?"
                    value={formData.recurrenceEnd}
                    onChange={(date) => updateFormData('recurrenceEnd', date)}
                    minDate={formData.startDateTime}
                  />
                </>
              )}
            </Stack>
          </Stepper.Step>

          <Stepper.Completed>
            <Stack gap="md" pt="md">
              <Text size="lg" fw={500}>Ready to create event!</Text>
              <Text size="sm" c="dimmed">
                Review your event details and click "Create Event" to finish.
              </Text>

              <Stack gap="xs" p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <Text fw={500}>{formData.title}</Text>
                {formData.description && <Text size="sm">{formData.description}</Text>}
                <Text size="sm" c="dimmed">
                  {formData.isAllDay
                    ? formData.startDateTime.toLocaleDateString()
                    : `${formData.startDateTime.toLocaleString()}${formData.endDateTime ? ` - ${formData.endDateTime.toLocaleString()}` : ''}`
                  }
                </Text>
                <Text size="sm" c="dimmed">
                  {formData.location || groupLocation} • {formData.eventType.toLowerCase()} event
                </Text>
              </Stack>
            </Stack>
          </Stepper.Completed>
        </Stepper>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        <Group justify="space-between">
          <Button
            variant="subtle"
            onClick={activeStep === 0 ? handleClose : prevStep}
            disabled={loading}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onClick={activeStep === 3 ? handleSubmit : nextStep}
            loading={loading}
            disabled={!canProceedToNextStep()}
          >
{activeStep === 3 ? (editingEvent ? 'Update Event' : 'Create Event') : 'Next'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}