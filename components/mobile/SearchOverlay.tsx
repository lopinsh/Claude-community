'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, TextInput, Stack, Text, Group, Badge, Paper, Box, ScrollArea, Loader, ActionIcon, Combobox, useCombobox, Pill, PillsInput, CheckIcon, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconX, IconClock, IconMapPin, IconUsers, IconCalendar, IconBrain, IconHeart, IconUsersGroup, IconTheater, IconBuilding, IconTool } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useCategories, normalizeCategoryName } from '@/hooks/useCategories';

interface SearchResult {
  type: 'group' | 'event';
  id: string;
  title: string;
  description?: string | null;
  location: string;
  tags?: Array<{ tag: { name: string; level: number } }>;
  _count?: {
    applications?: number;
    attendees?: number;
  };
  startDateTime?: string;
}

interface SearchOverlayProps {
  opened: boolean;
  onClose: () => void;
}

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'recent-searches';

export default function SearchOverlay({ opened, onClose }: SearchOverlayProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();

  // Fetch L1 categories from database (single source of truth)
  const { categories: level1Categories } = useCategories();

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevel2, setSelectedLevel2] = useState<string[]>([]);
  const [selectedLevel3, setSelectedLevel3] = useState<string[]>([]);
  const [level2Categories, setLevel2Categories] = useState<any[]>([]);
  const [level3Categories, setLevel3Categories] = useState<any[]>([]);

  // Combobox state
  const [level1SearchValue, setLevel1SearchValue] = useState('');
  const [level2SearchValue, setLevel2SearchValue] = useState('');
  const [level3SearchValue, setLevel3SearchValue] = useState('');
  const comboboxLevel1 = useCombobox({
    onDropdownClose: () => comboboxLevel1.resetSelectedOption(),
    onDropdownOpen: () => comboboxLevel1.updateSelectedOptionIndex('active'),
  });
  const comboboxLevel2 = useCombobox({
    onDropdownClose: () => comboboxLevel2.resetSelectedOption(),
    onDropdownOpen: () => comboboxLevel2.updateSelectedOptionIndex('active'),
  });
  const comboboxLevel3 = useCombobox({
    onDropdownClose: () => comboboxLevel3.resetSelectedOption(),
    onDropdownOpen: () => comboboxLevel3.updateSelectedOptionIndex('active'),
  });

  // Helper function: Get icon component from string name
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      IconBrain,
      IconHeart,
      IconUsersGroup,
      IconTheater,
      IconBuilding,
      IconTool,
    };
    return icons[iconName] || IconBrain;
  };

  // Helper function: Filter tags by search value
  const filterTags = (tags: any[], searchValue: string) => {
    if (!searchValue) return tags;
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  // Helper function: Group Level 2 tags by their Level 1 parent
  const groupLevel2ByParent = () => {
    const grouped: Record<string, any[]> = {};
    level2Categories.forEach(tag => {
      const parentName = tag.parent?.name || 'Other';
      if (!grouped[parentName]) grouped[parentName] = [];
      grouped[parentName].push(tag);
    });
    return grouped;
  };

  // Helper function: Group Level 3 tags by their Level 2 parent
  const groupLevel3ByParent = () => {
    const grouped: Record<string, any[]> = {};
    level3Categories.forEach(tag => {
      const parentName = tag.parent?.name || 'Other';
      if (!grouped[parentName]) grouped[parentName] = [];
      grouped[parentName].push(tag);
    });
    return grouped;
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const updated = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Fetch Level 2 categories when Level 1 selection changes
  useEffect(() => {
    const fetchLevel2Categories = async () => {
      if (selectedCategories.length === 0) {
        setLevel2Categories([]);
        setSelectedLevel2([]);
        setLevel3Categories([]);
        setSelectedLevel3([]);
        return;
      }

      try {
        const response = await fetch(`/api/tags/level2?level1=${selectedCategories.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          setLevel2Categories(data.tags || []);
        }
      } catch (error) {
        console.error('Failed to fetch Level 2 categories:', error);
      }
    };

    fetchLevel2Categories();
  }, [selectedCategories]);

  // Fetch Level 3 categories when Level 2 selection changes
  useEffect(() => {
    const fetchLevel3Categories = async () => {
      if (selectedLevel2.length === 0) {
        setLevel3Categories([]);
        setSelectedLevel3([]);
        return;
      }

      try {
        const response = await fetch(`/api/tags/level3?level2=${selectedLevel2.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          setLevel3Categories(data.tags || []);
        }
      } catch (error) {
        console.error('Failed to fetch Level 3 categories:', error);
      }
    };

    fetchLevel3Categories();
  }, [selectedLevel2]);

  // Fetch search results
  const fetchResults = useCallback(async (searchQuery: string, cats: string[], l2: string[], l3: string[]) => {
    if (!searchQuery.trim() && cats.length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery);
      if (cats.length > 0) params.set('categories', cats.join(','));
      if (l2.length > 0) params.set('level2', l2.join(','));
      if (l3.length > 0) params.set('level3', l3.join(','));

      const response = await fetch(`/api/discover?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();

      // Combine groups and events into unified results
      const combined: SearchResult[] = [
        ...(data.groups || []).map((g: any) => ({ ...g, type: 'group' as const })),
        ...(data.publicEvents || []).map((e: any) => ({ ...e, type: 'event' as const })),
      ];

      setResults(combined);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger search when query or categories change
  useEffect(() => {
    fetchResults(debouncedQuery, selectedCategories, selectedLevel2, selectedLevel3);
  }, [debouncedQuery, selectedCategories, selectedLevel2, selectedLevel3, fetchResults]);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(result.title);
    onClose();

    if (result.type === 'group') {
      router.push(`/groups/${result.id}`);
    } else {
      router.push(`/events/${result.id}`);
    }
  };

  // Handle recent search click
  const handleRecentClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  // Handle category filter click
  const handleCategoryClick = (categoryValue: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryValue)
        ? prev.filter(c => c !== categoryValue)
        : [...prev, categoryValue]
    );
  };

  // Reset on close
  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedCategories([]);
    setSelectedLevel2([]);
    setSelectedLevel3([]);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: 'slide-up', duration: 300 }}
      styles={{
        body: {
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Search Header */}
      <Box
        p="md"
        style={{
          borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        }}
      >
        <Group gap="sm">
          <TextInput
            placeholder="Search groups and events..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={20} />}
            rightSection={
              query && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setQuery('')}
                  size="sm"
                >
                  <IconX size={16} />
                </ActionIcon>
              )
            }
            size="lg"
            radius="md"
            autoFocus
            style={{ flex: 1 }}
          />
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={handleClose}
          >
            <IconX size={20} />
          </ActionIcon>
        </Group>

        {/* Level 1 Categories - Searchable Combobox */}
        <Box mt="md">
          <Text size="xs" fw={600} c="dimmed" mb="xs">Main Categories</Text>
          <Combobox
            store={comboboxLevel1}
            onOptionSubmit={(val) => {
              setSelectedCategories((current) =>
                current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
              );
            }}
          >
            <Combobox.DropdownTarget>
              <PillsInput
                size="md"
                onClick={() => comboboxLevel1.openDropdown()}
              >
                <Pill.Group>
                  {selectedCategories.map((id) => {
                    const category = level1Categories.find(c => normalizeCategoryName(c.name) === id);
                    if (!category) return null;
                    const colorKey = category.colorKey || 'indigo';
                    const IconComponent = getIconComponent(category.iconName || '');
                    return (
                      <Pill
                        key={id}
                        withRemoveButton
                        onRemove={() => setSelectedCategories(selectedCategories.filter(v => v !== id))}
                        styles={{
                          root: {
                            backgroundColor: theme.colors[colorKey][6],
                            color: 'white',
                            fontWeight: 600,
                          },
                        }}
                      >
                        <Group gap={6}>
                          <IconComponent size={14} />
                          {category.name}
                        </Group>
                      </Pill>
                    );
                  })}
                  <Combobox.EventsTarget>
                    <PillsInput.Field
                      placeholder={selectedCategories.length === 0 ? "Search categories..." : ""}
                      value={level1SearchValue}
                      onChange={(e) => {
                        setLevel1SearchValue(e.currentTarget.value);
                        comboboxLevel1.updateSelectedOptionIndex();
                        comboboxLevel1.openDropdown();
                      }}
                      onFocus={() => comboboxLevel1.openDropdown()}
                      onBlur={() => {
                        comboboxLevel1.closeDropdown();
                        setLevel1SearchValue('');
                      }}
                    />
                  </Combobox.EventsTarget>
                </Pill.Group>
              </PillsInput>
            </Combobox.DropdownTarget>

            <Combobox.Dropdown>
              <Combobox.Options>
                <ScrollArea.Autosize mah={300} type="scroll">
                  {level1Categories
                    .filter(cat => !level1SearchValue || cat.name.toLowerCase().includes(level1SearchValue.toLowerCase()))
                    .map((category) => {
                      const normalizedValue = normalizeCategoryName(category.name);
                      const colorKey = category.colorKey || 'indigo';
                      const IconComponent = getIconComponent(category.iconName || '');
                      return (
                        <Combobox.Option value={normalizedValue} key={category.id} active={selectedCategories.includes(normalizedValue)}>
                          <Group gap="sm">
                            <Box
                              w={32}
                              h={32}
                              style={{
                                backgroundColor: theme.colors[colorKey][6],
                                borderRadius: theme.radius.sm,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <IconComponent size={18} color="white" />
                            </Box>
                            <Box style={{ flex: 1 }}>
                              <Text size="sm" fw={600}>{category.name}</Text>
                              <Text size="xs" c="dimmed">{category.description}</Text>
                            </Box>
                            {selectedCategories.includes(normalizedValue) && (
                              <CheckIcon size={16} color={theme.colors[colorKey][6]} />
                            )}
                          </Group>
                        </Combobox.Option>
                      );
                    })}
                </ScrollArea.Autosize>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </Box>

        {/* Level 2 Sub-Categories - Searchable Combobox */}
        {level2Categories.length > 0 && (
          <Box mt="sm">
            <Text size="xs" fw={600} c="dimmed" mb="xs">Domains</Text>
            <Combobox
              store={comboboxLevel2}
              onOptionSubmit={(val) => {
                setSelectedLevel2((current) =>
                  current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
                );
              }}
            >
              <Combobox.DropdownTarget>
                <PillsInput
                  size="sm"
                  onClick={() => comboboxLevel2.openDropdown()}
                >
                  <Pill.Group>
                    {selectedLevel2.map((id) => {
                      const tag = level2Categories.find(t => t.id === id);
                      if (!tag) return null;
                      return (
                        <Pill key={id} withRemoveButton onRemove={() => setSelectedLevel2(selectedLevel2.filter(v => v !== id))}>
                          {tag.name}
                        </Pill>
                      );
                    })}
                    <Combobox.EventsTarget>
                      <PillsInput.Field
                        placeholder={selectedLevel2.length === 0 ? "Search domains..." : ""}
                        value={level2SearchValue}
                        onChange={(e) => {
                          setLevel2SearchValue(e.currentTarget.value);
                          comboboxLevel2.updateSelectedOptionIndex();
                          comboboxLevel2.openDropdown();
                        }}
                        onFocus={() => comboboxLevel2.openDropdown()}
                        onBlur={() => {
                          comboboxLevel2.closeDropdown();
                          setLevel2SearchValue('');
                        }}
                      />
                    </Combobox.EventsTarget>
                  </Pill.Group>
                </PillsInput>
              </Combobox.DropdownTarget>

              <Combobox.Dropdown>
                <Combobox.Options>
                  <ScrollArea.Autosize mah={200} type="scroll">
                    {Object.entries(groupLevel2ByParent()).map(([parentName, tags]) => {
                      const filteredTags = filterTags(tags, level2SearchValue);
                      if (filteredTags.length === 0) return null;

                      return (
                        <Combobox.Group label={parentName} key={parentName}>
                          {filteredTags.map((tag) => (
                            <Combobox.Option value={tag.id} key={tag.id} active={selectedLevel2.includes(tag.id)}>
                              <Group gap="xs">
                                {selectedLevel2.includes(tag.id) && <CheckIcon size={12} />}
                                <span>{tag.name}</span>
                              </Group>
                            </Combobox.Option>
                          ))}
                        </Combobox.Group>
                      );
                    })}
                  </ScrollArea.Autosize>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
          </Box>
        )}

        {/* Level 3 Sub-Categories - Searchable Combobox */}
        {level3Categories.length > 0 && (
          <Box mt="sm">
            <Text size="xs" fw={600} c="dimmed" mb="xs">Specific</Text>
            <Combobox
              store={comboboxLevel3}
              onOptionSubmit={(val) => {
                setSelectedLevel3((current) =>
                  current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
                );
              }}
            >
              <Combobox.DropdownTarget>
                <PillsInput
                  size="sm"
                  onClick={() => comboboxLevel3.openDropdown()}
                >
                  <Pill.Group>
                    {selectedLevel3.map((id) => {
                      const tag = level3Categories.find(t => t.id === id);
                      if (!tag) return null;
                      return (
                        <Pill key={id} withRemoveButton onRemove={() => setSelectedLevel3(selectedLevel3.filter(v => v !== id))}>
                          {tag.name}
                        </Pill>
                      );
                    })}
                    <Combobox.EventsTarget>
                      <PillsInput.Field
                        placeholder={selectedLevel3.length === 0 ? "Search specific..." : ""}
                        value={level3SearchValue}
                        onChange={(e) => {
                          setLevel3SearchValue(e.currentTarget.value);
                          comboboxLevel3.updateSelectedOptionIndex();
                          comboboxLevel3.openDropdown();
                        }}
                        onFocus={() => comboboxLevel3.openDropdown()}
                        onBlur={() => {
                          comboboxLevel3.closeDropdown();
                          setLevel3SearchValue('');
                        }}
                      />
                    </Combobox.EventsTarget>
                  </Pill.Group>
                </PillsInput>
              </Combobox.DropdownTarget>

              <Combobox.Dropdown>
                <Combobox.Options>
                  <ScrollArea.Autosize mah={200} type="scroll">
                    {Object.entries(groupLevel3ByParent()).map(([parentName, tags]) => {
                      const filteredTags = filterTags(tags, level3SearchValue);
                      if (filteredTags.length === 0) return null;

                      return (
                        <Combobox.Group label={parentName} key={parentName}>
                          {filteredTags.map((tag) => (
                            <Combobox.Option value={tag.id} key={tag.id} active={selectedLevel3.includes(tag.id)}>
                              <Group gap="xs">
                                {selectedLevel3.includes(tag.id) && <CheckIcon size={12} />}
                                <span>{tag.name}</span>
                              </Group>
                            </Combobox.Option>
                          ))}
                        </Combobox.Group>
                      );
                    })}
                  </ScrollArea.Autosize>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
          </Box>
        )}
      </Box>

      {/* Search Results / Recent Searches */}
      <ScrollArea style={{ flex: 1 }} p="md">
        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="md" />
          </Group>
        ) : query.trim() || selectedCategories.length > 0 ? (
          <Stack gap="sm">
            {results.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No results found
              </Text>
            ) : (
              results.map((result) => (
                <Paper
                  key={`${result.type}-${result.id}`}
                  p="md"
                  withBorder
                  radius="md"
                  onClick={() => handleResultClick(result)}
                  style={{
                    cursor: 'pointer',
                    transition: theme.other.transition,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.categoryBlue[5];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3];
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Text fw={600} size="sm" lineClamp={1}>
                        {result.title}
                      </Text>
                      <Badge
                        size="sm"
                        variant="light"
                        color={result.type === 'group' ? 'categoryTeal' : 'categoryOrange'}
                      >
                        {result.type === 'group' ? 'Group' : 'Event'}
                      </Badge>
                    </Group>

                    {result.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {result.description}
                      </Text>
                    )}

                    <Group gap="md">
                      <Group gap={4}>
                        <IconMapPin size={14} color={theme.colors.gray[6]} />
                        <Text size="xs" c="dimmed">
                          {result.location}
                        </Text>
                      </Group>

                      {result.type === 'group' && result._count?.applications !== undefined && (
                        <Group gap={4}>
                          <IconUsers size={14} color={theme.colors.gray[6]} />
                          <Text size="xs" c="dimmed">
                            {result._count.applications} members
                          </Text>
                        </Group>
                      )}

                      {result.type === 'event' && result.startDateTime && (
                        <Group gap={4}>
                          <IconCalendar size={14} color={theme.colors.gray[6]} />
                          <Text size="xs" c="dimmed">
                            {new Date(result.startDateTime).toLocaleDateString()}
                          </Text>
                        </Group>
                      )}
                    </Group>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        ) : (
          // Recent Searches
          <Stack gap="md">
            {recentSearches.length > 0 && (
              <>
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="dimmed">
                    Recent Searches
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={clearRecentSearches}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>

                <Stack gap="xs">
                  {recentSearches.map((search, index) => (
                    <Paper
                      key={index}
                      p="sm"
                      withBorder
                      radius="md"
                      onClick={() => handleRecentClick(search)}
                      style={{
                        cursor: 'pointer',
                        transition: theme.other.transition,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Group gap="sm">
                        <IconClock size={16} color={theme.colors.gray[6]} />
                        <Text size="sm">{search}</Text>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}

            <Text size="sm" c="dimmed" ta="center" mt="xl">
              Start typing to search groups and events
            </Text>
          </Stack>
        )}
      </ScrollArea>
    </Modal>
  );
}
