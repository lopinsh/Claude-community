// app/activities/page.tsx
"use client"; // MARK AS CLIENT COMPONENT

import { useState, useEffect } from 'react';
import { Container, Title, Stack, Select, Group, Center, Loader, Alert } from '@mantine/core';
import Header from '@/components/layout/Header';
// Assuming you have a component to display the list of activities
// import ActivityCard from '@/components/activities/ActivityCard'; 

interface Tag {
    id: string;
    name: string;
    level: number;
}

interface Activity {
    id: string;
    title: string;
    location: string;
    // ... other fields needed for your card
}

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [level1Tags, setLevel1Tags] = useState<Tag[]>([]);
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // --- 1. Fetch Level 1 Tags ---
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags?level=1');
                if (response.ok) {
                    const data = await response.json();
                    setLevel1Tags(data);
                }
            } catch (error) {
                console.error('Failed to fetch L1 tags for filter:', error);
            }
        };
        fetchTags();
    }, []);

    // --- 2. Fetch Activities based on Filter ---
    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            try {
                // Build the API URL with or without the filter
                let url = '/api/activities';
                if (selectedTagId) {
                    url += `?tagId=${selectedTagId}`;
                }

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setActivities(data);
                } else {
                    console.error('Failed to fetch activities:', response.status);
                }
            } catch (error) {
                console.error('Network error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [selectedTagId]); // Rerun whenever the filter changes

    const tagOptions = level1Tags.map(t => ({ value: t.id, label: t.name }));

    if (loading) {
        return (
            <Center style={{ height: '100vh' }}>
                <Loader />
            </Center>
        );
    }

    return (
        <Container size="lg" pt="xl">
            <Header />
            <Stack gap="lg" mt="lg">
                <Title order={1}>Discover Activities</Title>

                <Group justify="flex-start" align="flex-end">
                    <Select
                        label="Filter by Broad Category"
                        placeholder="All Categories"
                        data={tagOptions}
                        value={selectedTagId}
                        onChange={setSelectedTagId}
                        allowDeselect
                        clearable
                        style={{ minWidth: 250 }}
                    />
                </Group>

                {activities.length === 0 && (
                    <Alert color="blue" title="No Activities Found">
                        {selectedTagId 
                            ? "There are no activities matching this filter yet."
                            : "No activities have been created yet."
                        }
                    </Alert>
                )}

                <Stack gap="md">
                    {/* Render your ActivityCard component here for each activity */}
                    {activities.map(activity => (
                        <div key={activity.id}>
                            {/* Replace this with your actual ActivityCard component */}
                            <Title order={3}>{activity.title}</Title>
                            <p>{activity.location}</p>
                        </div>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}