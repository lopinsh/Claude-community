'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Grid,
  Group,
  Badge,
  Center,
  Loader,
  Stack,
  Tabs,
  ActionIcon,
  Box,
  Flex,
  Select
} from '@mantine/core';
import Header from '@/components/layout/Header';

interface Activity {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string;
  maxMembers: number | null;
  createdAt: string;
  creator: {
    id: string;
    name: string | null;
  };
  _count: {
    applications: number;
  };
}

const LATVIAN_CITIES = [
  { value: 'all', label: 'All Locations' },
  { value: 'riga', label: 'Riga' },
  { value: 'daugavpils', label: 'Daugavpils' },
  { value: 'liepaja', label: 'Liepāja' },
  { value: 'jelgava', label: 'Jelgava' },
  { value: 'jurmala', label: 'Jūrmala' },
  { value: 'ventspils', label: 'Ventspils' },
  { value: 'rezekne', label: 'Rēzekne' },
  { value: 'valmiera', label: 'Valmiera' },
  { value: 'jekabpils', label: 'Jēkabpils' },
  { value: 'ogre', label: 'Ogre' },
];

const ACTIVITY_TYPES: { [key: string]: { label: string; color: string; icon: string } } = {
  'choir': { label: 'Choir', color: 'violet', icon: '🎵' },
  'folk-dance': { label: 'Folk Dancing', color: 'green', icon: '💃' },
  'workout': { label: 'Workout', color: 'orange', icon: '💪' },
  'language': { label: 'Language', color: 'blue', icon: '💬' },
  'cultural': { label: 'Cultural', color: 'indigo', icon: '🎭' },
  'other': { label: 'Other', color: 'gray', icon: '📋' },
};

export default function ActivitiesPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || 
      activity.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      (selectedLocation === 'riga' && activity.location.toLowerCase().includes('riga'));
    
    return matchesType && matchesLocation;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
        <Header />
        <Center style={{ minHeight: '50vh' }}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading activities...</Text>
          </Stack>
        </Center>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      <Header />

      <Container size="xl" py="xl">
        <Flex justify="space-between" align="center" mb="xl">
          <div>
            <Title order={1}>Community Activities</Title>
            <Text c="dimmed" mt="xs">Discover and join local cultural activities</Text>
          </div>
          
          {session && (
            <Link href="/activities/create" style={{ textDecoration: 'none' }}>
              <Button leftSection="+" size="lg">
                Create Activity
              </Button>
            </Link>
          )}
        </Flex>

        {/* Filter Controls */}
        <Card shadow="sm" radius="md" mb="xl" p="md">
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <div style={{ flex: 1, minWidth: 200 }}>
                <Text size="sm" fw={500} mb="xs">Filter by Location</Text>
                <Select
                  placeholder="Select location"
                  data={LATVIAN_CITIES}
                  value={selectedLocation}
                  onChange={(value) => setSelectedLocation(value || 'all')}
                  clearable
                  size="sm"
                />
              </div>
              
              <div style={{ flex: 2, minWidth: 300 }}>
                <Text size="sm" fw={500} mb="xs">Filter by Activity Type</Text>
                <Tabs value={selectedType} onChange={(value) => setSelectedType(value || 'all')}>
                  <Tabs.List>
                    <Tabs.Tab value="all">
                      All ({activities.length})
                    </Tabs.Tab>
                    {Object.entries(ACTIVITY_TYPES).map(([type, config]) => {
                      const count = activities.filter(a => a.type === type).length;
                      return (
                        <Tabs.Tab key={type} value={type} leftSection={config.icon}>
                          {config.label} ({count})
                        </Tabs.Tab>
                      );
                    })}
                  </Tabs.List>
                </Tabs>
              </div>
            </Group>
            
            {(selectedType !== 'all' || selectedLocation !== 'all') && (
              <Group>
                <Text size="sm" c="dimmed">
                  Showing {filteredActivities.length} of {activities.length} activities
                </Text>
                {selectedLocation !== 'all' && (
                  <Badge variant="outline" size="sm">
                    📍 {LATVIAN_CITIES.find(c => c.value === selectedLocation)?.label}
                  </Badge>
                )}
                {selectedType !== 'all' && (
                  <Badge variant="outline" size="sm">
                    {ACTIVITY_TYPES[selectedType]?.icon} {ACTIVITY_TYPES[selectedType]?.label}
                  </Badge>
                )}
              </Group>
            )}
          </Stack>
        </Card>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <Card shadow="md" radius="lg" p="xl">
            <Center>
              <Stack align="center" gap="md">
                <Text size="4rem">🎭</Text>
                <Title order={2} ta="center">
                  {selectedType === 'all' && selectedLocation === 'all' ? 'No activities yet' : 
                   `No activities found for your filters`}
                </Title>
                <Text c="dimmed" ta="center" size="lg">
                  Be the first to create an activity and bring the community together!
                </Text>
                {session && (
                  <Link href="/activities/create" style={{ textDecoration: 'none' }}>
                    <Button size="lg" mt="md">
                      Create First Activity
                    </Button>
                  </Link>
                )}
              </Stack>
            </Center>
          </Card>
        ) : (
          <Grid>
            {filteredActivities.map((activity) => {
              const typeConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.other;
              return (
                <Grid.Col key={activity.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card 
                    shadow="md" 
                    radius="lg" 
                    h="100%" 
                    style={{ 
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    className="hover:scale-105 hover:shadow-xl"
                  >
                    <Card.Section p="md">
                      <Flex justify="space-between" align="flex-start" mb="sm">
                        <Badge 
                          color={typeConfig.color} 
                          leftSection={typeConfig.icon}
                          size="lg"
                          variant="light"
                        >
                          {typeConfig.label}
                        </Badge>
                        <Text size="sm" c="dimmed">
                          {activity._count.applications} {activity.maxMembers ? `/ ${activity.maxMembers}` : ''} members
                        </Text>
                      </Flex>
                      
                      <Title order={3} lineClamp={2} mb="sm">
                        {activity.title}
                      </Title>
                      
                      <Group gap="xs" mb="sm">
                        <Text size="sm" c="dimmed">📍</Text>
                        <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                          {activity.location}
                        </Text>
                      </Group>
                      
                      {activity.description && (
                        <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                          {activity.description}
                        </Text>
                      )}
                      
                      <Flex justify="space-between" align="center">
                        <Text size="xs" c="dimmed">
                          Created by {activity.creator.name || 'Anonymous'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </Text>
                      </Flex>
                    </Card.Section>
                    
                    <Card.Section p="sm" style={{ backgroundColor: '#f8f9fa' }}>
                      <Button 
                        fullWidth
                        component={Link}
                        href={`/activities/${activity.id}`}
                      >
                        View Details & Join
                      </Button>
                    </Card.Section>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        )}
      </Container>
    </div>
  );
}