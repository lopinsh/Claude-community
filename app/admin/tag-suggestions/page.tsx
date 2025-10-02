'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Stack,
  Card,
  Text,
  Group,
  Badge,
  Button,
  Textarea,
  Select,
  Alert,
  Loader,
  Center,
} from '@mantine/core';
import { useSession } from 'next-auth/react';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface TagSuggestion {
  id: string;
  nameEn: string;
  nameLv: string;
  status: string;
  createdAt: string;
  suggestedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  parentTags: Array<{
    id: string;
    name: string;
  }>;
}

export default function AdminTagSuggestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchSuggestions();
    }
  }, [status, router]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tag-suggestions');

      if (response.status === 403) {
        setError('You do not have permission to access this page.');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setSuggestions(data.suggestions || []);
      } else {
        setError(data.error || 'Failed to fetch suggestions');
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setError('Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    suggestionId: string,
    action: 'approve' | 'deny' | 'merge',
    mergedIntoTagId?: string
  ) => {
    try {
      setProcessingId(suggestionId);
      setError(null);

      const response = await fetch(`/api/admin/tag-suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          moderatorNotes: moderatorNotes[suggestionId] || '',
          mergedIntoTagId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process suggestion');
      }

      // Remove the suggestion from the list
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));

      // Clear notes
      setModeratorNotes((prev) => {
        const { [suggestionId]: _, ...rest } = prev;
        return rest;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process suggestion');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error && suggestions.length === 0) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={1}>Tag Suggestions Moderation</Title>

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        {suggestions.length === 0 ? (
          <Card padding="xl" radius="md" withBorder>
            <Center>
              <Stack align="center" gap="sm">
                <IconCheck size={48} color="green" />
                <Text size="lg" fw={500}>
                  No pending suggestions
                </Text>
                <Text size="sm" c="dimmed">
                  All tag suggestions have been reviewed
                </Text>
              </Stack>
            </Center>
          </Card>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id} padding="lg" radius="md" withBorder>
              <Stack gap="md">
                {/* Header */}
                <Group justify="space-between">
                  <div>
                    <Text fw={700} size="lg">
                      {suggestion.nameEn}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {suggestion.nameLv} (Latvian)
                    </Text>
                  </div>
                  <Badge color="blue" variant="light">
                    Level 3
                  </Badge>
                </Group>

                {/* Parent Tags */}
                <div>
                  <Text size="sm" fw={600} mb="xs">
                    Parent Categories:
                  </Text>
                  <Group gap="xs">
                    {suggestion.parentTags.map((parent) => (
                      <Badge key={parent.id} variant="filled" color="gray">
                        {parent.name}
                      </Badge>
                    ))}
                  </Group>
                </div>

                {/* Suggested By */}
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    Suggested by:
                  </Text>
                  <Text size="sm" fw={500}>
                    {suggestion.suggestedBy.name || suggestion.suggestedBy.email}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(suggestion.createdAt).toLocaleDateString()}
                  </Text>
                </Group>

                {/* Moderator Notes */}
                <Textarea
                  label="Moderator Notes (optional)"
                  placeholder="Reason for denial, merge notes, etc."
                  value={moderatorNotes[suggestion.id] || ''}
                  onChange={(e) =>
                    setModeratorNotes((prev) => ({
                      ...prev,
                      [suggestion.id]: e.currentTarget.value,
                    }))
                  }
                  disabled={processingId === suggestion.id}
                  minRows={2}
                />

                {/* Actions */}
                <Group gap="sm">
                  <Button
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    onClick={() => handleAction(suggestion.id, 'approve')}
                    loading={processingId === suggestion.id}
                    disabled={processingId !== null && processingId !== suggestion.id}
                  >
                    Approve
                  </Button>
                  <Button
                    color="red"
                    variant="light"
                    leftSection={<IconX size={16} />}
                    onClick={() => handleAction(suggestion.id, 'deny')}
                    loading={processingId === suggestion.id}
                    disabled={processingId !== null && processingId !== suggestion.id}
                  >
                    Deny
                  </Button>
                  {/* TODO: Add merge functionality with tag selection */}
                </Group>
              </Stack>
            </Card>
          ))
        )}
      </Stack>
    </Container>
  );
}
