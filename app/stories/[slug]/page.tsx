'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Group,
  Avatar,
  Badge,
  Loader,
  Center,
  useMantineColorScheme,
} from '@mantine/core';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import { getRoleBadge } from '@/lib/authorization';

interface StoryArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
}

export default function StoryArticlePage() {
  const { colorScheme } = useMantineColorScheme();
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<StoryArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchArticle(params.slug as string);
    }
  }, [params.slug]);

  const fetchArticle = async (slug: string) => {
    try {
      const response = await fetch(`/api/stories/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
      } else {
        router.push('/stories');
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
      router.push('/stories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box mih="100vh" bg={colorScheme === 'dark' ? 'dark.7' : 'gray.0'}>
        <Header />
        <Center h="80vh">
          <Loader size="lg" />
        </Center>
      </Box>
    );
  }

  if (!article) {
    return null;
  }

  const roleBadge = getRoleBadge(article.author.role as any);

  return (
    <Box mih="100vh" bg={colorScheme === 'dark' ? 'dark.7' : 'gray.0'}>
      <Header />
      <Container size="md" py="xl">
        <Stack gap="xl">
          {/* Featured Image */}
          {article.featuredImage && (
            <Box
              pos="relative"
              h={400}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                style={{ objectFit: 'cover' }}
                priority
              />
            </Box>
          )}

          {/* Article Header */}
          <Stack gap="md">
            <Title order={1}>{article.title}</Title>

            <Group gap="md">
              <Group gap="xs">
                <Avatar src={article.author.image} size="md" radius="xl">
                  <IconUser size={20} />
                </Avatar>
                <div>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      {article.author.name || 'Anonymous'}
                    </Text>
                    {(article.author.role === 'ADMIN' || article.author.role === 'MODERATOR') && (
                      <Badge size="xs" color={roleBadge.color}>
                        {roleBadge.label}
                      </Badge>
                    )}
                  </Group>
                  <Group gap={4}>
                    <IconCalendar size={14} />
                    <Text size="xs" c="dimmed">
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </Group>
                </div>
              </Group>
            </Group>
          </Stack>

          {/* Article Content */}
          <Box
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: '16px',
            }}
          >
            {article.content}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
