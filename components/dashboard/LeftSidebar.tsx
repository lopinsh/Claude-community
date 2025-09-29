import { useState } from 'react';
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
  Box
} from '@mantine/core';
import { IconSearch, IconPlus, IconMapPin, IconUsers, IconActivity } from '@tabler/icons-react';
import { LATVIAN_CITIES } from '@/utils/tagUtils';

interface LeftSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  selectedLocation: string | null;
  onLocationChange: (location: string | null) => void;
  itemCount: number;
  totalMembers?: number;
}

const CATEGORIES = [
  { value: 'physical', label: 'Physical', color: 'green' },
  { value: 'cultural', label: 'Cultural', color: 'violet' },
  { value: 'learning', label: 'Learning', color: 'blue' },
  { value: 'social', label: 'Social', color: 'yellow' },
];

export default function LeftSidebar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onLocationChange,
  itemCount,
  totalMembers = 0
}: LeftSidebarProps) {
  const { data: session } = useSession();

  return (
    <Paper
      p="md"
      style={{
        width: 280,
        height: 'calc(100vh - 60px)', // Subtract header height
        position: 'sticky',
        top: 60,
        borderRadius: 0,
        borderRight: '1px solid var(--mantine-color-gray-3)'
      }}
    >
      <Stack gap="lg">
        {/* Search */}
        <Box>
          <Title order={5} mb="xs">Search Activities</Title>
          <TextInput
            placeholder="Search by title or description..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
          />
        </Box>

        <Divider />

        {/* Category Filter */}
        <Box>
          <Title order={5} mb="xs">Categories</Title>
          <Stack gap="xs">
            <Button
              variant={selectedCategory === null ? 'filled' : 'subtle'}
              color="gray"
              fullWidth
              justify="flex-start"
              onClick={() => onCategoryChange(null)}
              size="sm"
            >
              All Categories
            </Button>
            {CATEGORIES.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'filled' : 'subtle'}
                color={category.color}
                fullWidth
                justify="flex-start"
                onClick={() => onCategoryChange(category.value)}
                size="sm"
              >
                {category.label}
              </Button>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Location Filter */}
        <Box>
          <Title order={5} mb="xs">Location</Title>
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

        {/* Quick Stats */}
        <Box>
          <Title order={5} mb="md">Quick Stats</Title>
          <Stack gap="xs">
            <Group justify="space-between">
              <Group gap="xs">
                <IconActivity size={16} color="var(--mantine-color-blue-6)" />
                <Text size="sm">Groups & Events</Text>
              </Group>
              <Badge variant="light" color="blue">
                {itemCount}
              </Badge>
            </Group>

            <Group justify="space-between">
              <Group gap="xs">
                <IconUsers size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm">Total Members</Text>
              </Group>
              <Badge variant="light" color="green">
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
              <Text size="sm" c="dimmed" mb="md">
                Sign up to join activities and connect with your community!
              </Text>
              <Stack gap="xs">
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="filled"
                  fullWidth
                  size="sm"
                >
                  Sign Up
                </Button>
                <Button
                  component={Link}
                  href="/auth/signin"
                  variant="outline"
                  fullWidth
                  size="sm"
                >
                  Sign In
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}