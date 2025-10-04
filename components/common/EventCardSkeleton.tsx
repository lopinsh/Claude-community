'use client';

import { Card, Stack, Group, Skeleton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function EventCardSkeleton() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Card
      shadow={isMobile ? 'none' : 'sm'}
      radius={isMobile ? 0 : 'md'}
      p={isMobile ? 'lg' : 'md'}
      withBorder
      style={{
        cursor: 'pointer',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap={isMobile ? 'wrap' : 'nowrap'}>
        <Stack gap="xs" style={{ flex: 1 }}>
          {/* Title and Badges */}
          <Group gap="sm">
            <Skeleton height={20} width={isMobile ? 200 : 250} radius="sm" />
            <Skeleton height={20} width={60} radius="xl" />
          </Group>

          {/* Date/Time */}
          <Skeleton height={16} width={isMobile ? 180 : 200} radius="sm" />

          {/* Location */}
          <Skeleton height={16} width={isMobile ? 140 : 160} radius="sm" />

          {/* Attendees */}
          <Group gap="xs" mt="xs">
            <Skeleton height={24} width={24} circle />
            <Skeleton height={24} width={24} circle />
            <Skeleton height={24} width={24} circle />
            <Skeleton height={16} width={60} radius="sm" />
          </Group>
        </Stack>

        {/* Action Button Skeleton */}
        {!isMobile && (
          <Skeleton height={36} width={80} radius="sm" />
        )}
      </Group>

      {/* Mobile Action Button */}
      {isMobile && (
        <Skeleton height={44} width="100%" radius="sm" mt="md" />
      )}
    </Card>
  );
}
