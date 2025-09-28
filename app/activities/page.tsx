'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity } from '@prisma/client';
import { ActivityCard, ActivityWithRelations } from '@/components/activities/ActivityCard';
import { Title, Text, Container, Grid, Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

// Define the shape of the data returned from the API
interface ActivityResponse {
  activities: ActivityWithRelations[];
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: We are NOT fetching tags here yet, so the tagId param is omitted for now.
      const response = await fetch('/api/activities'); 
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activities');
      }

      const data: ActivityResponse = await response.json();
      setActivities(data.activities);
    } catch (err: any) {
      console.error("Fetch activities error:", err);
      setError(err.message || 'An unknown error occurred while loading activities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={1} className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Community Activities
        </Title>
        <Button
          component={Link}
          href="/activities/new"
          leftSection={<IconPlus size={20} />}
          size="md"
          radius="md"
          className="bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out"
        >
          Create New Activity
        </Button>
      </Group>

      {/* Status Messages */}
      {loading && <Text align="center" className="text-lg text-indigo-600">Loading activities...</Text>}
      {error && <Text color="red" align="center" className="text-lg font-medium">Error: {error}</Text>}

      {/* Activity Grid */}
      <Grid gutter="xl">
        {activities.map((activity) => (
          // We use the new ActivityCard component here
          <Grid.Col key={activity.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <ActivityCard activity={activity} />
          </Grid.Col>
        ))}
      </Grid>
      
      {!loading && !error && activities.length === 0 && (
        <Text align="center" className="text-lg text-gray-500 mt-8">
          No activities found. Be the first to create one!
        </Text>
      )}
    </Container>
  );
}
