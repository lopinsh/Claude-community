import { IconUsers, IconCompass, IconCalendar, IconNews, IconCategory, IconSearch } from '@tabler/icons-react';

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
    key: 'news',
    label: 'News',
    href: '/news',
    icon: IconNews,
    showInMobile: true,
    showInDesktop: true,
  },
];

// Helper functions to get filtered items
export const getMobileNavItems = () => NAV_ITEMS.filter(item => item.showInMobile);
export const getDesktopNavItems = () => NAV_ITEMS.filter(item => item.showInDesktop);
