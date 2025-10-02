// API Response Types
export interface APIResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends APIResponse<T> {
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

export interface FilterMeta {
  appliedFilters: Record<string, any>
  availableFilters: Record<string, any[]>
}

// Error Types
export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
  status: number
}

// Common Query Parameters
export interface BaseQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface GroupQueryParams extends BaseQueryParams {
  location?: string
  groupType?: 'SINGLE_EVENT' | 'RECURRING_GROUP'
  creatorId?: string
  tags?: string[]
  isActive?: boolean
}

export interface EventQueryParams extends BaseQueryParams {
  groupId?: string
  visibility?: 'PRIVATE' | 'PUBLIC'
  eventType?: 'REGULAR' | 'SPECIAL' | 'CANCELLED'
  fromDate?: string
  toDate?: string
  tags?: string[]
}

export interface TagQueryParams extends BaseQueryParams {
  level?: number
  group?: 'VERTICAL' | 'HORIZONTAL'
  parentId?: string
  status?: 'ACTIVE' | 'MERGED' | 'DEPRECATED'
}

// Request Bodies
export interface CreateGroupRequest {
  title: string
  description?: string
  location: string
  maxMembers?: number
  groupType: 'SINGLE_EVENT' | 'RECURRING_GROUP'
  tagIds?: string[]
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {
  isActive?: boolean
}

export interface CreateEventRequest {
  title?: string
  description?: string
  startDateTime: string // ISO string
  endDateTime?: string // ISO string
  isAllDay: boolean
  eventType: 'REGULAR' | 'SPECIAL'
  visibility: 'PRIVATE' | 'PUBLIC'
  requiresApproval?: boolean
  maxMembers?: number
  location?: string
  tagIds?: string[]
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  eventType?: 'REGULAR' | 'SPECIAL' | 'CANCELLED'
}

export interface RSVPRequest {
  status: 'GOING' | 'MAYBE' | 'NOT_GOING'
}

export interface ApplicationRequest {
  message?: string
}

export interface ApplicationResponse {
  status: 'pending' | 'accepted' | 'declined' | 'removed'
}