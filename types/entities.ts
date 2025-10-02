// Core Entity Types with proper relations
import { User, Group, Event, Tag, Application, EventAttendee, GroupTag, EventTag } from '@prisma/client'

// User Types
export interface UserSummary {
  id: string
  name: string | null
  email?: string
  image?: string | null
}

export interface UserProfile extends UserSummary {
  location: string | null
  bio: string | null
  createdAt: Date
}

// Tag Types
export interface TagSummary {
  id: string
  name: string
  level: number
  group: 'VERTICAL' | 'HORIZONTAL'
}

export interface TagWithChildren extends TagSummary {
  children: TagSummary[]
}

export interface TagWithParent extends TagSummary {
  parent: TagSummary | null
}

export interface TagWithHierarchy extends TagSummary {
  parent: TagSummary | null
  children: TagSummary[]
  usageCount: number
  status: 'ACTIVE' | 'MERGED' | 'DEPRECATED'
}

// Group Types
export interface GroupSummary {
  id: string
  title: string
  description: string | null
  location: string
  groupType: 'SINGLE_EVENT' | 'RECURRING_GROUP'
  createdAt: Date
}

export interface GroupWithCreator extends GroupSummary {
  creator: UserSummary
}

export interface GroupWithCounts extends GroupWithCreator {
  _count: {
    applications: number
    events: number
  }
}

export interface GroupWithTags extends GroupWithCounts {
  tags: Array<{
    tag: TagSummary
  }>
}

export interface GroupWithEvents extends GroupWithTags {
  events: EventSummary[]
}

export interface GroupDetail extends GroupWithEvents {
  maxMembers: number | null
  isActive: boolean
  updatedAt: Date
}

// Event Types
export interface EventSummary {
  id: string
  title: string | null
  startDateTime: Date
  endDateTime: Date | null
  isAllDay: boolean
  eventType: 'REGULAR' | 'SPECIAL' | 'CANCELLED'
  visibility: 'PRIVATE' | 'PUBLIC'
}

export interface EventWithGroup extends EventSummary {
  group: {
    id: string
    title: string
    location: string
    creator: UserSummary
  }
}

export interface EventWithCounts extends EventWithGroup {
  _count: {
    attendees: number
  }
}

export interface EventWithTags extends EventWithCounts {
  tags: Array<{
    tag: TagSummary
  }>
}

export interface EventDetail extends EventWithTags {
  description: string | null
  timeZone: string
  requiresApproval: boolean
  maxMembers: number | null
  location: string | null
  createdAt: Date
  updatedAt: Date
  attendees: Array<{
    id: string
    status: 'GOING' | 'MAYBE' | 'NOT_GOING'
    user: UserSummary
  }>
}

// Application Types
export interface ApplicationSummary {
  id: string
  status: 'pending' | 'accepted' | 'declined' | 'removed'
  createdAt: Date
}

export interface ApplicationWithUser extends ApplicationSummary {
  user: UserSummary
  message: string | null
}

export interface ApplicationWithGroup extends ApplicationSummary {
  group: GroupSummary
  user: UserSummary
  message: string | null
}

// Event Attendee Types
export interface EventAttendeeSummary {
  id: string
  status: 'GOING' | 'MAYBE' | 'NOT_GOING'
  createdAt: Date
}

export interface EventAttendeeWithUser extends EventAttendeeSummary {
  user: UserSummary
}

export interface EventAttendeeWithEvent extends EventAttendeeSummary {
  event: EventSummary
  user: UserSummary
}

// Notification Types
export interface NotificationSummary {
  id: string
  type: 'NEW_APPLICATION' | 'APPLICATION_ACCEPTED' | 'APPLICATION_DECLINED' | 'NEW_MESSAGE' | 'GROUP_UPDATE' | 'EVENT_CREATED' | 'EVENT_UPDATED'
  title: string
  message: string | null
  isRead: boolean
  createdAt: Date
}

export interface NotificationWithRelations extends NotificationSummary {
  group?: GroupSummary | null
  application?: ApplicationSummary | null
}

// Discovery Types (for main page)
export interface DiscoveryResponse {
  groups: GroupWithTags[]
  publicEvents: EventWithGroup[]
  summary: {
    totalGroups: number
    totalPublicEvents: number
  }
}

// Calendar Types
export interface CalendarEvent extends EventWithGroup {
  // Additional properties for calendar rendering
  allDay?: boolean
  start: Date
  end: Date | null
  title: string // Never null for calendar
  resource?: {
    groupId: string
    eventType: string
    visibility: string
  }
}

export interface CalendarResponse {
  events: CalendarEvent[]
}

// Form Types (for components)
export interface GroupFormData {
  title: string
  description: string
  location: string
  maxMembers: number | null
  groupType: 'SINGLE_EVENT' | 'RECURRING_GROUP'
  selectedTags: string[]
}

export interface EventFormData {
  title: string
  description: string
  startDateTime: Date
  endDateTime: Date | null
  isAllDay: boolean
  eventType: 'REGULAR' | 'SPECIAL'
  visibility: 'PRIVATE' | 'PUBLIC'
  requiresApproval: boolean
  maxMembers: number | null
  location: string
  selectedTags: string[]
  // Recurring event fields
  isRecurring: boolean
  recurrencePattern: string
  recurrenceEnd: Date | null
  weekDays: number[]
  monthlyDay: number | null
}

// Filter Types
export interface GroupFilters {
  search?: string
  location?: string
  tags?: string[]
  groupType?: 'SINGLE_EVENT' | 'RECURRING_GROUP'
  isActive?: boolean
}

export interface EventFilters {
  search?: string
  groupId?: string
  visibility?: 'PRIVATE' | 'PUBLIC'
  eventType?: 'REGULAR' | 'SPECIAL' | 'CANCELLED'
  fromDate?: Date
  toDate?: Date
  tags?: string[]
}

export interface TagFilters {
  search?: string
  level?: number
  group?: 'VERTICAL' | 'HORIZONTAL'
  parentId?: string
  status?: 'ACTIVE' | 'MERGED' | 'DEPRECATED'
}

// State Management Types
export interface AppState {
  user: UserProfile | null
  groups: GroupWithTags[]
  events: EventWithGroup[]
  loading: boolean
  error: string | null
}

export interface GroupState {
  groups: GroupWithTags[]
  loading: boolean
  error: string | null
  filters: GroupFilters
}

export interface EventState {
  events: EventWithGroup[]
  loading: boolean
  error: string | null
  filters: EventFilters
}

export interface NotificationState {
  notifications: NotificationWithRelations[]
  unreadCount: number
  loading: boolean
}

// Component Props Types
export interface GroupCardProps {
  group: GroupWithTags
  showJoinButton?: boolean
  onJoinClick?: (groupId: string) => void
}

export interface EventCardProps {
  event: EventWithGroup
  showRSVPButton?: boolean
  onRSVPClick?: (eventId: string) => void
}

export interface EventCalendarProps {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  height?: number
}

export interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  level?: number
  group?: 'VERTICAL' | 'HORIZONTAL'
  placeholder?: string
}

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}