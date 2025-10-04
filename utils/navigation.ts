import { IconUsers, IconCompass, IconCalendar, IconSparkles, IconCategory, IconSearch } from '@tabler/icons-react';

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  badge?: number;
  showInMobile?: boolean;
  showInDesktop?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'groups',
    label: 'Groups',
    href: '/',
    icon: IconUsers,
    showInMobile: true,
    showInDesktop: true,
  },
  {
    key: 'activities',
    label: 'Activities',
    href: '/activities',
    icon: IconCalendar,
    showInMobile: true,
    showInDesktop: true,
  },
  {
    key: 'explore',
    label: 'Explore',
    href: '/explore',
    icon: IconCompass,
    showInMobile: true,
    showInDesktop: true,
  },
  {
    key: 'stories',
    label: 'Stories',
    href: '/stories',
    icon: IconSparkles,
    showInMobile: true,
    showInDesktop: true,
  },
];

// Helper functions to get filtered items
export const getMobileNavItems = () => NAV_ITEMS.filter(item => item.showInMobile);
export const getDesktopNavItems = () => NAV_ITEMS.filter(item => item.showInDesktop);
