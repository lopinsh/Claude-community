'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Alert,
  Center,
  ActionIcon,
  Flex
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Header from '@/components/layout/Header';

const ACTIVITY_TYPES = [
  { value: 'choir', label: '🎵 Choir' },
  { value: 'folk-dance', label: '💃 Folk Dancing' },
  { value: 'workout', label: '💪 Workout Partner' },
  { value: 'language', label: '💬 Language Practice' },
  { value: 'cultural', label: '🎭 Cultural Event' },
  { value: 'other', label: '📋 Other' },
];

export default function CreateActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      type: '',
      location: '',
      maxMembers: null as number | null,
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      type: (value) => (!value ? 'Activity type is required' : null),
      location: (value) => (!value ? 'Location is required' : null),
    },
  });

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <Center style={{ minHeight: '50vh' }}>
          <Text>Loading...</Text>
        </Center>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <Center style={{ minHeight: '50vh' }}>
          <Stack align="center">
            <Title order={2}>Sign in required</Title>
            <Link href="/auth/signin" style={{ textDecoration: 'none' }}>
              <Button>Sign in to create activities</Button>
            </Link>
          </Stack>
        </Center>
      </div>
    );
  }

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Success!',
          message: 'Activity created successfully',
          color: 'green',
        });
        router.push('/activities');
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to create activity',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      <Header />

      <Container size="md" py="xl">
        <Card shadow="lg" radius="lg" p="xl">
          <Stack gap="lg">
            <div>
              <Flex align="center" gap="md" mb="sm">
                <ActionIcon 
                  component={Link}
                  href="/activities" 
                  variant="subtle" 
                  size="lg"
                  color="blue"
                >
                  ←
                </ActionIcon>
                <Title order={1}>Create New Activity</Title>
              </Flex>
              <Text c="dimmed">
                Start a new community activity and bring people together
              </Text>
            </div>
            
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Activity Title"
                  placeholder="e.g., Riga Folk Dance Group"
                  size="md"
                  {...form.getInputProps('title')}
                  required
                />

                <Select
                  label="Activity Type"
                  placeholder="Select activity type"
                  data={ACTIVITY_TYPES}
                  size="md"
                  {...form.getInputProps('type')}
                  required
                />

                <TextInput
                  label="Location"
                  placeholder="e.g., Riga, Old Town Community Center"
                  size="md"
                  {...form.getInputProps('location')}
                  required
                />

                <NumberInput
                  label="Maximum Members (optional)"
                  placeholder="Leave empty for unlimited"
                  min={1}
                  size="md"
                  {...form.getInputProps('maxMembers')}
                />

                <Textarea
                  label="Description"
                  placeholder="Tell people about your activity, when you meet, what experience level you're looking for..."
                  minRows={4}
                  size="md"
                  {...form.getInputProps('description')}
                />

                <Group justify="flex-end" mt="xl">
                  <Button
                    component={Link}
                    href="/activities"
                    variant="outline"
                    size="md"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    loading={loading}
                    size="md"
                    leftSection="+"
                  >
                    Create Activity
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Container>
    </div>
  );
}