'use client';

import { Stack, SimpleGrid } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface ListSkeletonProps {
  count?: number;
  columns?: { base: number; sm?: number; lg?: number };
  children: React.ReactNode;
}

/**
 * Generic skeleton wrapper for grid/list loading states
 *
 * @example
 * // Group grid with 3 skeletons
 * <ListSkeleton count={3} columns={{ base: 1, sm: 2, lg: 3 }}>
 *   <GroupCardSkeleton />
 * </ListSkeleton>
 *
 * @example
 * // Event list with 5 skeletons
 * <ListSkeleton count={5} columns={{ base: 1 }}>
 *   <EventCardSkeleton />
 * </ListSkeleton>
 */
export default function ListSkeleton({
  count = 3,
  columns = { base: 1, sm: 2, lg: 3 },
  children,
}: ListSkeletonProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // For single column layouts, use Stack instead of SimpleGrid
  if (columns.base === 1 && !columns.sm && !columns.lg) {
    return (
      <Stack gap={isMobile ? 'md' : 'sm'}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{children}</div>
        ))}
      </Stack>
    );
  }

  return (
    <SimpleGrid cols={columns} spacing={isMobile ? 'md' : 'lg'}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{children}</div>
      ))}
    </SimpleGrid>
  );
}
