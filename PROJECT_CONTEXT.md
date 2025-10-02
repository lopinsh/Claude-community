# Latvian Community Platform - Project Context & Vision

## Core Mission
Create a portal for connecting like-minded people through **in-person groups and events**, focusing on building genuine friendships and community connections (not dating/romantic connections like Tinder).

## Target Audience & Use Cases

### Primary Users (Latvia Context)
- **Cultural Groups**: Choirs, folk dancing groups looking for new members
- **Fitness Enthusiasts**: Individuals wanting workout partners, sports teams
- **Community Builders**: People organizing regular meetups, classes, workshops
- **Event Organizers**: Planning one-time or recurring community events

### User Journey Examples
1. **Group Creator**: "I run a folk dance group and need 3 more dancers"
2. **Activity Seeker**: "I want to find a workout partner in Riga"
3. **Event Organizer**: "I'm hosting a community picnic next Saturday"
4. **Interest Explorer**: "I want to discover groups in my area that match my hobbies"

## Core Features

### 1. Group Management
- **Create Groups**: Users create PUBLIC, PRIVATE, or SINGLE_EVENT groups
- **Application System**: Others can apply to join with approval workflow
- **Membership**: Track group members and manage applications
- **Group Types**:
  - **PUBLIC**: Anyone can view and join
  - **PRIVATE**: Invitation-only or application required
  - **SINGLE_EVENT**: One-time gatherings

### 2. Event System
- **Event Creation**: Groups can create events with dates, locations, RSVP
- **Event Visibility**:
  - **PUBLIC**: Visible to everyone on discover page
  - **MEMBERS_ONLY**: Only group members can see
  - **PRIVATE**: Invitation-only
- **Calendar Views**: List, Calendar, and AgendaView for mobile
- **Attendance Tracking**: RSVP system with attendee management

### 3. Smart Discovery System (3-Level Tag Hierarchy)
```
Level 1 (Base Categories - 6 Fixed):
├── Skill & Craft (categoryTeal)
├── Movement & Wellness (categoryGreen)
├── Gathering & Fun (categoryPeach)
├── Performance & Spectacle (categoryBlue)
├── Civic & Governance (categoryOrange)
└── Practical & Resource (categoryYellow)

Level 2 (Domains - Dynamic):
├── Movement & Wellness → Team Sports, Individual Sports, Dance, Fitness
├── Skill & Craft → Visual Arts, Music, Crafts, Cooking
├── Gathering & Fun → Social Meetups, Gaming, Outdoor Activities
└── [Other Level 1] → [Various Level 2 tags]

Level 3 (Specific Focus - Dynamic):
├── Team Sports → Basketball, Soccer, Volleyball
├── Dance → Folk Dancing, Modern Dance, Ballet
├── Fitness → Yoga, Running, CrossFit
└── [Other Level 2] → [Various Level 3 tags]
```

**Key Feature**: Many-to-many relationships via `TagsOnGroups` table for flexible categorization.

### 4. Location-Based Discovery
- **Regional Filtering**: Find groups/events in your area
- **Venue Information**: Locations with detailed addresses
- **Location Search**: Filter by city/region

### 5. Notification System
- **Application Updates**: Notifications when someone joins your group
- **Event Reminders**: Upcoming event notifications
- **Group Activity**: Updates on group changes and announcements

## Future Monetization (Phase 2)
- **Business Location Enhancement**: Companies pay for premium location listings
  - Visual enhancements (like game skins)
  - Structured content (prices, hours, special offers)
  - **Important**: Core functionality remains free, only visual/promotional upgrades are paid

## Technical Implementation Notes

### Tag System Architecture
- **Database**: Hierarchical structure with parent-child relationships
- **API Routes**:
  - `/api/tags` - Get all tags with optional level filtering
  - `/api/tags/level2?level1=id1,id2` - Get Level 2 tags for specific Level 1 categories
  - `/api/tags/level3?level2=id1,id2` - Get Level 3 tags for specific Level 2 tags
- **Frontend**:
  - Desktop: `LeftSidebar` with expandable categories
  - Mobile: `SearchOverlay` with Combobox multi-select and hierarchical filtering

### Core Database Models (Prisma)
- **User**: Authentication, profiles, creator of groups
- **Group**: Main entity with groupType (PUBLIC/PRIVATE/SINGLE_EVENT)
- **Event**: Calendar events with visibility levels and RSVP tracking
- **Tag**: Hierarchical 3-level system (parentId, level, name)
- **TagsOnGroups**: Many-to-many join table for group categorization
- **Application**: Join requests with status (PENDING/ACCEPTED/REJECTED)
- **EventAttendee**: RSVP tracking for events
- **Notification**: User notifications with read/unread status

### Technology Stack
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **UI Library**: Mantine v8 with custom Coolors theme
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL 16 (Docker container)
- **Authentication**: NextAuth.js v4 with credentials provider
- **Deployment**: Docker Compose with hot-reload development
- **Calendar**: react-big-calendar with AgendaView for mobile

### Database Schema Key Points
- **Groups**: Use groupType enum instead of separate models
- **Tags**: Hierarchical with level (1-3), parentId, and many-to-many via TagsOnGroups
- **Events**: Linked to groups with visibility control and attendance tracking
- **Users**: Bcrypt password hashing, session stored in database (not JWT)
- **Notifications**: Include type, title, message, link, and timestamp

## Regional Focus
- **Primary Market**: Latvia (Latvian cities in location dropdown)
- **Cultural Context**: Strong tradition of choirs, folk dancing, community activities
- **Language**: Currently English, potential for Latvian localization

## Success Metrics
- Number of successful activity connections made
- User retention and regular activity participation
- Geographic spread of activities across Latvia
- Community engagement (messages, repeat participations)

## Current Development Status ✅

### Completed Core Features
- **✅ User Authentication**: NextAuth.js with registration, login, session management
- **✅ Group Management**: Create/view groups with application system
- **✅ Event System**: Create events with RSVP, calendar views (List/Calendar/AgendaView)
- **✅ Tag System**: 3-level hierarchical categorization with many-to-many relationships
- **✅ Discover Page**: Combined groups + public events with filtering
- **✅ Notifications**: In-app notification system
- **✅ Mobile-First Design**: Fully responsive with touch-optimized UI
- **✅ Database**: PostgreSQL with Docker, comprehensive seed data

### Mobile Optimization (Latest - Phase 1-4 Complete)
- **✅ Bottom Navigation**: 5-tab navigation (Discover, Interests, My Groups, News, Profile)
- **✅ Global Layout**: MobileLayout and Footer on all pages
- **✅ SearchOverlay**: Full-screen hierarchical filter with Combobox multi-select
- **✅ FilterDrawer**: Swipeable sidebar with gesture support
- **✅ Form Optimization**: Touch-friendly inputs (44-48px targets), full-screen modals
- **✅ AgendaView**: Mobile-optimized event list for calendar
- **✅ Category Icons**: Visual enhancement with Coolors palette colors

### Current Tag Categories (6 Level 1 Categories)
```
✅ Level 1 (Fixed): Skill & Craft, Movement & Wellness, Gathering & Fun,
                   Performance & Spectacle, Civic & Governance, Practical & Resource
✅ Level 2 (Dynamic): Team Sports, Individual Sports, Dance, Folk Dancing,
                      Visual Arts, Music, etc.
✅ Level 3 (Dynamic): Basketball, Soccer, Yoga, Running, Folk Dancing,
                      Modern Dance, etc.
```

### Implemented Pages
- **✅ `/` (Homepage)**: Discover page with groups/events, mobile SearchOverlay
- **✅ `/auth/signin`**: Mobile-optimized authentication
- **✅ `/auth/signup`**: Mobile-optimized registration
- **✅ `/profile`**: User profile with activity history
- **✅ `/groups/[id]`**: Group detail page with events
- **✅ `/groups/create`**: Group creation with hierarchical tag selection
- **✅ `/interests`**: Interest exploration page
- **✅ `/calendar`**: User's personal calendar view

### Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`

### Docker Commands
```bash
# Start entire stack
docker-compose up

# Access Prisma Studio
npm run db:studio
# Visit http://localhost:5555

# Restart app after package.json changes
docker-compose restart app
```

## Competitive Differentiation
1. **In-person focus**: Explicitly not for dating/romance
2. **Hierarchical categorization**: 3-level tag system for precise discovery
3. **Mobile-first design**: Touch-optimized UI with bottom navigation
4. **Cultural relevance**: Tailored for Latvian community activities (choirs, folk dancing)
5. **Group + Event hybrid**: Single platform for ongoing groups and one-time events

## Related Documentation
- **`CLAUDE.md`**: Development setup, architecture, commands, and critical rules
- **`MOBILE_FIRST_STATUS.md`**: Mobile optimization progress and patterns
- **`TYPOGRAPHY_GUIDE.md`**: Mantine component usage and typography patterns
- **`theme/index.ts`**: Coolors palette configuration and theme system