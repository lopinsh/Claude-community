'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Center,
  ThemeIcon,
  Card,
  Group,
  Avatar,
  Badge,
  Loader,
  useMantineColorScheme,
  useMantineTheme
} from '@mantine/core'
import { IconSparkles, IconCalendar, IconUser } from '@tabler/icons-react'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'

interface StoryArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

export default function StoriesPage() {
  const { colorScheme } = useMantineColorScheme()
  const theme = useMantineTheme()
  const [articles, setArticles] = useState<StoryArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/stories')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Box>
            <Title order={1} mb="sm">Community Stories</Title>
            <Text size="lg" c="dimmed">
              Celebrating positive impact and shared experiences in our community
            </Text>
          </Box>

          {loading ? (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          ) : articles.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <ThemeIcon size={80} radius="xl" variant="light" color="categoryBlue">
                  <IconSparkles size={40} />
                </ThemeIcon>
                <Title order={3} c="dimmed">No stories yet</Title>
                <Text c="dimmed" ta="center" maw={400}>
                  Check back soon for inspiring stories and positive impact from the community!
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="md">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  component={Link}
                  href={`/stories/${article.slug}`}
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer', textDecoration: 'none' }}
                >
                  <Stack gap="md">
                    {article.featuredImage && (
                      <Box
                        h={200}
                        style={{
                          backgroundImage: `url(${article.featuredImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: theme.radius.md,
                        }}
                      />
                    )}

                    <Stack gap="xs">
                      <Title order={3}>{article.title}</Title>

                      {article.excerpt && (
                        <Text size="sm" c="dimmed" lineClamp={3}>
                          {article.excerpt}
                        </Text>
                      )}

                      <Group gap="xs">
                        <Avatar
                          src={article.author.image}
                          size="sm"
                          radius="xl"
                        >
                          <IconUser size={16} />
                        </Avatar>
                        <Text size="sm" c="dimmed">
                          {article.author.name || 'Anonymous'}
                        </Text>
                        <Text size="sm" c="dimmed">•</Text>
                        <Group gap={4}>
                          <IconCalendar size={14} />
                          <Text size="sm" c="dimmed">
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </Text>
                        </Group>
                      </Group>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </MainLayout>
  )
}
