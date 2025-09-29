'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Flex, Center, Loader, Stack, Text } from '@mantine/core';
import Header from '@/components/layout/Header';
import LeftSidebar from '@/components/dashboard/LeftSidebar';
import MainContent from '@/components/dashboard/MainContent';

export default function Home() {
  const { status } = useSession();
  const [groups, setGroups] = useState<any[]>([]);
  const [publicEvents, setPublicEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const discoverResponse = await fetch('/api/discover');

      if (!discoverResponse.ok) {
        const errorData = await discoverResponse.json();
        throw new Error(errorData.error || 'Failed to fetch groups and events');
      }

      const discoverData = await discoverResponse.json();

      setGroups(discoverData.groups || []);
      setPublicEvents(discoverData.publicEvents || []);
    } catch (err: any) {
      console.error('Fetch data error:', err);
      setError(err.message || 'An unknown error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate total members across all groups
  const totalMembers = useMemo(() => {
    return groups.reduce((sum, group) => sum + group._count.applications, 0);
  }, [groups]);

  if (status === 'loading') {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <Header />

      <Flex>
        <LeftSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          itemCount={groups.length + publicEvents.length}
          totalMembers={totalMembers}
        />

        <MainContent
          groups={groups}
          publicEvents={publicEvents}
          loading={loading}
          error={error}
        />
      </Flex>
    </div>
  );
}