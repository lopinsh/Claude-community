'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Text,
  Paper,
  Group,
  ThemeIcon,
  Badge,
  Select,
  Button,
  Alert,
  Loader,
  Center,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';

interface L1Category {
  id: string;
  name: string;
  colorKey: string;
  iconName: string;
  description: string | null;
}

interface L2Domain {
  id: string;
  name: string;
}

interface L2SelectionModalProps {
  opened: boolean;
  onClose: () => void;
  tagName: string;
  onSubmit: (l2TagId: string, l1Category: L1Category) => void;
}

export default function L2SelectionModal({
  opened,
  onClose,
  tagName,
  onSubmit,
}: L2SelectionModalProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [l1Categories, setL1Categories] = useState<L1Category[]>([]);
  const [l2Domains, setL2Domains] = useState<Record<string, L2Domain[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedL1, setSelectedL1] = useState<L1Category | null>(null);
  const [selectedL2, setSelectedL2] = useState<string | null>(null);

  // Fetch L1 categories and their L2 domains
  useEffect(() => {
    if (!opened) return;

    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch L1 categories
        const l1Response = await fetch('/api/tags?level=1');
        if (!l1Response.ok) throw new Error('Failed to fetch categories');
        const l1Data = await l1Response.json();
        setL1Categories(l1Data.tags);

        // Fetch all L2 domains grouped by L1
        const domainsMap: Record<string, L2Domain[]> = {};
        for (const l1 of l1Data.tags) {
          const l2Response = await fetch(`/api/tags?level=2&parentId=${l1.id}`);
          if (l2Response.ok) {
            const l2Data = await l2Response.json();
            domainsMap[l1.id] = l2Data.tags;
          }
        }
        setL2Domains(domainsMap);
      } catch (err: any) {
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [opened]);

  const handleL1Select = (category: L1Category) => {
    setSelectedL1(category);
    setSelectedL2(null); // Reset L2 selection
  };

  const handleSubmit = () => {
    if (!selectedL2 || !selectedL1) return;
    onSubmit(selectedL2, selectedL1);
  };

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    const Icon = (TablerIcons as any)[iconName] || TablerIcons.IconTag;
    return Icon;
  };

  if (loading) {
    return (
      <Modal opened={opened} onClose={onClose} title="Loading categories..." size="lg" centered>
        <Center p="xl">
          <Loader size="lg" />
        </Center>
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={4}>
          <Text fw={700} size="lg">
            Select category for "{tagName}"
          </Text>
          <Text size="sm" c="dimmed">
            Choose the best category and domain for this topic
          </Text>
        </Stack>
      }
      size="xl"
      centered
    >
      <Stack gap="lg">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        {/* Step 1: Select L1 Category */}
        <div>
          <Text size="sm" fw={600} mb="sm">
            1. Select main category:
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: theme.spacing.sm,
            }}
          >
            {l1Categories.map((category) => {
              const IconComponent = getIconComponent(category.iconName);
              const isSelected = selectedL1?.id === category.id;

              return (
                <Paper
                  key={category.id}
                  p="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    borderWidth: isSelected ? '2px' : '1px',
                    borderColor: isSelected
                      ? theme.colors[category.colorKey || 'gray'][5]
                      : undefined,
                    transition: theme.other.transition,
                    backgroundColor:
                      isSelected && colorScheme === 'dark'
                        ? theme.colors.dark[5]
                        : isSelected
                        ? theme.colors[category.colorKey || 'gray'][0]
                        : undefined,
                  }}
                  onClick={() => handleL1Select(category)}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <ThemeIcon
                        variant="light"
                        size="lg"
                        color={category.colorKey || 'gray'}
                      >
                        <IconComponent size={20} />
                      </ThemeIcon>
                      {isSelected && (
                        <IconCheck
                          size={20}
                          color={theme.colors[category.colorKey || 'gray'][5]}
                        />
                      )}
                    </Group>
                    <div>
                      <Text size="sm" fw={600}>
                        {category.name}
                      </Text>
                      {category.description && (
                        <Text size="xs" c="dimmed">
                          {category.description}
                        </Text>
                      )}
                    </div>
                  </Stack>
                </Paper>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select L2 Domain */}
        {selectedL1 && (
          <div>
            <Text size="sm" fw={600} mb="sm">
              2. Select specific domain:
            </Text>
            <Select
              placeholder="Choose domain..."
              data={
                l2Domains[selectedL1.id]?.map((domain) => ({
                  value: domain.id,
                  label: domain.name,
                })) || []
              }
              value={selectedL2}
              onChange={(value) => setSelectedL2(value)}
              searchable
              size="md"
              styles={{
                input: {
                  borderColor: theme.colors[selectedL1.colorKey || 'gray'][5],
                },
              }}
            />
          </div>
        )}

        {/* Preview */}
        {selectedL1 && selectedL2 && (
          <Paper p="md" withBorder bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}>
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" c="dimmed">
                New tag:
              </Text>
              <Badge
                variant="filled"
                color={selectedL1.colorKey || 'gray'}
                size="lg"
                leftSection={
                  <ThemeIcon size="xs" variant="transparent" color="white">
                    {(() => {
                      const Icon = getIconComponent(selectedL1.iconName);
                      return <Icon size={14} />;
                    })()}
                  </ThemeIcon>
                }
              >
                {selectedL1.name} &gt;{' '}
                {l2Domains[selectedL1.id]?.find((d) => d.id === selectedL2)?.name} &gt; {tagName}
              </Badge>
            </Group>
          </Paper>
        )}

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedL2}
            color={selectedL1?.colorKey || 'blue'}
            leftSection={<IconCheck size={16} />}
          >
            Create Tag
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
