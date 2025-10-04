/**
 * CalendarHeader Component
 * Navigation and view controls - theme-aware
 */

import { Group, Button, Text, ActionIcon, useMantineTheme, useMantineColorScheme, Box } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { format } from 'date-fns';
import { CalendarView } from './theme';

interface CalendarHeaderProps {
  currentDate: Date;
  currentView: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  showViewSwitcher?: boolean;
}

export default function CalendarHeader({
  currentDate,
  currentView,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  showViewSwitcher = true,
}: CalendarHeaderProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box
      p="md"
      sx={{
        borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        {/* Navigation Controls */}
        <Group gap="sm">
          <ActionIcon
            variant="default"
            onClick={onPrevious}
            size="lg"
            aria-label="Previous"
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon
            variant="default"
            onClick={onNext}
            size="lg"
            aria-label="Next"
          >
            <IconChevronRight size={16} />
          </ActionIcon>
          <Button
            variant="filled"
            color="categoryBlue"
            onClick={onToday}
            size="sm"
          >
            Today
          </Button>
        </Group>

        {/* Current Date Display */}
        <Text fw={600} size="lg">
          {format(currentDate, 'MMMM yyyy')}
        </Text>

        {/* View Switcher */}
        {showViewSwitcher && (
          <Group gap="xs">
            <Button
              variant={currentView === 'month' ? 'filled' : 'default'}
              color="categoryBlue"
              onClick={() => onViewChange('month')}
              size="sm"
            >
              Month
            </Button>
            <Button
              variant={currentView === 'week' ? 'filled' : 'default'}
              color="categoryBlue"
              onClick={() => onViewChange('week')}
              size="sm"
            >
              Week
            </Button>
            <Button
              variant={currentView === 'day' ? 'filled' : 'default'}
              color="categoryBlue"
              onClick={() => onViewChange('day')}
              size="sm"
            >
              Day
            </Button>
          </Group>
        )}
      </Group>
    </Box>
  );
}
