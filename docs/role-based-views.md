# Role-Based Group Views

## Overview
The platform now supports role-based views for group pages, showing different content and actions based on a user's relationship to each group. This improves the user experience by presenting relevant options and information based on membership and permission levels.

## Implemented Roles

### Visitor
- User is not logged in or is logged in but not a member of the group
- Sees public information about the group
- Has options to join (for public groups) or request to join (for private groups)
- Can report the group if necessary

### Member
- User has an approved application to the group
- Can see all group events and content
- Has option to leave the group
- Can report the group if necessary

### Owner
- User created the group
- Has full management capabilities:
  - Edit group details
  - Create events
  - Manage members
  - Manage applications (approve/reject join requests)
  - Leave the group (would transfer ownership or disband if no other moderators)
  - Report the group if necessary

### Moderator
- User has system-level moderator or admin role
- Has all the same management capabilities as an owner
- Can manage any group regardless of ownership
- Has additional system-level responsibilities

## Technical Implementation

### Components
- `components/groups/GroupActionsSidebar.tsx` - Desktop sidebar with role-based actions
- `components/groups/GroupMobileMenu.tsx` - Mobile menu with role-based actions

### API Changes
- Updated `/api/groups/[id]` endpoint to return user role information
- Added `userRole` field with values: 'visitor', 'member', 'owner', 'moderator'
- Added `userApplicationStatus` field to track join request status

### UI Integration
- Replaced old GroupDetailSidebar with new GroupActionsSidebar
- Added mobile menu using three-dot pattern
- Updated group page to use role-based rendering