'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Text, Stack, Loader, Center, Button, Group } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useMediaQuery } from '@mantine/hooks';
import { useDisclosure } from '@mantine/hooks';
import { IconCompass } from '@tabler/icons-react';
import TaxonomyTree from '@/components/taxonomy/TaxonomyTree';
import SuggestTagModal from '@/components/taxonomy/SuggestTagModal';
import MainLayout from '@/components/layout/MainLayout';

interface TagNode {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  _count: {
    groups: number;
    events: number;
  };
  children?: TagNode[];
}

export default function ExplorePage() {
  const { data: session } = useSession();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [tree, setTree] = useState<TagNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentTag, setSelectedParentTag] = useState<TagNode | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [allLevel2Tags, setAllLevel2Tags] = useState<TagNode[]>([]);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags/tree');
      const data = await response.json();

      if (data.tree) {
        setTree(data.tree);

        // Extract all Level 2 tags for the suggestion modal
        const level2Tags: TagNode[] = [];
        data.tree.forEach((level1: TagNode) => {
          if (level1.children) {
            level2Tags.push(...level1.children);
          }
        });
        setAllLevel2Tags(level2Tags);
      }
    } catch (error) {
      console.error('Failed to fetch taxonomy tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTag = (parentTag: TagNode) => {
    setSelectedParentTag(parentTag);
    openModal();
  };

  const handleModalClose = () => {
    setSelectedParentTag(null);
    closeModal();
  };

  return (
    <MainLayout>
      <Container size="xl" py={isMobile ? 'md' : 'xl'}>
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={isMobile ? 2 : 1} mb="xs">
                Explore Interests
              </Title>
              <Text c="dimmed" size={isMobile ? 'sm' : 'md'}>
                Browse our community's interest taxonomy and suggest new tags
              </Text>
            </div>

            {session && !loading && (
              <Button
                variant="light"
                color="categoryBlue"
                onClick={() => openModal()}
                size={isMobile ? 'sm' : 'md'}
              >
                Suggest Tag
              </Button>
            )}
          </Group>

          {/* Loading State */}
          {loading && (
            <Center h={400}>
              <Loader size="lg" color="categoryBlue" />
            </Center>
          )}

          {/* Taxonomy Tree */}
          {!loading && tree.length > 0 && (
            <TaxonomyTree
              tree={tree}
              onSuggestTag={session ? handleSuggestTag : undefined}
            />
          )}

          {/* Empty State */}
          {!loading && tree.length === 0 && (
            <Center h={400}>
              <Stack align="center" gap="md">
                <IconCompass size={48} color="#999" />
                <Text c="dimmed" size="lg">
                  No taxonomy data available
                </Text>
              </Stack>
            </Center>
          )}

          {/* Login Prompt */}
          {!session && !loading && (
            <Text size="sm" c="dimmed" ta="center" mt="xl">
              Sign in to suggest new tags and help grow our community taxonomy
            </Text>
          )}
        </Stack>

        {/* Suggestion Modal */}
        <SuggestTagModal
          opened={modalOpened}
          onClose={handleModalClose}
          parentTag={selectedParentTag}
          allLevel2Tags={allLevel2Tags}
        />
      </Container>
    </MainLayout>
  );
}
