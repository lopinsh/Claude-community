'use client';

import { Drawer, Box, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import LeftSidebar from '@/components/dashboard/LeftSidebar';

interface FilterDrawerProps {
  opened: boolean;
  onClose: () => void;
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
  totalMembers: number;
  onCreateGroup: () => void;
  dragOffset?: number;
}

export default function FilterDrawer({
  opened,
  onClose,
  dragOffset = 0,
  ...sidebarProps
}: FilterDrawerProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size={320}
      withCloseButton={false}
      padding={0}
      styles={{
        body: {
          padding: 0,
          height: '100%',
        },
        content: {
          transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
          transition: dragOffset === 0 ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        },
      }}
      overlayProps={{
        opacity: 0.5,
        blur: 2,
      }}
    >
      <Box h="100vh" style={{ overflow: 'hidden' }}>
        <LeftSidebar
          {...sidebarProps}
          isCollapsed={false}
          onToggleCollapse={undefined}
        />
      </Box>
    </Drawer>
  );
}
