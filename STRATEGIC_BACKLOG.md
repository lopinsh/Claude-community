# Strategic Backlog & Future Enhancements

This document tracks strategic improvements and feature ideas for future development sessions.

## Completed Features

### Mobile-First Design Implementation
- **Phase 1-5 Completed:** Foundation, component adaptation, global layout, forms & input optimization, and detail pages
- **Features Implemented:**
  - AgendaView for react-big-calendar (mobile-optimized event list)
  - Bottom Navigation component (5 tabs: Discover, Interests, My Groups, News, Profile)
  - MobileLayout wrapper (provides bottom padding for navigation)
  - Swipe Indicator component (visual affordance for drawer)
  - useSwipeDrawer hook (gesture-based interactions)
  - SearchOverlay with hierarchical category filtering
  - FilterDrawer (mobile version of LeftSidebar)
  - Mobile-optimized forms (48px touch targets, full-screen modals on mobile)
  - Group/Event detail page optimizations
  - Loading skeletons and image optimization

## Priority: High

### 1. Activities Page - Date Range Filtering
**Status:** Planned
**Description:** Add date range picker to filter events by custom date ranges.

**Tasks:**
- [ ] Add DateRangePicker component (Mantine)
- [ ] Update `/api/calendar/events` route to accept `startDate` and `endDate` query params
- [ ] Add date range state to activities page
- [ ] Persist date range preference in localStorage
- [ ] Mobile-friendly date picker (bottom sheet on mobile)

---

### 2. Explore Page - Group Count Display
**Status:** Planned
**Description:** Show number of groups in each subcategory. Make counts clickable to navigate to Groups page with filters pre-applied.

**Tasks:**
- [ ] Update `/api/tags` to include `_count.groups` for each tag
- [ ] Display group counts next to Level 2 and Level 3 tags
- [ ] Make count badges clickable
- [ ] Navigate to `/` (Groups page) with `?tags=tagId` query param
- [ ] Update Groups page to read URL params and apply filters on mount
- [ ] Add visual indicator that counts are clickable (hover state, cursor pointer)

**Example:**
```
Movement & Wellness (45 groups)
├── Team Sports (23 groups) [clickable] → Navigate to /?tags=team-sports
│   ├── Basketball (8 groups) [clickable]
│   └── Soccer (12 groups) [clickable]
└── Dance (22 groups) [clickable]
```

---

### 3. Group Creation - Review & Alignment
**Status:** Needs Review
**Description:** Review group creation flow to ensure it matches current understanding of tag hierarchy, group types, and mobile UX.

**Tasks:**
- [ ] Audit `/groups/create/page.tsx` for consistency with tag system
- [ ] Ensure hierarchical tag selection works correctly (Level 1 → Level 2 → Level 3)
- [ ] Review mobile UX (full-screen modal, touch targets)
- [ ] Add image upload for group cover (with mobile camera support)
- [ ] Add validation for required fields
- [ ] Test on mobile device

---

### 4. Group Pages - Role-Based Views
**Status:** COMPLETED
**Description:** Implemented distinct views for different user roles: member, visitor, moderator/owner.

**Implementation Details:**
- Created `GroupActionsSidebar` component for desktop with role-based actions
- Created `GroupMobileMenu` component for mobile with role-based actions (three-dot menu pattern)
- Updated API to return user role in each group context
- Added `userRole` field with values: 'visitor', 'member', 'owner', 'moderator'
- Added `userApplicationStatus` field to track join request status

#### Visitor View (Not a member)
- See group info, upcoming events (public only)
- See "Join Group" (for public groups) or "Request to Join" (for private groups) button
- See "Report" option
- Hidden member-only content

#### Member View (Joined group)
- See all group content
- See all group events
- See "Leave Group" button
- See "Report" option

#### Owner View
- See all member view features
- See "Edit Group" button
- See "Create Event" button
- See "Manage Members" button
- See "Manage Applications" button
- See "Leave Group" button (to leave group)
- See "Report" option

#### Moderator View
- See all owner view features
- Can manage any group regardless of ownership
- Have additional system-level responsibilities

**Files Updated:**
- `components/groups/GroupActionsSidebar.tsx` - Desktop sidebar with role-based actions
- `components/groups/GroupMobileMenu.tsx` - Mobile menu with role-based actions
- `app/api/groups/[id]/route.ts` - Updated to return user role information
- `app/groups/[id]/page.tsx` - Updated to use role-based rendering
- `docs/role-based-views.md` - New documentation file

---

### 5. Sidebar Collapse Behavior - Toolbar Pattern
**Status:** Needs Review
**Description:** Rethink sidebar as a toolbar (not navigation) and make collapse button available on all pages.

**Current Issues:**
- Collapse button only visible on detail pages
- Sidebar treated as navigation (breadcrumbs conflict)
- No collapse option on Groups/Activities pages

**Proposed Solution:**
- Sidebar is a **filter toolbar**, not navigation
- Available on Groups page (/) and Activities page (/activities)
- Collapse button always visible in toolbar header
- Persist collapse state in localStorage
- Mobile: Sidebar becomes bottom sheet/drawer

**Tasks:**
- [ ] Remove breadcrumbs from LeftSidebar (move to page header)
- [ ] Add collapse button to LeftSidebar header (all pages)
- [ ] Implement localStorage persistence for collapse state
- [ ] Update Groups page to show collapsible sidebar
- [ ] Update Activities page to show collapsible sidebar
- [ ] Mobile: Convert sidebar to bottom drawer with swipe-to-dismiss

---

### 6. Breadcrumbs - Scope Reduction
**Status:** Planned
**Description:** Remove global breadcrumbs. Only show breadcrumbs on detail pages (Groups, Activities).

**Rationale:**
- Simple page structure doesn't need global breadcrumbs
- Breadcrumbs only useful for deep navigation (Group → Event)
- Reduces header clutter

**Tasks:**
- [ ] Remove breadcrumbs from Header component
- [ ] Only render breadcrumbs on:
  - Group Detail page: `Home > Groups > [Group Name]`
  - Event Detail page: `Home > Groups > [Group Name] > [Event Name]`
  - User Profile page: `Home > Profile > [User Name]`
- [ ] Update `useBreadcrumbs` hook to only work on detail pages
- [ ] Mobile: Show breadcrumbs as back button + title

---

### 7. Admin Tools - Review & Enhancement
**Status:** Needs Planning
**Description:** Return focus to admin dashboard and moderation tools.

**Current Admin Features:**
- Dashboard with statistics
- Tag suggestion moderation
- News/Stories management (basic)
- Page management (coming soon)

**Proposed Enhancements:**

#### Admin Dashboard
- [ ] Add charts for user growth, group creation trends
- [ ] Add quick actions (approve all pending tags, publish draft news)
- [ ] Add recent activity feed
- [ ] Add moderation queue with counts

#### Tag Moderation
- [ ] Bulk approve/deny tag suggestions
- [ ] Search and filter suggestions
- [ ] Tag usage statistics
- [ ] Merge duplicate tags tool

#### User Management (New)
- [ ] View all users
- [ ] Promote user to MODERATOR/COMPANY
- [ ] Ban/suspend users
- [ ] User activity logs

#### Group Moderation (New)
- [ ] Review reported groups
- [ ] Feature groups on homepage
- [ ] Hide/unpublish groups
- [ ] Transfer group ownership

#### Content Moderation (New)
- [ ] Review reported events
- [ ] Review reported comments (if implemented)
- [ ] Bulk content actions

**Tasks:**
- [ ] Prioritize admin features to implement
- [ ] Design admin UI patterns
- [ ] Implement user management page
- [ ] Implement group moderation tools
- [ ] Add analytics dashboard

---

## Priority: Medium

### 8. Performance Optimization
- Implement Next.js `<Image>` component across all pages
- Add loading skeletons for better perceived performance
- Code splitting for heavy components
- Run Lighthouse audits and fix Core Web Vitals

### 9. Accessibility Improvements
- Full keyboard navigation
- Screen reader support
- ARIA labels for interactive elements
- Color contrast validation

### 10. Testing
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows (Playwright)
- Mobile device testing (real devices)

---

## Priority: Low (Future)

### 11. PWA Features
- Service worker for offline support
- App manifest for install prompt
- Push notifications
- Background sync

### 12. Advanced Features
- Real-time chat for groups
- Video event integration (Zoom/Meet links)
- Payment integration for paid events (Stripe)
- Email notifications (SendGrid)
- SMS reminders (Twilio)

---

## Notes

This backlog is maintained separately from the mobile-first optimization tasks to avoid confusion. Items from this list should be reviewed and scheduled into sprints based on priority and available development time.

**Last Updated:** 2025-10-04
