/**
 * Calendar Theme Configuration
 * Single source of truth for all calendar styling
 * Integrates with Mantine theme - supports light/dark mode automatically
 */

export const CALENDAR_CONFIG = {
  // Event type to Mantine color mapping
  eventColors: {
    REGULAR: 'categoryTeal',
    SPECIAL: 'categoryBlue',
  },

  // View configuration
  views: {
    MONTH: 'month',
    WEEK: 'week',
    DAY: 'day',
  },

  // Default view
  defaultView: 'month',

  // Mobile breakpoint (matches Mantine)
  mobileBreakpoint: 768,
} as const;

// Helper to get event color based on type
export function getEventColor(eventType: string): string {
  return CALENDAR_CONFIG.eventColors[eventType as keyof typeof CALENDAR_CONFIG.eventColors]
    || CALENDAR_CONFIG.eventColors.REGULAR;
}

// Export types
export type CalendarView = typeof CALENDAR_CONFIG.views[keyof typeof CALENDAR_CONFIG.views];
export type EventType = keyof typeof CALENDAR_CONFIG.eventColors;
