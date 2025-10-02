# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

**For comprehensive context, see:**
- **`PROJECT_CONTEXT.md`**: Mission, features, tech stack, and current status
- **`MOBILE_FIRST_STATUS.md`**: Mobile optimization progress and remaining tasks
- **`TYPOGRAPHY_GUIDE.md`**: Typography and component usage patterns

## Project Overview

A Latvian community platform built with Next.js 14, featuring groups, events, and a 3-level hierarchical tagging system. The application uses Docker for containerization with PostgreSQL database and runs in development mode with hot reloading.

**Current Focus**: Mobile-first design implementation (Phases 1-4 complete, Phases 5-8 in progress).

## Development Commands

### Docker Environment (Primary Development Method)
```bash
# Start the entire stack (database + app with auto-migrations and seeding)
docker-compose up

# Restart just the app container (useful after package.json changes)
docker-compose restart app

# View logs
docker-compose logs app --tail=100 --follow

# Stop all containers
docker-compose down

# Access Prisma Studio (database GUI)
npm run db:studio
# Then visit http://localhost:5555
```

### Database Operations
```bash
# Create a new migration (run inside container)
docker-compose exec app npx prisma migrate dev --name your_migration_name

# Generate Prisma client after schema changes
docker-compose exec app npx prisma generate

# Seed the database
npm run db:seed

# Reset database (WARNING: destroys all data)
docker-compose exec app npx prisma migrate reset
```

### Local Development (Non-Docker)
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## Architecture & Key Patterns

### 1. Theme System (Mantine v8 with Coolors Palette)

**Location:** `theme/index.ts`

- **Color Palette**: Vibrant Coolors palette (https://coolors.co/palette/f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1)
  - `categoryRed` (#f94144), `categoryOrange` (#f3722c), `categoryLightOrange` (#f8961e)
  - `categoryPeach` (#f9844a), `categoryYellow` (#f9c74f), `categoryGreen` (#90be6d)
  - `categoryTeal` (#43aa8b), `categoryBlueGreen` (#4d908e), `categoryBlue` (#577590), `categoryDarkBlue` (#277da1)
- **Dark Mode**: Fully implemented with Mantine's `useMantineColorScheme()` hook
- **Color Shades**: Each color has 10 shades [0-9], use shade [5] for base color
- **Theme Props**: Store common values in `theme.other` for light/dark variants

**CRITICAL: Never use inline styles** - Always use Mantine component props:
- `size="sm"` not `fontSize: '14px'`
- `fw={600}` not `fontWeight: 600`
- `c="categoryBlue"` not `color: '#577590'`
- See `TYPOGRAPHY_GUIDE.md` for full reference

### 2. Category System (3-Level Hierarchy)

**Location:** `utils/categoryColors.ts`

Six Level 1 categories, each mapped to a color from the Coolors palette:
- **Skill & Craft** (categoryTeal) - IconBrain
- **Movement & Wellness** (categoryGreen) - IconHeart
- **Gathering & Fun** (categoryPeach) - IconUsersGroup
- **Performance & Spectacle** (categoryBlue) - IconTheater
- **Civic & Governance** (categoryOrange) - IconBuilding
- **Practical & Resource** (categoryYellow) - IconTool

**Database Structure:**
- Level 1: Broad categories (6 fixed categories above)
- Level 2: Domains (e.g., "Team Sports", "Individual Sports")
- Level 3: Specific focus (e.g., "Basketball", "Soccer")

Tags use many-to-many relationships via `TagsOnGroups` table.

### 3. Authentication & Authorization (NextAuth.js v4)

**Location:** `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts`

- Credentials provider with bcrypt password hashing
- Prisma adapter for session storage
- Session strategy: JWT (includes `user.id` and `user.role`)
- User model has `password` field (nullable for OAuth future support)

**Role-Based Access Control (RBAC):**
- **Location:** `lib/authorization.ts`
- **User Roles:** `USER` (default), `MODERATOR`, `COMPANY`, `ADMIN`
- **Session includes role:** Access via `session.user.role`
- **Authorization helpers:**
  - `isAdmin(session)` - Check if user is admin
  - `isModerator(session)` - Check if user is moderator or admin
  - `canAccessAdminDashboard(session)` - Check admin access
  - `canManageTags(session)` - Can create tags without approval
  - `canPublishNews(session)` - Can publish news articles
  - `requireModerator(session)` - API route helper for auth checks

**Admin User:**
- Email: `ofeldmanis@gmail.com`
- Password: `123456`
- Role: `ADMIN`
- Created via: `scripts/create-admin.ts`

### 4. Database Schema (Prisma + PostgreSQL)

**Key Models:**
- `User` - Authentication + profile (with `role`: USER/MODERATOR/COMPANY/ADMIN)
- `Group` - Community groups (with `groupType`: PUBLIC/PRIVATE/SINGLE_EVENT)
- `Event` - Calendar events (with `visibility`: PUBLIC/MEMBERS_ONLY/PRIVATE)
- `Tag` - 3-level hierarchy system
- `TagSuggestion` - User-submitted tag suggestions (moderated by MODERATOR/ADMIN)
- `Application` - Join requests with approval workflow
- `EventAttendee` - Event RSVP tracking
- `Notification` - In-app notifications
- `NewsArticle` - Community news/blog posts (created by MODERATOR/ADMIN)
- `Page` - Custom pages (created by MODERATOR/ADMIN)

**Important Relations:**
- Groups have multiple events
- Groups have tags via `TagsOnGroups` join table
- Users can create groups and apply to join others
- Events require event attendance records, not just group membership

### 5. State Management

**Zustand Stores:**
- `useBreadcrumbStore` - Custom breadcrumb navigation (location: `hooks/useBreadcrumbs.ts`)

**Mantine Hooks:**
- `useMantineColorScheme()` - Theme toggle (light/dark)
- `useMediaQuery()` - Responsive breakpoints
- `useDisclosure()` - Modal/drawer state

### 6. Component Architecture

**Layout Components:**
- `Header` - Top nav with theme toggle, breadcrumbs, auth, and admin menu (for MODERATOR/ADMIN)
- `LeftSidebar` - Category filters (collapsible)
- `ContextualSidebar` - Page-specific actions (right side)
- `Footer` - Airbnb-style responsive footer with expandable sections on mobile (full dark mode support)

**Dashboard Pattern:**
```
<LeftSidebar />
<MainContent>
  <Tabs: All | Groups | Events | Calendar>
  <Search Bar>
  <Grid of GroupCard/EventCard>
</MainContent>
<ContextualSidebar />
```

**Card Components:**
- Use `Card` from Mantine with `radius="xl"` and `withBorder`
- Hover effects via `onMouseEnter/onMouseLeave` with `transform: translateY(-4px)`
- Always use `theme.shadows.xl` for elevated state

**Calendar Component:**
- `EventCalendar` - Simplified list view of events (replaces react-lightweight-calendar)
- Mobile uses `AgendaView` for better UX
- Desktop shows events in a simple vertical list for now
- Future: Can be enhanced with Mantine's @mantine/dates Calendar component

### 7. API Routes (Next.js App Router)

**Location:** `app/api/`

Pattern: Route handlers in `route.ts` files

**Public Routes:**
- `GET /api/groups` - List groups with filtering
- `POST /api/groups` - Create group
- `GET /api/discover` - Combined groups + public events
- `GET /api/calendar/events` - User's calendar (auth required)
- `GET /api/news` - List published news articles
- `GET /api/news/[slug]` - Get single published article

**Admin/Moderator Routes (require `requireModerator()` check):**
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/tag-suggestions` - List pending tag suggestions
- `PATCH /api/admin/tag-suggestions/[id]` - Approve/deny/merge tag suggestion
- `GET /api/admin/news` - List all news articles (drafts + published)
- `POST /api/admin/news` - Create news article
- `GET /api/admin/news/[id]` - Get single article for editing
- `PATCH /api/admin/news/[id]` - Update news article
- `DELETE /api/admin/news/[id]` - Delete news article

**Query Filtering:**
- Tags: `?tags=tag1,tag2` (OR logic)
- Location: `?location=Riga`
- Search: `?search=query` (searches title + description)

### 8. Docker Container Workflow

The app container startup sequence (see `docker-compose.yml`):
1. Wait for PostgreSQL health check
2. Run `prisma generate`
3. Run `prisma migrate deploy`
4. Run seeding script
5. Start `npm run dev`

**Important:** After changing dependencies in `package.json`, restart the container:
```bash
docker-compose restart app
```

## Common Patterns

### Creating New Pages
1. Add route in `app/` directory
2. Use `'use client'` directive if using hooks
3. Wrap in session check with `useSession()` if auth required
4. Import theme with `useMantineTheme()` for styling

### Adding New Components
1. Use TypeScript with proper interfaces
2. Import Mantine components from `@mantine/core`
3. Use `theme.colors[colorName][shade]` for colors
4. Never use hardcoded hex colors or inline font sizes

### Database Changes
1. Edit `prisma/schema.prisma`
2. Run migration: `docker-compose exec app npx prisma migrate dev --name migration_name`
3. Update seed file if needed: `prisma/seed.ts`

### API Route Creation
1. Create `app/api/[route]/route.ts`
2. Export `GET`, `POST`, `PUT`, or `DELETE` functions
3. Use Prisma client for database queries
4. Return `NextResponse.json()` for responses

## Mobile-First Design (NEW - 2025)

The platform has been refactored for mobile-first responsive design. All new components and pages MUST follow these patterns:

### Mobile Component Library

**Location:** `components/mobile/`

- **BottomNavigation** - Fixed bottom nav bar (5 items: Discover, Interests, My Groups, News, Profile)
- **MobileLayout** - Wrapper component that shows/hides bottom nav and adds proper spacing
- **SearchOverlay** - Full-screen search modal with debounced search and category filters
- **AgendaView** - Mobile-optimized calendar view (list-style, coming soon)

**Usage Pattern:**
```tsx
import { MobileLayout } from '@/components/mobile';

export default function MyPage() {
  return (
    <MobileLayout>
      {/* Your page content */}
    </MobileLayout>
  );
}
```

### Responsive Design Rules

1. **Always use `useMediaQuery` for mobile detection:**
   ```tsx
   const isMobile = useMediaQuery('(max-width: 768px)');
   ```

2. **Use Mantine's responsive props:**
   ```tsx
   <Box p={{ base: 'md', lg: 'xl' }}>
   <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
   ```

3. **Breakpoints:**
   - Mobile: <768px (base)
   - Tablet: 768-992px (sm)
   - Desktop: >992px (lg)

4. **Cards must be responsive:**
   - Use `h={isMobile ? undefined : 380}` not fixed heights
   - Add `mih={280}` for minimum height on mobile
   - Increase padding on mobile: `p={isMobile ? 'lg' : 'md'}`

5. **Touch targets:**
   - Minimum 44px × 44px on mobile
   - Use larger `size` props on mobile: `size={isMobile ? 'xl' : 'lg'}`

6. **Hide/Show components based on screen size:**
   ```tsx
   {!isMobile && <LeftSidebar />}
   {isMobile && <MobileFilterDrawer />}
   ```

### Calendar Implementation

**Current:** Simplified list view (location: `components/events/EventCalendar.tsx`)

- Desktop: Events displayed in a vertical list
- Mobile: AgendaView component for simplified list view
- Uses Mantine components for consistency with theme

**Note:** Removed `react-lightweight-calendar` due to deprecated node-sass dependency issues. Future enhancement can use Mantine's @mantine/dates Calendar component if needed.

### Footer Component

**Location:** `components/layout/Footer.tsx`

- Airbnb-style responsive footer
- Desktop: 3-column grid layout
- Mobile: Accordion expandable sections
- Must be added to all page layouts

## Critical Rules

1. **Mantine Components Only**: Use Mantine's component library, avoid custom HTML/CSS unless absolutely necessary

2. **Theme Colors**: Always reference `theme.colors` - never hardcode colors. Use Coolors palette color names for categories.

3. **Dark Mode Support**: All components must work in both light and dark modes. Use `useMantineColorScheme()` to check current mode.

4. **Typography**: Follow `TYPOGRAPHY_GUIDE.md` strictly - use `size`, `fw`, `c` props instead of inline styles.

5. **Mobile-First**: Always design for mobile first, then add desktop enhancements. Use `useMediaQuery` and responsive props.

6. **Database Migrations**: Never modify migration files. Create new migrations for schema changes.

7. **Container Restarts**: After npm package changes, always restart the Docker container.

## File Structure

```
app/                   # Next.js App Router pages
  api/                 # API routes
    admin/             # Admin-only API routes (require MODERATOR/ADMIN role)
      stats/           # Dashboard statistics
      tag-suggestions/ # Tag suggestion moderation
      news/            # News article management
    news/              # Public news API routes
  auth/                # Auth pages (signin/signup)
  groups/              # Group pages
  events/              # Event pages
  calendar/            # Calendar view (coming soon)
  interests/           # Interests/browse page (coming soon)
  news/                # News/blog pages (public)
    [slug]/            # Individual article pages
  admin/               # Admin dashboard (MODERATOR/ADMIN only)
    tag-suggestions/   # Tag moderation interface
    news/              # News management (coming soon)
    pages/             # Page management (coming soon)

components/            # React components
  dashboard/           # MainContent, LeftSidebar
  layout/              # Header, Footer, ContextualSidebar
  mobile/              # Mobile-specific components (NEW)
    BottomNavigation.tsx
    MobileLayout.tsx
    SearchOverlay.tsx
    AgendaView.tsx (coming soon)
  groups/              # GroupCard, CreateGroupModal
  events/              # EventCard, EventCalendar
  common/              # Shared components (TagBadge, etc.)

prisma/                # Database schema and migrations
  schema.prisma        # Database schema (includes UserRole, NewsArticle, Page)
  seed.ts              # Seed data

theme/                 # Mantine theme configuration
  index.ts             # Main theme file (Coolors palette)

lib/                   # Core utilities and configuration
  auth.ts              # NextAuth configuration with role support
  authorization.ts     # RBAC helpers (isAdmin, isModerator, etc.)
  prisma.ts            # Prisma client instance

utils/                 # Utility functions
  categoryColors.ts    # Category to color mappings
  tagUtils.ts          # Tag hierarchy helpers
  responsive.ts        # Mobile/responsive utilities (NEW)
  navigation.ts        # Unified navigation configuration

scripts/               # Utility scripts
  create-admin.ts      # Create admin user script
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@postgres:5432/community_platform"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your-password"
```

**Note:** The `ADMIN_EMAILS` environment variable is deprecated. Use the role-based system instead.

## Admin & Moderation Features

### Admin Dashboard

**URL:** `/admin`
**Access:** MODERATOR and ADMIN roles only

Features:
- Platform statistics (users, groups, articles, pages)
- Moderation queue overview (pending tag suggestions, groups)
- Quick actions (create news, create page, create tag)
- Links to all admin management pages

### Tag Suggestion Moderation

**URL:** `/admin/tag-suggestions`
**Access:** MODERATOR and ADMIN roles

Moderators can:
- Review user-submitted Level 3 tag suggestions
- Approve suggestions (creates new tag in taxonomy)
- Deny suggestions (with optional moderator notes)
- Merge suggestions into existing tags
- Track moderation history

Regular users can only suggest Level 3 tags. Moderators can create tags at any level without approval.

### News Management

**URL:** `/admin/news` (coming soon)
**Access:** MODERATOR and ADMIN roles

Features:
- Create/edit/publish news articles
- Draft system (save without publishing)
- Rich text editor (basic textarea for now, enhance with Tiptap later)
- Featured images and excerpts
- Author attribution with role badges

**Public View:** `/news` - Lists published articles
**Single Article:** `/news/[slug]` - View individual article

### Page Management

**URL:** `/admin/pages` (coming soon)
**Access:** MODERATOR and ADMIN roles

Features:
- Create custom pages (About, Terms, Privacy, etc.)
- Manage page slugs for custom URLs
- Publish/unpublish pages
- Pages appear in footer navigation

### Role Permissions Matrix

| Feature | USER | MODERATOR | COMPANY | ADMIN |
|---------|------|-----------|---------|-------|
| Create groups | ✓ | ✓ | ✓ | ✓ |
| Suggest Level 3 tags | ✓ | ✓ | ✓ | ✓ |
| Create tags (any level) | ✗ | ✓ | ✗ | ✓ |
| Approve tag suggestions | ✗ | ✓ | ✗ | ✓ |
| Create/publish news | ✗ | ✓ | ✗ | ✓ |
| Create/edit pages | ✗ | ✓ | ✗ | ✓ |
| Access admin dashboard | ✗ | ✓ | ✗ | ✓ |
| Manage all groups | ✗ | ✗ | ✗ | ✓ |
| Manage users | ✗ | ✗ | ✗ | ✓ |
| Premium features | ✗ | ✗ | ✓ | ✓ |

### Creating New Admin Users

To promote a user to MODERATOR or ADMIN:
1. Use Prisma Studio: `npm run db:studio`
2. Find the user in the `users` table
3. Change the `role` field to `MODERATOR` or `ADMIN`
4. User must log out and log back in for role to take effect

Or use a migration script (recommended for production).

## Troubleshooting

**Prisma Client not found:**
```bash
docker-compose exec app npx prisma generate
docker-compose restart app
```

**Database connection errors:**
- Check PostgreSQL container is running: `docker-compose ps`
- Verify DATABASE_URL in `.env`
- Wait for healthcheck: `docker-compose logs postgres`

**Module not found after npm install:**
```bash
docker-compose restart app
# If that doesn't work:
docker-compose down && docker-compose up --build
```

**Hot reload not working:**
- Ensure `WATCHPACK_POLLING=true` in docker-compose.yml
- Volume mounts should exclude `/app/node_modules` and `/app/.next`