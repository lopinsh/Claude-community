# Session Handoff - Next Steps

**Last Updated:** 2025-10-04
**Session Summary:** Implemented centralized tag tree store with group count display

---

## What Was Just Completed ✅

### 1. Centralized Tag Tree Store Implementation
**Sprint Plan:** `SPRINT_PLAN_GROUP_COUNTS.md`
**Summary:** `IMPLEMENTATION_SUMMARY_TAG_COUNTS.md`

**Completed Features:**
1. ✅ Created `hooks/useTagTreeStore.ts` - Single source of truth for tag hierarchy
2. ✅ Refactored LeftSidebar to display group/event counts in Level 2/3 dropdowns
3. ✅ Refactored SearchOverlay (mobile) to display counts
4. ✅ Updated Explore page to use centralized store
5. ✅ Updated CLAUDE.md with new patterns

**Key Achievement:**
- **75% reduction in API calls** (4 calls → 1 call per session)
- Users now see "Basketball (15)" style counts before filtering
- Single source of truth pattern established

**Files Modified:**
- ✨ `hooks/useTagTreeStore.ts` (NEW)
- 🔧 `components/dashboard/LeftSidebar.tsx`
- 🔧 `components/mobile/SearchOverlay.tsx`
- 🔧 `app/explore/page.tsx`
- 🔧 `components/taxonomy/TaxonomyTree.tsx`
- 📝 `CLAUDE.md`

### 2. Bug Fixes - Tag Tree Issues
**Issues Found and Fixed:**
1. ✅ Fixed missing `colorKey`, `iconName`, `description` in `/api/tags/tree` endpoint
   - **Problem:** Sidebar categories lost their colors
   - **Fix:** Added missing fields to Prisma select in `app/api/tags/tree/route.ts`

2. ✅ Fixed Level 2/3 tags not appearing when Level 1 selected
   - **Problem:** `selectedCategories` uses normalized names ("skill-and-craft"), but `getLevel2Tags()` expected IDs
   - **Fix:** Updated `hooks/useTagTreeStore.ts` to handle both IDs and normalized names

**Files Modified:**
- 🔧 `app/api/tags/tree/route.ts`
- 🔧 `hooks/useTagTreeStore.ts`

### 3. Activities Page List View Restored
**Issue:** Activities page only showed calendar view, missing the list view that existed in group detail pages

**Implemented:**
1. ✅ Added view mode toggle with List/Calendar buttons (Button.Group)
2. ✅ Implemented list view with clickable event cards
3. ✅ Cards display: title, visibility badge, event type badge, date/time, location, attendees, organizer
4. ✅ Hover effects (border color change + translateY transform)
5. ✅ Mobile-friendly touch targets (44px minimum on buttons)
6. ✅ Defaults to list view (better for scanning events)

**Files Modified:**
- 🔧 `app/activities/page.tsx`

---

## Current State of the Codebase

### Architecture
```
useTagTreeStore (Zustand)
├── Fetches /api/tags/tree once per session
├── Provides selectors: getLevel1Tags(), getLevel2Tags(), getLevel3Tags()
├── Includes _count.groups and _count.events for all tags
└── Used by: LeftSidebar, SearchOverlay, Explore page
```

### Count Display Pattern
All filter locations now show counts using:
```typescript
<Badge size="xs" variant="light" color="gray">
  {tag._count.groups + tag._count.events}
</Badge>
```

### Data Flow
```typescript
// All components use this pattern
const { fetchTree, getLevel2Tags } = useTagTreeStore();

useEffect(() => { fetchTree(); }, [fetchTree]); // Fetch once

const level2Tags = getLevel2Tags(selectedCategories); // With counts
```

---

## Immediate Next Steps (Prioritized)

### 🎯 Option 1: Clickable Group Counts (Quick Win - 1-2 hours)

**Status:** HIGH PRIORITY - Completes the feature we just built
**User Request:** *"Make it obvious that if you click on the number of groups, then it would take to the Group page, with selected filters already applied"*

**What's Needed:**

#### Phase 1: Make Explore Page Counts Clickable (30 min)
**File:** `components/taxonomy/TaxonomyTree.tsx`

Current code (line 77-86):
```typescript
<Badge size="xs" variant="light" color="gray">
  {level3Tag._count.groups} groups
</Badge>
```

Change to:
```typescript
<Badge
  size="xs"
  variant="light"
  color="gray"
  style={{ cursor: 'pointer' }}
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/?tags=${level3Tag.id}`);
  }}
  sx={{
    '&:hover': {
      backgroundColor: theme.colors.categoryBlue[1],
      transform: 'scale(1.05)',
    }
  }}
>
  {level3Tag._count.groups} groups
</Badge>
```

**Apply to all badge locations:**
- Line 77-86 (Level 3 groups badge)
- Line 82-85 (Level 3 events badge)
- Line 115 (Level 2 total badge)
- Line 197 (Level 1 groups/events text)

#### Phase 2: Update Groups Page to Read URL Params (1 hour)
**File:** `app/page.tsx`

Add URL param reading on mount:
```typescript
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFilterStore } from '@/hooks/useFilterStore';

export default function GroupsPage() {
  const searchParams = useSearchParams();
  const { setSelectedLevel3, setSelectedLevel2, setSelectedCategories } = useFilterStore();

  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tagIds = tagsParam.split(',');

      // Determine tag level and apply to correct filter
      const { getTagById } = useTagTreeStore.getState();
      tagIds.forEach(tagId => {
        const tag = getTagById(tagId);
        if (tag) {
          if (tag.level === 1) setSelectedCategories([...prev, tagId]);
          if (tag.level === 2) setSelectedLevel2([...prev, tagId]);
          if (tag.level === 3) setSelectedLevel3([...prev, tagId]);
        }
      });
    }
  }, [searchParams]);

  // Rest of component...
}
```

**Acceptance Criteria:**
- [ ] Clicking count badge in Explore page navigates to Groups page
- [ ] Groups page reads `?tags=tagId` param and applies filters
- [ ] Filters are visible in LeftSidebar (pills/badges)
- [ ] Filtered groups are displayed immediately
- [ ] Hover state shows badge is clickable (cursor pointer, subtle scale)
- [ ] Works for Level 1, Level 2, and Level 3 tags
- [ ] Multiple tags can be passed (comma-separated)

**Implementation Notes:**
- Use `router.push()` for navigation (preserves history)
- Use `e.stopPropagation()` to prevent accordion toggle
- Add subtle hover animation (scale 1.05, background color change)
- Consider adding tooltip: "Click to filter groups"

---

### 📅 Option 2: Date Range Filtering for Activities Page (Medium - 3-4 hours)

**Status:** HIGH PRIORITY - Directly from user context
**User Request:** *"Activities - create a date range for filtering"*

**What's Needed:**

#### Phase 1: Add DateRangePicker Component (1 hour)
**File:** `app/activities/page.tsx`

Install Mantine dates package (if not already):
```bash
npm install @mantine/dates dayjs
```

Add to component:
```typescript
import { DatePickerInput } from '@mantine/dates';

const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

// In JSX (desktop)
<DatePickerInput
  type="range"
  label="Filter by date"
  placeholder="Pick dates range"
  value={dateRange}
  onChange={setDateRange}
  clearable
/>

// Mobile: Use Modal with DatePicker
<Modal opened={datePickerOpened} onClose={closeDatePicker} fullScreen>
  <DatePicker type="range" value={dateRange} onChange={setDateRange} />
</Modal>
```

#### Phase 2: Update API Route (30 min)
**File:** `app/api/calendar/events/route.ts`

Add query params:
```typescript
const startDate = searchParams.get('startDate');
const endDate = searchParams.get('endDate');

const events = await prisma.event.findMany({
  where: {
    ...(startDate && { startDateTime: { gte: new Date(startDate) } }),
    ...(endDate && { endDateTime: { lte: new Date(endDate) } }),
  },
});
```

#### Phase 3: Integrate Filter & Fetch (1 hour)
Update fetch call when dateRange changes:
```typescript
useEffect(() => {
  if (dateRange[0] && dateRange[1]) {
    fetchEvents({
      startDate: dateRange[0].toISOString(),
      endDate: dateRange[1].toISOString(),
    });
  }
}, [dateRange]);
```

#### Phase 4: localStorage Persistence (30 min)
Save date range preference:
```typescript
useEffect(() => {
  if (dateRange[0] && dateRange[1]) {
    localStorage.setItem('activities-date-range', JSON.stringify(dateRange));
  }
}, [dateRange]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('activities-date-range');
  if (saved) {
    const parsed = JSON.parse(saved);
    setDateRange([new Date(parsed[0]), new Date(parsed[1])]);
  }
}, []);
```

**Acceptance Criteria:**
- [ ] DateRangePicker visible on Activities page (desktop)
- [ ] Mobile shows full-screen date picker modal
- [ ] Selecting date range filters events
- [ ] "Clear" button resets to show all events
- [ ] Date range persists in localStorage
- [ ] Calendar view updates to show selected range
- [ ] Touch targets meet 44px minimum on mobile
- [ ] Works with existing tag filters (combined filtering)

---

### 🔍 Option 3: Group Creation Flow Review (Medium - 2-3 hours)

**Status:** MEDIUM PRIORITY - Ensure consistency

**What's Needed:**

#### Phase 1: Audit Current Implementation (30 min)
**File:** `app/groups/create/page.tsx` (or similar)

Check for:
- [ ] Does it use old tag fetching pattern? (Should use `useTagTreeStore`)
- [ ] Is hierarchical selection working? (L1 → L2 → L3)
- [ ] Mobile UX issues (full-screen modal, touch targets)
- [ ] Missing validation
- [ ] Image upload support

#### Phase 2: Refactor to Use Tag Tree Store (1 hour)
Replace direct API calls with:
```typescript
const { getLevel1Tags, getLevel2Tags, getLevel3Tags } = useTagTreeStore();
```

#### Phase 3: Mobile UX Improvements (1 hour)
- Full-screen modal on mobile
- Touch-friendly inputs (48px buttons)
- Image upload with camera support
- Validation error states

**Acceptance Criteria:**
- [ ] Uses `useTagTreeStore` for tag selection
- [ ] Shows count badges in tag dropdowns
- [ ] Mobile full-screen experience
- [ ] Image upload works (desktop + mobile)
- [ ] Validation prevents empty submissions
- [ ] Success message after creation
- [ ] Navigates to new group page

---

### 👥 Option 4: Role-Based Group Views (Large - 6-8 hours)

**Status:** HIGH PRIORITY - Major UX improvement
**User Request:** *"Group pages - member view, visitor view, moderator view. Could use sidebar for specific actions"*

**What's Needed:**

#### Phase 1: Create GroupActionsSidebar Component (2 hours)
**File:** `components/groups/GroupActionsSidebar.tsx` (NEW)

```typescript
interface GroupActionsSidebarProps {
  group: Group;
  userRole: 'visitor' | 'member' | 'owner' | 'moderator';
  onEdit?: () => void;
  onCreateEvent?: () => void;
  onManageMembers?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onReport?: () => void;
}

export default function GroupActionsSidebar({
  group,
  userRole,
  ...actions
}: GroupActionsSidebarProps) {
  return (
    <Stack gap="md">
      {userRole === 'visitor' && (
        <>
          <Button onClick={actions.onJoin} fullWidth>Join Group</Button>
          <Button variant="subtle" onClick={actions.onReport}>Report</Button>
        </>
      )}

      {userRole === 'member' && (
        <>
          <Button onClick={actions.onLeave} variant="outline" fullWidth>Leave Group</Button>
        </>
      )}

      {(userRole === 'owner' || userRole === 'moderator') && (
        <>
          <Button onClick={actions.onEdit} fullWidth>Edit Group</Button>
          <Button onClick={actions.onCreateEvent} fullWidth>Create Event</Button>
          <Button onClick={actions.onManageMembers} fullWidth>Manage Members</Button>
          <Divider />
          {userRole === 'member' && (
            <Button onClick={actions.onLeave} variant="outline" fullWidth>Leave Group</Button>
          )}
        </>
      )}
    </Stack>
  );
}
```

#### Phase 2: Implement Role Detection (1 hour)
**File:** `app/groups/[id]/page.tsx`

```typescript
const getUserRole = (): 'visitor' | 'member' | 'owner' | 'moderator' => {
  if (!session) return 'visitor';
  if (group.createdById === session.user.id) return 'owner';

  const membership = group.applications?.find(
    app => app.userId === session.user.id && app.status === 'APPROVED'
  );

  if (!membership) return 'visitor';
  if (session.user.role === 'MODERATOR' || session.user.role === 'ADMIN') return 'moderator';
  return 'member';
};

const userRole = getUserRole();
```

#### Phase 3: Conditional Content Rendering (2 hours)
Show/hide content based on role:
- Visitor: Public events only, limited group info
- Member: All events, full group content, member list
- Owner/Moderator: All member features + management actions

#### Phase 4: Mobile Three-Dot Menu (1 hour)
**File:** `components/groups/GroupMobileMenu.tsx` (NEW)

ActionIcon with three dots → Bottom sheet with actions

**Acceptance Criteria:**
- [ ] Distinct views for visitor/member/owner/moderator
- [ ] Actions moved to sidebar (desktop)
- [ ] Three-dot menu → bottom sheet (mobile)
- [ ] Public events only for visitors
- [ ] All events visible to members
- [ ] Management actions for owners/moderators
- [ ] "Leave Group" confirmation modal
- [ ] "Report Group" form for visitors

---

## Additional Context for Next Session

### Key Files to Know
- **`hooks/useTagTreeStore.ts`** - Centralized tag store (NEW - just created)
- **`hooks/useFilterStore.ts`** - Filter selections with localStorage
- **`components/dashboard/LeftSidebar.tsx`** - Desktop filters (recently updated)
- **`components/mobile/SearchOverlay.tsx`** - Mobile filters (recently updated)
- **`app/explore/page.tsx`** - Explore page with clickable counts (next step)
- **`STRATEGIC_BACKLOG.md`** - All planned features

### Patterns Established
1. **Single Source of Truth:** All components use `useTagTreeStore` for tags
2. **Count Display:** `tag._count.groups + tag._count.events`
3. **Mobile-First:** Always use `useMediaQuery('(max-width: 768px)')`
4. **Touch Targets:** Minimum 44-48px on mobile
5. **No Inline Styles:** Use Mantine props (size, fw, c, etc.)

### Commands to Run Dev Server
```bash
npm run dev                    # Start Next.js (will find available port)
docker-compose up              # Start full stack with PostgreSQL
docker-compose logs app        # View app logs
```

### Testing Checklist for Any Feature
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768px)
- [ ] Mobile view (<768px)
- [ ] Dark mode
- [ ] No console errors
- [ ] Network tab shows expected API calls
- [ ] Touch targets meet 44px minimum
- [ ] TypeScript compiles without errors

---

## Quick Start for Next Session

### If Continuing with Clickable Counts (Recommended):

1. **Read these files first:**
   ```
   components/taxonomy/TaxonomyTree.tsx
   app/page.tsx
   hooks/useFilterStore.ts
   ```

2. **Review implementation plan above** (Option 1)

3. **Start coding:**
   - Add onClick to badges in TaxonomyTree
   - Add URL param reading to Groups page
   - Test navigation flow

4. **Estimated time:** 1-2 hours

### If Continuing with Date Range Filtering:

1. **Read these files first:**
   ```
   app/activities/page.tsx
   app/api/calendar/events/route.ts
   ```

2. **Install dependencies:**
   ```bash
   npm install @mantine/dates dayjs
   ```

3. **Review implementation plan above** (Option 2)

4. **Estimated time:** 3-4 hours

---

## Documentation to Reference

- **`CLAUDE.md`** - Main development guide (just updated with tag tree patterns)
- **`PROJECT_CONTEXT.md`** - Mission, features, tech stack
- **`STRATEGIC_BACKLOG.md`** - All planned features including completed mobile-first optimization
- **`architecture-diagrams.md`** - System architecture diagrams
- **`SESSION_HANDOFF.md`** - Current session status, completed work, and prioritized next steps (this file)
- **`QWEN.md`** - AI assistant context
- **`TYPOGRAPHY_GUIDE.md`** - Typography and component usage patterns

---

## Notes

- **Token Usage:** This session used ~94k tokens (out of 200k limit)
- **Implementation Speed:** Completed tag tree store in ~4 hours (estimated 5.5)
- **User Preference:** "Single source of truth, no inline tweaks, avoid duplication"
- **Current Focus:** Completing filter/discovery UX before moving to role-based views

---

## Questions to Ask User in Next Session

1. Which option do you want to pursue? (1-4 above)
2. Any issues with the count display we just implemented?
3. Any changes to priorities in STRATEGIC_BACKLOG.md?
4. Ready to test the tag tree store implementation?

---

## Status Update (October 6, 2025)

**DISCOVERY:** The features mentioned in the "Immediate Next Steps" section have already been implemented in the current codebase.

### 🎯 Option 1: Clickable Group Counts - COMPLETED ✅
**Status:** COMPLETED - This feature was already implemented in the codebase
**User Request:** *"Make it obvious that if you click on the number of groups, then it would take to the Group page, with selected filters already applied"*

**What was Found:**
- `components/taxonomy/TaxonomyTree.tsx` already has clickable badges for all levels:
  - Level 3 tags: "X groups" and "Y events" badges with onClick handlers
  - Level 2 tags: "X total" badge with onClick handlers  
  - Level 1 tags: "X groups" and "Y events" badges with onClick handlers
- All badges have proper:
  - `cursor: 'pointer'` styling
  - `e.stopPropagation()` to prevent accordion toggle conflicts
  - Hover effects (scale 1.05, background color change)
  - Navigation to `/`, `/activities` with appropriate tag parameters
  - Theme-aware styling that works in dark/light modes

### 📅 Option 2: Date Range Filtering for Activities Page - COMPLETED ✅
**Status:** COMPLETED - This feature was already implemented in the codebase
**User Request:** *"Activities - create a date range for filtering"*

**What was Found:**
- `app/activities/page.tsx` already has comprehensive date range filtering:
  - Desktop `DatePickerInput` with range selection
  - Mobile-friendly modal with date picker
  - State management for `dateRange` [startDate, endDate]
  - localStorage persistence with key `'activities-date-range'`
  - Integration with API fetch in `fetchEvents()` function
  - Support for clearing date ranges
  - Proper date formatting for API calls (toISOString)

### 🎯 Options 3 and 4: Next Priority
With options 1 and 2 already completed, the next priorities from the original document were:
- Option 3: Group Creation Flow Review (Medium Priority)
- Option 4: Role-Based Group Views (High Priority) - **COMPLETED ✅**

### 🎯 Option 4: Role-Based Group Views - COMPLETED ✅
**Status:** COMPLETED - This feature was implemented with role-based views for groups
**User Request:** *"Group pages - member view, visitor view, moderator view. Could use sidebar for specific actions"*

**What was Implemented:**
- `components/groups/GroupActionsSidebar.tsx` - Desktop sidebar with role-based actions
- `components/groups/GroupMobileMenu.tsx` - Mobile menu with role-based actions using three-dot pattern
- API endpoint updated to return user role information for each group
- Desktop view shows appropriate actions based on user role: visitor, member, owner, moderator
- Mobile view uses action menu with appropriate options based on user role
- Users can only see and perform actions appropriate to their role in each group

---

**🚀 Ready to pick up where we left off!**
