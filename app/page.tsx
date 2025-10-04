'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Flex, Center, Loader, Stack, Text, Box, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import MainLayout from '@/components/layout/MainLayout';
import LeftSidebar from '@/components/dashboard/LeftSidebar';
import MainContent from '@/components/dashboard/MainContent';
import CreateGroupModal from '@/components/groups/CreateGroupModal';
import { FilterDrawer, SearchOverlay } from '@/components/mobile';

export default function Home() {
  const { status } = useSession();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevel2, setSelectedLevel2] = useState<string[]>([]);
  const [selectedLevel3, setSelectedLevel3] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Create group modal state
  const [createGroupModalOpened, setCreateGroupModalOpened] = useState(false);

  // Search overlay state
  const [searchOverlayOpened, setSearchOverlayOpened] = useState(false);

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile sidebar drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
      if (selectedLevel2.length > 0) params.set('level2', selectedLevel2.join(','));
      if (selectedLevel3.length > 0) params.set('level3', selectedLevel3.join(','));
      if (selectedLocation) params.set('location', selectedLocation);

      const groupsResponse = await fetch(`/api/groups?${params.toString()}`);

      if (!groupsResponse.ok) {
        const errorData = await groupsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch groups');
      }

      const groupsData = await groupsResponse.json();

      setGroups(groupsData.groups || []);
    } catch (err: any) {
      console.error('Fetch data error:', err);
      setError(err.message || 'An unknown error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategories, selectedLevel2, selectedLevel3, selectedLocation]);

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
    <MainLayout onBurgerClick={isMobile ? () => setMobileSidebarOpen(true) : undefined}>
      <Box style={{
        display: isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : (sidebarCollapsed ? '60px 1fr' : 'minmax(320px, 320px) 1fr'),
        transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: 'calc(100vh - 72px)',
        gap: 0,
        flex: 1,
      }}>
        {/* Hide sidebar on mobile */}
        {!isMobile && (
          <LeftSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            selectedLevel2={selectedLevel2}
            onLevel2Change={setSelectedLevel2}
            selectedLevel3={selectedLevel3}
            onLevel3Change={setSelectedLevel3}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            itemCount={groups.length}
            totalMembers={totalMembers}
            onCreateGroup={() => setCreateGroupModalOpened(true)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        <Box
          p={isMobile ? 'md' : 'clamp(24px, 4vw, 40px)'}
          bg={colorScheme === 'dark' ? 'dark.8' : 'white'}
          style={{
            borderLeft: isMobile ? 'none' : `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
            overflow: 'auto',
            flex: 1,
          }}
        >
          <MainContent
            groups={groups}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateGroup={() => setCreateGroupModalOpened(true)}
            onSearchClick={isMobile ? () => setSearchOverlayOpened(true) : undefined}
          />
        </Box>
      </Box>

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <FilterDrawer
          opened={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          selectedLevel2={selectedLevel2}
          onLevel2Change={setSelectedLevel2}
          selectedLevel3={selectedLevel3}
          onLevel3Change={setSelectedLevel3}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          itemCount={groups.length}
          totalMembers={totalMembers}
          onCreateGroup={() => {
            setCreateGroupModalOpened(true);
            setMobileSidebarOpen(false);
          }}
        />
      )}

      {/* Search Overlay */}
      <SearchOverlay opened={searchOverlayOpened} onClose={() => setSearchOverlayOpened(false)} />

      {/* Create Group Modal */}
      <CreateGroupModal
        opened={createGroupModalOpened}
        onClose={() => setCreateGroupModalOpened(false)}
      />
    </MainLayout>
  );
}