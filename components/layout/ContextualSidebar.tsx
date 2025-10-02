import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Stack,
  UnstyledButton,
  Group,
  Text,
  Box,
  useMantineTheme,
  useMantineColorScheme
} from '@mantine/core';
import { IconArrowLeft, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface ContextualSidebarProps {
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function ContextualSidebar({
  backHref = '/',
  backLabel = 'Back to Discover',
  children,
  isCollapsed = false,
  onToggleCollapse
}: ContextualSidebarProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    // Try to go back in history first
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(backHref);
    }
  };

  return (
    <Paper
      p={isCollapsed ? "xs" : "sm"}
      style={{
        width: isCollapsed ? 60 : 320,
        height: 'calc(100vh - 64px)',
        borderRadius: 0,
        borderRight: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 64
      }}
    >
      {/* Toggle Button */}
      {onToggleCollapse && (
        <Box pos="absolute" top={12} right={isCollapsed ? 8 : 12} style={{ zIndex: 10 }}>
          <UnstyledButton
            onClick={onToggleCollapse}
            p="xs"
            style={{
              borderRadius: theme.radius.sm,
              backgroundColor: colorScheme === 'dark' ? theme.colors.dark[5] : 'white',
              transition: theme.other.transition,
              boxShadow: theme.shadows.sm,
              border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[0];
              e.currentTarget.style.boxShadow = theme.shadows.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[5] : 'white';
              e.currentTarget.style.boxShadow = theme.shadows.sm;
            }}
          >
            {isCollapsed ? (
              <IconChevronRight size={16} color={colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[6]} />
            ) : (
              <IconChevronLeft size={16} color={colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[6]} />
            )}
          </UnstyledButton>
        </Box>
      )}

      {/* Content */}
      {!isCollapsed ? (
        <Stack gap="lg" pt={52} h="100%">
          {/* Back Button */}
          <UnstyledButton
            component={Link}
            href={backHref}
            onClick={handleBack}
            p="md"
            style={{
              borderRadius: theme.radius.sm,
              backgroundColor: colorScheme === 'dark' ? theme.colors.dark[5] : 'white',
              border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
              transition: theme.other.transition
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[0];
              e.currentTarget.style.borderColor = theme.colors.categoryBlue[5];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[5] : 'white';
              e.currentTarget.style.borderColor = colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2];
            }}
          >
            <Group gap="sm">
              <IconArrowLeft size={18} color={theme.colors.categoryBlue[5]} />
              <Text size="sm" fw={500} c="categoryBlue">
                {backLabel}
              </Text>
            </Group>
          </UnstyledButton>

          {/* Custom Content */}
          {children}
        </Stack>
      ) : (
        <Stack gap="xs" align="center" pt={52}>
          {/* Back Icon Only */}
          <UnstyledButton
            component={Link}
            href={backHref}
            onClick={handleBack}
            p={10}
            style={{
              borderRadius: theme.radius.sm,
              backgroundColor: colorScheme === 'dark' ? theme.colors.dark[5] : 'white',
              border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
              transition: theme.other.transition
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[0];
              e.currentTarget.style.borderColor = theme.colors.categoryBlue[5];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colorScheme === 'dark' ? theme.colors.dark[5] : 'white';
              e.currentTarget.style.borderColor = colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2];
            }}
          >
            <IconArrowLeft size={20} color={theme.colors.categoryBlue[5]} />
          </UnstyledButton>
        </Stack>
      )}
    </Paper>
  );
}