# Strategic Backlog & Future Enhancements

This document tracks strategic improvements and feature ideas for future development sessions.

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
**Status:** Planned
**Description:** Implement distinct views for different user roles: member, visitor, moderator/owner.

**Current Implementation:**
- Single view with `isOwner` check for some buttons

**Proposed Changes:**

#### Visitor View (Not a member)
- Show group info, upcoming events (public only)
- Prominent "Join Group" button
- Hide member-only content
- Show limited event details

#### Member View (Joined group)
- Show all group content
- Access to member-only events
- Leave Group button
- RSVP to events
- View other members

#### Moderator/Owner View
- All member view features
- Edit Group button (opens edit modal)
- Create Event button
- Manage members (approve/remove)
- Delete events
- Group settings

**Sidebar Actions:**
- Move role-specific actions to sidebar (not inline)
- Desktop: ContextualSidebar on right
- Mobile: Bottom sheet or action menu (three dots)

**Tasks:**
- [ ] Create `GroupActionsSidebar` component
- [ ] Implement role-based action visibility
- [ ] Move "Edit Group", "Create Event", "Manage Members" to sidebar
- [ ] Add "Leave Group" action for members
- [ ] Add "Report Group" action for visitors
- [ ] Mobile: Three-dot menu in header → opens bottom sheet with actions

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
