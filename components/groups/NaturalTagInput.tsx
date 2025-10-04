'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  Loader,
  ActionIcon,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconPlus, IconX } from '@tabler/icons-react';

interface Tag {
  id: string;
  name: string;
  level: number;
  hierarchy?: {
    l1: {
      id?: string;
      name: string;
      colorKey?: string;
      iconName?: string;
      description?: string;
    };
    l2: {
      id: string;
      name: string;
    };
    l3: {
      id: string;
      name: string;
    };
    path: string;
    colorKey: string;
  };
}

interface NaturalTagInputProps {
  value: string;
  onChange: (value: string) => void;
  onTagSelect: (tag: Tag | null) => void;
  onCreateNew: (searchTerm: string) => void;
  placeholder?: string;
}

export default function NaturalTagInput({
  value,
  onChange,
  onTagSelect,
  onCreateNew,
  placeholder = "What's your group about? (e.g., 'Urban Foraging', 'Chess Club')",
}: NaturalTagInputProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [debouncedValue] = useDebouncedValue(value, 300);

  // Fuzzy search for existing L3 tags
  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `/api/tags/search?q=${encodeURIComponent(debouncedValue)}&level=3&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.tags || []);
        }
      } catch (error) {
        console.error('Error searching tags:', error);
      } finally {
        setSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue]);

  const handleSelectSuggestion = (tag: Tag) => {
    onChange(tag.name);
    onTagSelect(tag);
    setSuggestions([]);
  };

  const handleCreateNew = () => {
    if (!value.trim()) return;
    onCreateNew(value.trim());
    setSuggestions([]);
  };

  return (
    <Stack gap="sm">
      <TextInput
        value={value}
        onChange={(e) => {
          onChange(e.currentTarget.value);
          onTagSelect(null); // Clear selection when typing
        }}
        placeholder={placeholder}
        size="lg"
        leftSection={searching ? <Loader size="xs" /> : <IconSearch size={20} />}
        rightSection={
          value ? (
            <ActionIcon
              variant="subtle"
              onClick={() => {
                onChange('');
                onTagSelect(null);
                setSuggestions([]);
              }}
            >
              <IconX size={16} />
            </ActionIcon>
          ) : null
        }
        styles={{
          input: {
            fontSize: theme.fontSizes.md,
            fontWeight: 500,
          },
        }}
      />

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <Paper
          p="xs"
          withBorder
          shadow="sm"
          style={{
            position: 'relative',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <Stack gap="xs">
            <Text size="xs" c="dimmed" fw={600}>
              Existing topics:
            </Text>
            {suggestions.map((tag) => (
              <Paper
                key={tag.id}
                p="sm"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: theme.other.transition,
                  backgroundColor:
                    colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0];
                }}
                onClick={() => handleSelectSuggestion(tag)}
              >
                <Stack gap={4}>
                  {/* Tag name */}
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      {tag.name}
                    </Text>
                    <Badge size="xs" variant="light" color="blue">
                      Use this
                    </Badge>
                  </Group>

                  {/* Hierarchical path */}
                  {tag.hierarchy && (
                    <Group gap={4}>
                      <Badge
                        size="xs"
                        variant="light"
                        color={tag.hierarchy.colorKey}
                        styles={{
                          label: {
                            textTransform: 'none',
                          },
                        }}
                      >
                        {tag.hierarchy.l1.name}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        &gt;
                      </Text>
                      <Text size="xs" c="dimmed">
                        {tag.hierarchy.l2.name}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Create new option */}
      {value.trim() && suggestions.length === 0 && !searching && (
        <Paper
          p="md"
          withBorder
          style={{
            borderStyle: 'dashed',
            backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          }}
        >
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={600} c="dimmed">
                "{value}" isn't an existing topic
              </Text>
              <Text size="xs" c="dimmed">
                Create it by selecting a category
              </Text>
            </div>
            <ActionIcon
              variant="filled"
              color="green"
              size="lg"
              onClick={handleCreateNew}
              title="Create new topic"
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}
