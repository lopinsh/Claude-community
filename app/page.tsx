'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
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
  Stack
} from '@mantine/core';
import Header from '@/components/layout/Header';

export default function Home() {
  const { data: session, status } = useSession();
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/test-db')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setDbConnectionStatus('success');
          setUserCount(data.userCount);
        } else {
          setDbConnectionStatus('error');
        }
      })
      .catch(() => {
        setDbConnectionStatus('error');
      });
  }, []);

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      <Header />

      <Container size="xl" py="xl">
        <Center>
          <Stack align="center" gap="xl" style={{ maxWidth: 800 }}>
            <Title order={1} size="3rem" ta="center" c="dark">
              Connect with Latvian Culture
            </Title>
            
            <Text size="xl" c="dimmed" ta="center">
              Find and join local choirs, folk dancing groups, workout partners, and more. 
              Building community through shared activities and cultural traditions.
            </Text>
            
            {!session && (
              <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                <Button size="lg" style={{ fontSize: '1.1rem' }}>
                  Get Started
                </Button>
              </Link>
            )}
          </Stack>
        </Center>

        {/* System Status Card */}
        <Card shadow="md" radius="lg" mt="xl" p="lg">
          <Title order={3} mb="md">System Status</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Group gap="xs">
                <div 
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: 
                      dbConnectionStatus === 'success' ? '#51cf66' :
                      dbConnectionStatus === 'error' ? '#ff6b6b' : '#ffd43b'
                  }}
                />
                <Text size="sm">
                  Database: {
                    dbConnectionStatus === 'success' ? 'Connected' :
                    dbConnectionStatus === 'error' ? 'Error' : 'Checking...'
                  }
                </Text>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Group gap="xs">
                <div 
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: 
                      status === 'authenticated' ? '#51cf66' :
                      status === 'unauthenticated' ? '#868e96' : '#ffd43b'
                  }}
                />
                <Text size="sm">
                  Auth: {
                    status === 'authenticated' ? 'Signed In' :
                    status === 'unauthenticated' ? 'Not Signed In' : 'Loading...'
                  }
                </Text>
              </Group>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Group gap="xs">
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#51cf66' }} />
                <Text size="sm">Users Registered: {userCount}</Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Welcome Back Section for Authenticated Users */}
        {session && (
          <Card shadow="md" radius="lg" mt="xl" p="lg">
            <Title order={3} mb="md">Welcome Back!</Title>
            <Text mb="lg" c="dimmed">
              You're successfully signed in. Here's what you can do next:
            </Text>
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card padding="md" radius="md" withBorder>
                  <Title order={4} mb="xs">Browse Activities</Title>
                  <Text size="sm" c="dimmed">
                    Find choirs, dance groups, and workout partners near you.
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card padding="md" radius="md" withBorder>
                  <Title order={4} mb="xs">Create Activity</Title>
                  <Text size="sm" c="dimmed">
                    Start your own group and invite others to join.
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card padding="md" radius="md" withBorder>
                  <Title order={4} mb="xs">Manage Profile</Title>
                  <Text size="sm" c="dimmed">
                    Update your information and preferences.
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>
          </Card>
        )}
      </Container>
    </div>
  );
}