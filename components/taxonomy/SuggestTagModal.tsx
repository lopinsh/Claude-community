'use client';

import { useState, useEffect } from 'react';
import { Modal, TextInput, Stack, Button, Text, Alert, MultiSelect } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';

interface TagNode {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  children?: TagNode[];
}

interface SuggestTagModalProps {
  opened: boolean;
  onClose: () => void;
  parentTag?: TagNode | null;
  allLevel2Tags?: TagNode[];
}

export default function SuggestTagModal({
  opened,
  onClose,
  parentTag,
  allLevel2Tags = [],
}: SuggestTagModalProps) {
  const { data: session } = useSession();
  const [nameEn, setNameEn] = useState('');
  const [nameLv, setNameLv] = useState('');
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(5);

  useEffect(() => {
    if (opened && session) {
      fetchPendingCount();
    }
  }, [opened, session]);

  useEffect(() => {
    if (parentTag && opened) {
      setSelectedParents([parentTag.id]);
    } else {
      setSelectedParents([]);
    }
  }, [parentTag, opened]);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('/api/tags/suggest/count');
      const data = await response.json();
      setPendingCount(data.count || 0);
      setRemainingSlots(Math.max(0, 5 - (data.count || 0)));
    } catch (error) {
      console.error('Failed to fetch pending count:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!session) {
      setError('You must be logged in to suggest tags');
      return;
    }

    if (!nameEn.trim() || !nameLv.trim()) {
      setError('Please provide both English and Latvian names');
      return;
    }

    if (selectedParents.length === 0) {
      setError('Please select at least one parent category');
      return;
    }

    if (remainingSlots <= 0) {
      setError('You have reached the maximum of 5 pending suggestions. Please wait for review.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/tags/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: nameEn.trim(),
          nameLv: nameLv.trim(),
          parentTagIds: selectedParents,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit suggestion');
      }

      setSuccess(true);
      setNameEn('');
      setNameLv('');
      setSelectedParents([]);
      setPendingCount(prev => prev + 1);
      setRemainingSlots(prev => Math.max(0, prev - 1));

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNameEn('');
    setNameLv('');
    setSelectedParents([]);
    setError(null);
    setSuccess(false);
    onClose();
  };

  // Convert level 2 tags to MultiSelect format
  const parentOptions = allLevel2Tags.map(tag => ({
    value: tag.id,
    label: tag.name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Suggest a New Tag"
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Info Alert */}
          <Alert color="blue" variant="light">
            <Text size="sm">
              Suggest a specific interest tag (Level 3). It will be reviewed by moderators before being added.
            </Text>
            <Text size="xs" c="dimmed" mt="xs">
              {remainingSlots > 0 ? (
                <>You can submit {remainingSlots} more suggestion{remainingSlots !== 1 ? 's' : ''}.</>
              ) : (
                <>You have reached the limit of 5 pending suggestions.</>
              )}
            </Text>
          </Alert>

          {/* Parent Category Selection */}
          <MultiSelect
            label="Parent Categories"
            description="Select one or more Level 2 categories this tag belongs to"
            placeholder="Select categories..."
            data={parentOptions}
            value={selectedParents}
            onChange={setSelectedParents}
            required
            searchable
            disabled={loading}
          />

          {/* English Name */}
          <TextInput
            label="Tag Name (English)"
            placeholder="e.g., Basketball"
            value={nameEn}
            onChange={(e) => setNameEn(e.currentTarget.value)}
            required
            disabled={loading}
          />

          {/* Latvian Name */}
          <TextInput
            label="Tag Name (Latvian)"
            placeholder="e.g., Basketbols"
            value={nameLv}
            onChange={(e) => setNameLv(e.currentTarget.value)}
            required
            disabled={loading}
          />

          {/* Error Alert */}
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert color="green" icon={<IconCheck size={16} />}>
              Tag suggestion submitted successfully! Awaiting moderation.
            </Alert>
          )}

          {/* Actions */}
          <Button
            type="submit"
            loading={loading}
            disabled={remainingSlots <= 0 || success}
            fullWidth
          >
            Submit Suggestion
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
