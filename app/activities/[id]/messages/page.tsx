'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Badge,
  Center,
  Loader,
  ActionIcon,
  Flex,
  TextInput,
  ScrollArea,
  Avatar,
  Box,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Header from '@/components/layout/Header';

interface Activity {
  id: string;
  title: string;
  type: string;
  creator: {
    id: string;
    name: string | null;
  };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  };
}

const ACTIVITY_TYPES: { [key: string]: { label: string; color: string; icon: string } } = {
  'choir': { label: 'Choir', color: 'violet', icon: '🎵' },
  'folk-dance': { label: 'Folk Dancing', color: 'green', icon: '💃' },
  'workout': { label: 'Workout', color: 'orange', icon: '💪' },
  'language': { label: 'Language', color: 'blue', icon: '💬' },
  'cultural': { label: 'Cultural', color: 'indigo', icon: '🎭' },
  'other': { label: 'Other', color: 'gray', icon: '📋' },
};

export default function GroupMessagesPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const activityId = params.id as string;

  const form = useForm({
    initialValues: {
      message: '',
    },
    validate: {
      message: (value) => (!value.trim() ? 'Message cannot be empty' : null),
    },
  });

  useEffect(() => {
    if (activityId) {
      checkAccess();
    }
  }, [activityId, session]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const checkAccess = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setActivity(data.activity);
        setMessages(data.messages);
      } else if (response.status === 403) {
        notifications.show({
          title: 'Access Denied',
          message: 'You must be a member to view messages',
          color: 'red',
        });
        router.push(`/activities/${activityId}`);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Activity not found',
          color: 'red',
        });
        router.push('/activities');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load messages',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (values: typeof form.values) => {
    if (!values.message.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/activities/${activityId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: values.message.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        form.reset();
      } else {
        const result = await response.json();
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to send message',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send message',
        color: 'red',
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
        <Header />
        <Center style={{ minHeight: '50vh' }}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading messages...</Text>
          </Stack>
        </Center>
      </div>
    );
  }

  if (!activity) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
        <Header />
        <Container size="md" py="xl">
          <Card shadow="lg" radius="lg" p="xl">
            <Center>
              <Stack align="center">
                <Text size="4rem">😕</Text>
                <Title order={2}>Access Denied</Title>
                <Text c="dimmed">You must be a member to view group messages</Text>
                <Link href="/activities" style={{ textDecoration: 'none' }}>
                  <Button>Back to Activities</Button>
                </Link>
              </Stack>
            </Center>
          </Card>
        </Container>
      </div>
    );
  }

  const typeConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.other;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      <Header />

      <Container size="lg" py="md">
        {/* Header */}
        <Card shadow="sm" radius="md" mb="md" p="md">
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="md">
              <ActionIcon 
                component={Link}
                href={`/activities/${activityId}`} 
                variant="subtle" 
                size="lg"
                color="blue"
              >
                ←
              </ActionIcon>
              
              <div>
                <Group gap="xs" mb="xs">
                  <Badge 
                    color={typeConfig.color} 
                    leftSection={typeConfig.icon}
                    size="sm"
                    variant="light"
                  >
                    {typeConfig.label}
                  </Badge>
                </Group>
                <Title order={3}>{activity.title}</Title>
                <Text size="sm" c="dimmed">Group Chat</Text>
              </div>
            </Flex>
          </Flex>
        </Card>

        {/* Messages Container */}
        <Card shadow="lg" radius="lg" style={{ height: 'calc(100vh - 280px)' }}>
          <Stack gap={0} h="100%">
            {/* Messages Area */}
            <ScrollArea 
              ref={scrollAreaRef}
              style={{ flex: 1 }} 
              p="md"
              scrollbarSize={6}
            >
              <Stack gap="md">
                {messages.length === 0 ? (
                  <Center py="xl">
                    <Stack align="center">
                      <Text size="2rem">💬</Text>
                      <Text c="dimmed">No messages yet. Start the conversation!</Text>
                    </Stack>
                  </Center>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = session?.user?.id === message.user.id;
                    const showAvatar = index === 0 || messages[index - 1].user.id !== message.user.id;
                    
                    return (
                      <Box key={message.id}>
                        <Flex 
                          justify={isOwn ? 'flex-end' : 'flex-start'}
                          align="flex-start"
                          gap="sm"
                        >
                          {!isOwn && showAvatar && (
                            <Avatar size="sm" />
                          )}
                          {!isOwn && !showAvatar && (
                            <Box w={32} /> // Spacer for alignment
                          )}
                          
                          <Stack gap="xs" style={{ maxWidth: '70%' }}>
                            {showAvatar && (
                              <Text 
                                size="xs" 
                                c="dimmed"
                                ta={isOwn ? 'right' : 'left'}
                              >
                                {isOwn ? 'You' : (message.user.name || 'Anonymous')} • {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            )}
                            
                            <Card 
                              padding="sm"
                              radius="md"
                              style={{
                                backgroundColor: isOwn ? '#339af0' : '#f8f9fa',
                                color: isOwn ? 'white' : 'inherit',
                              }}
                              withBorder={!isOwn}
                            >
                              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                {message.content}
                              </Text>
                            </Card>
                          </Stack>
                          
                          {isOwn && showAvatar && (
                            <Avatar size="sm" />
                          )}
                          {isOwn && !showAvatar && (
                            <Box w={32} /> // Spacer for alignment
                          )}
                        </Flex>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Stack>
            </ScrollArea>

            <Divider />

            {/* Message Input */}
            <Box p="md">
              <form onSubmit={form.onSubmit(handleSendMessage)}>
                <Flex gap="sm" align="flex-end">
                  <TextInput
                    placeholder="Type your message..."
                    style={{ flex: 1 }}
                    {...form.getInputProps('message')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        form.onSubmit(handleSendMessage)();
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    loading={sending}
                    disabled={!form.values.message.trim()}
                  >
                    Send
                  </Button>
                </Flex>
              </form>
            </Box>
          </Stack>
        </Card>
      </Container>
    </div>
  );
}