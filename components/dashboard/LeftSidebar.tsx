import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Stack,
  TextInput,
  Select,
  Button,
  Title,
  Text,
  Badge,
  Group,
  Paper,
  Divider,
  Box,
  UnstyledButton,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
  useMantineColorScheme,
  Combobox,
  PillsInput,
  Pill,
  useCombobox,
  CheckIcon,
  ScrollArea
} from '@mantine/core';
import {
  IconSearch,
  IconPlus,
  IconMapPin,
  IconUsers,
  IconActivity,
  IconBrain,
  IconHeart,
  IconUsersGroup,
  IconTheater,
  IconBuilding,
  IconTool,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import { LATVIAN_CITIES } from '@/utils/tagUtils';
import { useCategories, normalizeCategoryName } from '@/hooks/useCategories';

interface LeftSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedLevel2: string[];
  onLevel2Change: (level2: string[]) => void;
  selectedLevel3: string[];
  onLevel3Change: (level3: string[]) => void;
  selectedLocation: string | null;
  onLocationChange: (location: string | null) => void;
  itemCount: number;
  totalMembers?: number;
  onCreateGroup: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function LeftSidebar({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  selectedLevel2,
  onLevel2Change,
  selectedLevel3,
  onLevel3Change,
  selectedLocation,
  onLocationChange,
  itemCount,
  totalMembers = 0,
  onCreateGroup,
  isCollapsed = false,
  onToggleCollapse
}: LeftSidebarProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { data: session } = useSession();

  // Fetch L1 categories from database (single source of truth)
  const { categories: level1Categories, loading: categoriesLoading } = useCategories();

  const [level2Categories, setLevel2Categories] = useState<any[]>([]);
  const [level3Categories, setLevel3Categories] = useState<any[]>([]);

  // Combobox state
  const [level2SearchValue, setLevel2SearchValue] = useState('');
  const [level3SearchValue, setLevel3SearchValue] = useState('');
  const comboboxLevel2 = useCombobox({
    onDropdownClose: () => comboboxLevel2.resetSelectedOption(),
    onDropdownOpen: () => comboboxLevel2.updateSelectedOptionIndex('active'),
  });
  const comboboxLevel3 = useCombobox({
    onDropdownClose: () => comboboxLevel3.resetSelectedOption(),
    onDropdownOpen: () => comboboxLevel3.updateSelectedOptionIndex('active'),
  });

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

  // Helper function: Filter tags by search query
  const filterTags = (tags: any[], searchQuery: string) => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.toLowerCase();
    return tags.filter(tag => tag.name.toLowerCase().includes(query));
  };

  // Get Level 1 color for current selection
  const getLevel1Color = () => {
    if (selectedCategories.length === 1 && level1Categories.length > 0) {
      const category = level1Categories.find(l1 =>
        selectedCategories.includes(normalizeCategoryName(l1.name))
      );
      return category?.colorKey || 'indigo';
    }
    return 'indigo';
  };

  // Fetch Level 2 categories when Level 1 selection changes
  useEffect(() => {
    const fetchLevel2Categories = async () => {
      if (selectedCategories.length === 0) {
        setLevel2Categories([]);
        onLevel2Change([]);
        setLevel3Categories([]);
        onLevel3Change([]);
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
  }, [selectedCategories, onLevel2Change, onLevel3Change]);

  // Fetch Level 3 categories when Level 2 selection changes
  useEffect(() => {
    const fetchLevel3Categories = async () => {
      if (selectedLevel2.length === 0) {
        setLevel3Categories([]);
        onLevel3Change([]);
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
  }, [selectedLevel2, onLevel3Change]);

  return (
    <Paper
      p={isCollapsed ? "xs" : "sm"}
      bg={colorScheme === 'dark' ? 'dark.7' : 'gray.0'}
      style={{
        width: isCollapsed ? 60 : 320,
        height: 'calc(100vh - 72px)',
        borderRadius: 0,
        borderRight: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Premium Toggle Button */}
      {onToggleCollapse && (
        <Box pos="absolute" top={12} right={12} style={{ zIndex: 10 }}>
          <UnstyledButton
            onClick={onToggleCollapse}
            p="xs"
            bg={colorScheme === 'dark' ? 'dark.5' : 'white'}
            style={{
              borderRadius: theme.radius.sm,
              transition: theme.other.transition,
              boxShadow: theme.shadows.sm,
              border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[0];
              e.currentTarget.style.boxShadow = theme.shadows.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.white;
              e.currentTarget.style.boxShadow = theme.shadows.sm;
            }}
          >
            {isCollapsed ? <IconChevronRight size={16} color={theme.colors.gray[6]} /> : <IconChevronLeft size={16} color={theme.colors.gray[6]} />}
          </UnstyledButton>
        </Box>
      )}

      {!isCollapsed && <Stack gap="lg" pt={52}>
        {/* Level 1 Categories */}
        <Box>
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            mb="md"
            pl="xs"
            style={{ letterSpacing: '0.075em' }}
          >
            Categories
          </Text>
          <Stack gap={4}>
            {/* All Categories Option */}
            <Tooltip label="Show all categories" position="right" disabled={selectedCategories.length === 0}>
              <UnstyledButton
                onClick={() => onCategoryChange([])}
                p={6}
                bg={selectedCategories.length === 0
                  ? (colorScheme === 'dark' ? 'dark.5' : 'gray.1')
                  : 'transparent'}
                style={{
                  borderRadius: theme.radius.xs,
                  transition: theme.other.transition
                }}
              >
                <Group gap="xs">
                  <ThemeIcon
                    size={20}
                    variant="light"
                    color="gray"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <IconActivity size={12} />
                  </ThemeIcon>
                  <Text size="xs" fw={selectedCategories.length === 0 ? 600 : 400}>
                    All Categories
                  </Text>
                </Group>
              </UnstyledButton>
            </Tooltip>

            {/* Category Options - from database (single source of truth) */}
            {level1Categories.map((category) => {
              const normalizedValue = normalizeCategoryName(category.name);
              const isSelected = selectedCategories.includes(normalizedValue);
              const colorKey = category.colorKey || 'indigo';
              const IconComponent = {
                IconBrain,
                IconHeart,
                IconUsersGroup,
                IconTheater,
                IconBuilding,
                IconTool
              }[category.iconName || ''] || IconActivity;

              return (
                <Tooltip
                  key={category.id}
                  label={category.description || category.name}
                  position="right"
                  disabled={isSelected}
                >
                  <UnstyledButton
                    onClick={() => {
                      if (selectedCategories.includes(normalizedValue)) {
                        onCategoryChange(selectedCategories.filter(cat => cat !== normalizedValue));
                      } else {
                        onCategoryChange([...selectedCategories, normalizedValue]);
                      }
                    }}
                    p="xs"
                    bg={isSelected
                      ? (colorScheme === 'dark' ? 'dark.5' : `${colorKey}.0`)
                      : 'transparent'}
                    style={{
                      borderRadius: theme.radius.sm,
                      borderLeft: isSelected ? `3px solid ${theme.colors[colorKey][5]}` : '3px solid transparent',
                      transition: theme.other.transition
                    }}
                  >
                    <Group gap="xs">
                      <ThemeIcon
                        size={24}
                        variant={isSelected ? 'filled' : 'light'}
                        color={colorKey}
                      >
                        <IconComponent size={14} />
                      </ThemeIcon>
                      <Text
                        size="sm"
                        fw={isSelected ? 700 : 500}
                        c={isSelected ? `${colorKey}.${colorScheme === 'dark' ? '4' : '7'}` : undefined}
                        lineClamp={1}
                      >
                        {category.name}
                      </Text>
                    </Group>
                  </UnstyledButton>
                </Tooltip>
              )
            })}
          </Stack>
        </Box>

        {/* Level 2 Sub-Categories - Searchable Combobox */}
        {level2Categories.length > 0 && (
          <Box>
            <Text size="xs" c="dimmed" mb="xs" fw={600} tt="uppercase" pl="xs">
              Domains
            </Text>
            <Combobox
              store={comboboxLevel2}
              onOptionSubmit={(val) => {
                if (selectedLevel2.includes(val)) {
                  onLevel2Change(selectedLevel2.filter(id => id !== val));
                } else {
                  onLevel2Change([...selectedLevel2, val]);
                }
              }}
            >
              <Combobox.Target>
                <PillsInput
                  onClick={() => comboboxLevel2.openDropdown()}
                  leftSection={<IconSearch size={16} />}
                  size="sm"
                >
                  <Pill.Group>
                    {selectedLevel2.map((id) => {
                      const tag = level2Categories.find(t => t.id === id);
                      if (!tag) return null;
                      const level1Color = getLevel1Color();
                      return (
                        <Pill
                          key={id}
                          withRemoveButton
                          onRemove={() => onLevel2Change(selectedLevel2.filter(tid => tid !== id))}
                          color={level1Color}
                          size="sm"
                        >
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
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>
                  <ScrollArea.Autosize mah={300} type="scroll">
                    {Object.entries(groupLevel2ByParent()).map(([parentName, tags]) => {
                      const filteredTags = filterTags(tags, level2SearchValue);
                      if (filteredTags.length === 0) return null;

                      return (
                        <Combobox.Group label={parentName} key={parentName}>
                          {filteredTags.map((tag) => {
                            const isSelected = selectedLevel2.includes(tag.id);
                            return (
                              <Combobox.Option
                                value={tag.id}
                                key={tag.id}
                                active={isSelected}
                              >
                                <Group gap="xs">
                                  {isSelected && <CheckIcon size={12} />}
                                  <Text size="sm">{tag.name}</Text>
                                </Group>
                              </Combobox.Option>
                            );
                          })}
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
          <Box mt="xs">
            <Text size="xs" c="dimmed" mb="xs" fw={600} tt="uppercase" pl="xs">
              Specific
            </Text>
            <Combobox
              store={comboboxLevel3}
              onOptionSubmit={(val) => {
                if (selectedLevel3.includes(val)) {
                  onLevel3Change(selectedLevel3.filter(id => id !== val));
                } else {
                  onLevel3Change([...selectedLevel3, val]);
                }
              }}
            >
              <Combobox.Target>
                <PillsInput
                  onClick={() => comboboxLevel3.openDropdown()}
                  leftSection={<IconSearch size={16} />}
                  size="sm"
                >
                  <Pill.Group>
                    {selectedLevel3.map((id) => {
                      const tag = level3Categories.find(t => t.id === id);
                      if (!tag) return null;
                      const level1Color = getLevel1Color();
                      return (
                        <Pill
                          key={id}
                          withRemoveButton
                          onRemove={() => onLevel3Change(selectedLevel3.filter(tid => tid !== id))}
                          color={level1Color}
                          size="xs"
                        >
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
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>
                  <ScrollArea.Autosize mah={300} type="scroll">
                    {Object.entries(groupLevel3ByParent()).map(([parentName, tags]) => {
                      const filteredTags = filterTags(tags, level3SearchValue);
                      if (filteredTags.length === 0) return null;

                      return (
                        <Combobox.Group label={parentName} key={parentName}>
                          {filteredTags.map((tag) => {
                            const isSelected = selectedLevel3.includes(tag.id);
                            return (
                              <Combobox.Option
                                value={tag.id}
                                key={tag.id}
                                active={isSelected}
                              >
                                <Group gap="xs">
                                  {isSelected && <CheckIcon size={12} />}
                                  <Text size="sm">{tag.name}</Text>
                                </Group>
                              </Combobox.Option>
                            );
                          })}
                        </Combobox.Group>
                      );
                    })}
                  </ScrollArea.Autosize>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
          </Box>
        )}

        <Divider />

        {/* Location Filter */}
        <Box>
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            mb="md"
            pl="xs"
            style={{ letterSpacing: '0.075em' }}
          >
            Location
          </Text>
          <Select
            placeholder="All locations"
            leftSection={<IconMapPin size={16} />}
            data={[
              { value: '', label: 'All Locations' },
              ...LATVIAN_CITIES.map(city => ({
                value: city.value,
                label: city.label
              }))
            ]}
            value={selectedLocation || ''}
            onChange={(value) => onLocationChange(value || null)}
            clearable
          />
        </Box>

        <Divider />

        {/* Create Group Button - only for authenticated users */}
        {session && (
          <Box>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreateGroup}
              fullWidth
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              variant="gradient"
            >
              Create Group
            </Button>
          </Box>
        )}

        {session && <Divider />}

        {/* Quick Stats */}
        <Box>
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            mb="md"
            pl="xs"
            style={{ letterSpacing: '0.075em' }}
          >
            Quick Stats
          </Text>
          <Stack gap="xs">
            <Group justify="space-between">
              <Group gap="xs">
                <IconActivity size={16} color={theme.colors.categoryBlue[5]} />
                <Text size="sm" fw={500}>Groups & Events</Text>
              </Group>
              <Badge variant="light" color="categoryBlue" size="sm">
                {itemCount}
              </Badge>
            </Group>

            <Group justify="space-between">
              <Group gap="xs">
                <IconUsers size={16} color={theme.colors.categoryGreen[5]} />
                <Text size="sm" fw={500}>Total Members</Text>
              </Group>
              <Badge variant="light" color="categoryGreen" size="sm">
                {totalMembers}
              </Badge>
            </Group>
          </Stack>
        </Box>

        {/* Sign Up CTA for non-authenticated users */}
        {!session && (
          <>
            <Divider />
            <Box>
              <Text size="xs" c="dimmed" mb="xs">
                Sign up to join activities and connect with your community!
              </Text>
              <Stack gap="xs">
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="filled"
                  fullWidth
                  size="xs"
                >
                  Sign Up
                </Button>
                <Button
                  component={Link}
                  href="/auth/signin"
                  variant="outline"
                  fullWidth
                  size="xs"
                >
                  Sign In
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Stack>}

      {/* Collapsed State - Show only essential icons */}
      {isCollapsed && (
        <Stack gap="xs" align="center" style={{ paddingTop: '40px' }}>
          {/* Just show Level 1 category icons - from database */}
          {level1Categories.map((category) => {
            const normalizedValue = normalizeCategoryName(category.name);
            const isSelected = selectedCategories.includes(normalizedValue);
            const colorKey = category.colorKey || 'indigo';
            const IconComponent = {
              IconBrain,
              IconHeart,
              IconUsersGroup,
              IconTheater,
              IconBuilding,
              IconTool
            }[category.iconName || ''] || IconActivity;

            return (
              <Tooltip
                key={category.id}
                label={category.name}
                position="right"
                withArrow
              >
                <UnstyledButton
                  onClick={() => {
                    if (selectedCategories.includes(normalizedValue)) {
                      onCategoryChange(selectedCategories.filter(cat => cat !== normalizedValue));
                    } else {
                      onCategoryChange([...selectedCategories, normalizedValue]);
                    }
                  }}
                  p="xs"
                  bg={isSelected
                    ? (colorScheme === 'dark' ? 'dark.5' : `${colorKey}.0`)
                    : 'transparent'}
                  style={{
                    borderRadius: theme.radius.sm,
                    borderLeft: isSelected ? `3px solid ${theme.colors[colorKey][5]}` : '3px solid transparent',
                    transition: theme.other.transition
                  }}
                >
                  <ThemeIcon
                    size={28}
                    variant={isSelected ? 'filled' : 'light'}
                    color={colorKey}
                  >
                    <IconComponent size={16} />
                  </ThemeIcon>
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}