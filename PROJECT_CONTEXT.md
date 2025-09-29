# Community Platform - Project Context & Vision

## Core Mission
Create a portal for connecting like-minded people through **in-person activities**, focusing on building genuine friendships and community connections (not dating/romantic connections like Tinder).

## Target Audience & Use Cases

### Primary Users (Latvia Context)
- **Cultural Groups**: Choirs, folk dancing groups looking for new members
- **Activity Seekers**: Individuals wanting workout partners, hobby companions
- **Community Builders**: People organizing regular meetups, classes, workshops

### User Journey Examples
1. **Group Creator**: "I run a folk dance group and need 3 more dancers"
2. **Activity Seeker**: "I want to find a workout partner in my region"
3. **Skill Sharer**: "I want to teach/learn language exchange"

## Core Features

### 1. Activity Management
- **Create Activities**: Groups/individuals post their activities with details
- **Application System**: Others can apply to join activities
- **Group Communication**: Internal messaging for activity members
- **Scheduling**: Discuss and agree on times/locations

### 2. Smart Discovery System (Multi-layer Tag Hierarchy)
```
Level 1 (Base Categories):
├── Physical Activities
├── Arts & Culture
├── Learning & Skills
└── Social & Community

Level 2 (Activity Types):
├── Physical → Team Sports, Individual Sports, Dance, Fitness
├── Arts → Visual Arts, Performing Arts, Literature, Music
├── Learning → Languages, Professional Skills, Hobbies
└── Social → Meetups, Volunteering, Gaming

Level 3 (Attributes/Filters):
├── Frequency: Weekly, Monthly, One-time
├── Skill Level: Beginner-friendly, Intermediate, Advanced
├── Time: Morning, Afternoon, Evening
├── Duration: 1 hour, 2-3 hours, Half-day
└── Group Size: Small (2-5), Medium (6-15), Large (15+)
```

**Key Feature**: Multiple tags can be assigned from each level for flexible categorization.

### 3. Location-Based Discovery
- **Regional Filtering**: Find activities in your area
- **Venue Information**: Activity locations and meeting points

## Future Monetization (Phase 2)
- **Business Location Enhancement**: Companies pay for premium location listings
  - Visual enhancements (like game skins)
  - Structured content (prices, hours, special offers)
  - **Important**: Core functionality remains free, only visual/promotional upgrades are paid

## Technical Implementation Notes

### Current Tag System
- **Database**: Hierarchical structure with parent-child relationships
- **API**: `/api/tags?level=1` for root categories, `/api/tags?parentId=X` for children
- **Frontend**: Intuitive step-by-step tag selection with visual hierarchy

### Core Models
- **Activity**: Main activity posts with creator, description, location
- **Application**: Join requests with status (pending/accepted/declined)
- **User**: Authentication and profiles
- **Tag System**: Multi-level categorization
- **Notifications**: Updates on applications, messages, activity changes

### Technology Stack
- **Frontend**: Next.js 14 with Mantine UI components
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL with hierarchical tag structure
- **Authentication**: NextAuth.js with credentials provider
- **Deployment**: Docker containerization with docker-compose

### Database Schema Key Points
- **Activities**: No type field (uses tag classification instead)
- **Tags**: Hierarchical with parentId, level (1-3), and usage tracking
- **ActivityTag**: Many-to-many relationship between activities and tags
- **Users**: Profile with location, bio, linked to created activities and applications

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

### Completed Features
- **✅ User Authentication**: Registration, login with test user support
- **✅ Activity Creation**: Enhanced UI with step-by-step tag selection
- **✅ Activity Listing**: Mantine-styled cards with category badges
- **✅ Tag System**: 3-level hierarchical categorization working
- **✅ Profile Management**: User profiles with activity history
- **✅ Database**: Fully seeded with sample tags and running in Docker
- **✅ UI/UX**: Consistent Mantine design system throughout

### Tag Selection UX Improvements (Latest)
- **Visual Hierarchy**: Color-coded steps (Blue→Green→Orange)
- **Progressive Disclosure**: Levels appear as you select
- **Clear Guidance**: Explanatory text and contextual descriptions
- **Real-time Preview**: Selected tags shown with matching colors
- **Intuitive Flow**: Required vs optional clearly marked

### Current Tag Categories
```
✅ Level 1: cultural, physical, learning, social
✅ Level 2: choir, folk-dance, workout, language-exchange, book-club
✅ Level 3: beginner-friendly, weekly, evening
```

### Pages Status
- **✅ `/activities`**: Activity list with search and filters
- **✅ `/activities/create`**: Enhanced tag selection UI
- **✅ `/profile`**: User profile and activity management
- **✅ `/auth/signin`** & **`/auth/signup`**: Authentication flows

### Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`

## Competitive Differentiation
1. **In-person focus**: Explicitly not for dating/romance