// app/activities/create/page.tsx
"use client"; // <--- ADD THIS DIRECTIVE

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Header from '@/components/layout/Header';
import { IconArrowLeft } from '@tabler/icons-react';

interface Tag {
    id: string;
    name: string;
    level: number;
}

export default function CreateActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for tags fetched from the API
  const [level1Tags, setLevel1Tags] = useState<Tag[]>([]);
  const [level2Tags, setLevel2Tags] = useState<Tag[]>([]);
  const [level3Tags, setLevel3Tags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // --- Form Initialization ---
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      type: 'Other', // Default value
      location: '',
      maxMembers: null as number | null,
      level1Tag: '', // Required
      level2Tag: '', // Optional
      level3Tag: '', // Optional
    },
    validate: {
      title: (value) => (value.trim().length < 3 ? 'Title must be at least 3 characters' : null),
      location: (value) => (value.trim().length < 3 ? 'Location must be provided' : null),
      // Validation remains: Level 1 tag is mandatory
      level1Tag: (value) => (!value ? 'A Level 1 category is required for discoverability' : null),
    },
  });


  // Redirect if not authenticated (or if status is still loading)
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin?callbackUrl=/activities/create');
    }
  }, [session, status, router]);

// --- Initial Fetch: Level 1 Tags ---
useEffect(() => {
    if (session) {
        const fetchLevel1Tags = async () => {
            try {
                const response = await fetch('/api/tags?level=1');
                
                if (response.ok) {
                    const data = await response.json();
                    setLevel1Tags(data);
                } else {
                    // Log the non-OK status and response body
                    const errorBody = await response.text();
                    console.error(`L1 Tag fetch failed: Status ${response.status}`, errorBody);
                    notifications.show({
                        title: 'Tag Fetch Error',
                        message: `Failed to load categories. Status: ${response.status}. Check console for details.`,
                        color: 'red',
                    });
                }
            } catch (error) {
                console.error('L1 Tag network error:', error);
            } finally {
                setLoadingTags(false);
            }
        };
        fetchLevel1Tags();
    }
}, [session]);

  // --- Dynamic Fetch: Level 2 Tags (based on L1 selection) ---
  useEffect(() => {
    setLevel2Tags([]); // Clear previous L2 options
    form.setFieldValue('level2Tag', ''); // Clear form value

    if (form.values.level1Tag) {
        const fetchLevel2Tags = async () => {
            try {
                // Fetch children of the selected L1 tag
                const response = await fetch(`/api/tags?parentId=${form.values.level1Tag}`);
                if (response.ok) {
                    const data: Tag[] = await response.json();
                    // L2 tags have level 2. We filter here, though the API is designed to return only children.
                    setLevel2Tags(data.filter(t => t.level === 2)); 
                }
            } catch (error) {
                console.error('L2 Tag fetch error:', error);
            }
        };
        fetchLevel2Tags();
    }
  }, [form.values.level1Tag]); // Dependency: L1 selection

  // --- Dynamic Fetch: Level 3 Tags (based on L2 selection) ---
  useEffect(() => {
    setLevel3Tags([]); // Clear previous L3 options
    form.setFieldValue('level3Tag', ''); // Clear form value

    if (form.values.level2Tag) {
        const fetchLevel3Tags = async () => {
            try {
                // Fetch children of the selected L2 tag
                const response = await fetch(`/api/tags?parentId=${form.values.level2Tag}`);
                if (response.ok) {
                    const data: Tag[] = await response.json();
                    // L3 tags have level 3. We filter here.
                    setLevel3Tags(data.filter(t => t.level === 3)); 
                }
            } catch (error) {
                console.error('L3 Tag fetch error:', error);
            }
        };
        fetchLevel3Tags();
    }
  }, [form.values.level2Tag]); // Dependency: L2 selection
  
  // --- Submission Handler ---
  const handleSubmit = async (values: typeof form.values) => {
    // 1. Compile all selected tags into a single array of IDs
    const tagIds: string[] = [];
    if (values.level1Tag) tagIds.push(values.level1Tag);
    if (values.level2Tag) tagIds.push(values.level2Tag);
    if (values.level3Tag) tagIds.push(values.level3Tag);

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          maxMembers: values.maxMembers || null,
          // 2. Pass the compiled tag IDs to the API
          tagIds: tagIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        notifications.show({
          title: 'Creation Failed',
          message: errorData.error || 'An unexpected error occurred.',
          color: 'red',
        });
        return;
      }

      const activity = await response.json();
      notifications.show({
        title: 'Activity Created!',
        message: `Your activity "${activity.title}" is now live.`,
        color: 'green',
      });
      router.push(`/activities/${activity.id}/manage`);
    } catch (error) {
      console.error('Submission error:', error);
      notifications.show({
        title: 'Error',
        message: 'Could not connect to the server.',
        color: 'red',
      });
    }
  };

  const level1Options = level1Tags.map(t => ({ value: t.id, label: t.name }));
  const level2Options = level2Tags.map(t => ({ value: t.id, label: t.name }));
  const level3Options = level3Tags.map(t => ({ value: t.id, label: t.name }));

  if (status === 'loading' || loadingTags) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  if (level1Tags.length === 0) {
    return (
      <Container size="sm" pt="xl">
        <Header />
        <Stack gap="lg" mt="lg">
            <Title order={1}>Create New Activity</Title>
            <Alert color="red" title="Missing Tags">
                No Level 1 tags are available. You need to seed the database with at least one Level 1 Tag to start creating activities.
                Use `npx prisma studio` to add tags and define their relationships.
            </Alert>
            <Button component={Link} href="/activities" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
                Back to Activities
            </Button>
        </Stack>
      </Container>
    );
  }


  return (
    <Container size="sm" pt="xl">
      <Header />
      <Stack gap="lg" mt="lg">
        <Group justify="space-between">
          <Title order={1}>Create New Activity</Title>
          <Button component={Link} href="/activities" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
            Back to Activities
          </Button>
        </Group>

        <Card withBorder shadow="sm" padding="lg" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Activity Title"
                placeholder="E.g., Weekly Board Game Night"
                required
                {...form.getInputProps('title')}
              />

              <Textarea
                label="Description"
                placeholder="What will you be doing, and who is it for?"
                minRows={3}
                {...form.getInputProps('description')}
              />

              <TextInput
                label="Location"
                placeholder="E.g., The Community Center or 'Online'"
                required
                {...form.getInputProps('location')}
              />

              <Group grow>
                <Select
                  label="Activity Type"
                  placeholder="Select one"
                  data={[
                    { value: 'Online', label: 'Online' },
                    { value: 'In-Person', label: 'In-Person' },
                    { value: 'Hybrid', label: 'Hybrid' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  required
                  {...form.getInputProps('type')}
                />
                <NumberInput
                  label="Maximum Members (Optional)"
                  placeholder="E.g., 10"
                  min={2}
                  max={100}
                  {...form.getInputProps('maxMembers')}
                />
              </Group>

              {/* --- NEW SEPARATED TAG FIELDS --- */}
              <Title order={3} mt="sm">Categorization (Tags)</Title>
              <Select
                label="Level 1: Broad Category (Required)"
                placeholder="Select a primary category (e.g., Cultural, Physical)"
                data={level1Options}
                required
                {...form.getInputProps('level1Tag')}
                onChange={(value) => {
                  form.setFieldValue('level1Tag', value || '');
                  // Clear lower levels when L1 changes
                  form.setFieldValue('level2Tag', '');
                  form.setFieldValue('level3Tag', '');
                }}
              />

              <Select
                label="Level 2: Specific Type (Optional)"
                placeholder="Select a specific type (e.g., Folk Dance, Board Games)"
                data={level2Options}
                disabled={!form.values.level1Tag || level2Options.length === 0}
                clearable
                {...form.getInputProps('level2Tag')}
                onChange={(value) => {
                  form.setFieldValue('level2Tag', value || '');
                  // Clear Level 3 when L2 changes
                  form.setFieldValue('level3Tag', '');
                }}
              />

              <Select
                label="Level 3: Attributes (Optional)"
                placeholder="Select attributes (e.g., Beginner-Friendly, Weekly)"
                data={level3Options}
                disabled={!form.values.level2Tag || level3Options.length === 0}
                clearable
                {...form.getInputProps('level3Tag')}
              />
              {/* --- END NEW SEPARATED TAG FIELDS --- */}

              <Button type="submit" mt="md" size="lg" disabled={!session}>
                Create Activity
              </Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}