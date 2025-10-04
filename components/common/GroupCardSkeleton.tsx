'use client';

import { Card, Stack, Group, Skeleton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function GroupCardSkeleton() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Card
      shadow={isMobile ? 'none' : 'sm'}
      radius={isMobile ? 0 : 'xl'}
      p={isMobile ? 'lg' : 'md'}
      withBorder={!isMobile}
      h={isMobile ? undefined : 380}
      mih={isMobile ? 280 : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      <Stack gap="md" style={{ flex: 1 }}>
        {/* Cover Image Skeleton */}
        <Skeleton height={isMobile ? 180 : 160} radius={isMobile ? 'sm' : 'md'} />

        {/* Title Skeleton */}
        <Skeleton height={24} width="80%" radius="sm" />

        {/* Description Skeleton */}
        <Stack gap="xs">
          <Skeleton height={16} radius="sm" />
          <Skeleton height={16} width="90%" radius="sm" />
        </Stack>

        {/* Tags Skeleton */}
        <Group gap="xs">
          <Skeleton height={24} width={60} radius="xl" />
          <Skeleton height={24} width={80} radius="xl" />
          <Skeleton height={24} width={70} radius="xl" />
        </Group>

        {/* Footer Info Skeleton */}
        <Group justify="space-between" mt="auto">
          <Skeleton height={16} width={100} radius="sm" />
          <Skeleton height={16} width={80} radius="sm" />
        </Group>
      </Stack>
    </Card>
  );
}
