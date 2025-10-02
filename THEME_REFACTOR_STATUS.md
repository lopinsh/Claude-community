# Theme Refactoring Status

## Summary
Tracking the migration from inline styles to Mantine theme system.

## Completed
- ✅ Theme file created (`theme/index.ts`)
- ✅ Layout updated with theme provider
- ✅ dracula-mantine installed

## Pages Status

### Main Pages
- [ ] `/app/page.tsx` - Main discover page
- [ ] `/app/auth/signin/page.tsx` - Login page
- [ ] `/app/auth/signup/page.tsx` - Register page
- [ ] `/app/profile/page.tsx` - User profile
- [ ] `/app/groups/[id]/page.tsx` - Group detail
- [ ] `/app/groups/create/page.tsx` - Create group
- [ ] `/app/events/[id]/page.tsx` - Event detail
- [ ] `/app/calendar/page.tsx` - Calendar view

### Layout Components
- [ ] `components/layout/Header.tsx` - **HAS SYNTAX ERROR**
- [ ] `components/layout/NavigationSidebar.tsx` - **HAS SYNTAX ERROR**
- [ ] `components/layout/ContextualSidebar.tsx`

### Sidebar Components
- [ ] `components/sidebars/GroupDetailSidebar.tsx`
- [ ] `components/sidebars/ProfileSidebar.tsx`
- [ ] `components/sidebars/CreateGroupSidebar.tsx`
- [ ] `components/dashboard/LeftSidebar.tsx`

### Card Components (Priority)
- [ ] `components/groups/GroupCard.tsx` - Heavy inline styles
- [ ] `components/events/EventCard.tsx` - Heavy inline styles

### Dashboard Components
- [ ] `components/dashboard/MainContent.tsx`

### Modal Components
- [ ] `components/groups/CreateGroupModal.tsx`
- [ ] `components/events/EventDetailModal.tsx`
- [ ] `components/events/CreateEventModal.tsx`

### Other Components
- [ ] `components/events/EventCalendar.tsx`
- [ ] `components/NotificationBell.tsx`
- [ ] `components/UserAvatar.tsx`

## Known Issues
1. **Header.tsx** - Syntax error at line 85 (JSX fragment issue)
2. **NavigationSidebar.tsx** - Syntax error at line 80 (Paper component)
3. **Notifications API** - Prisma error with `activity` field

## Pattern to Follow

### Before (Inline Styles)
```tsx
<div style={{
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  border: '1px solid #f1f5f9',
  padding: '16px'
}}>
```

### After (Theme-based)
```tsx
<Paper
  bg="white"
  radius="xl"
  p="md"
>
```

### Using Theme in Components
```tsx
import { useMantineTheme } from '@mantine/core';

const theme = useMantineTheme();
// Access: theme.colors.indigo[5], theme.spacing.md, etc.
// Or use theme.other for custom values
```

## Files with Heavy Inline Styling (by count)
1. `components/groups/GroupCard.tsx` - ~50+ style properties
2. `components/events/EventCard.tsx` - ~50+ style properties
3. `components/layout/Header.tsx` - ~30+ style properties
4. `components/dashboard/MainContent.tsx` - ~25+ style properties
5. `app/auth/signin/page.tsx` - ~30+ style properties
6. `app/auth/signup/page.tsx` - ~35+ style properties

## Next Steps
1. Fix syntax errors in Header and NavigationSidebar
2. Refactor GroupCard and EventCard (most visual impact)
3. Refactor auth pages
4. Refactor remaining components systematically
5. Update categoryColors.ts to return theme color names