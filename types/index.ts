// Re-export all types for easy importing
export * from './api'
export * from './entities'

// Additional utility types
export type NonNullable<T> = T extends null | undefined ? never : T

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Database operation result types
export interface CreateResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface UpdateResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface DeleteResult {
  success: boolean
  error?: string
}

// Hook return types
export interface UseQueryResult<T> {
  data: T | undefined
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  error: string | null
  reset: () => void
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Component state types
export interface LoadingState {
  isLoading: boolean
  loadingText?: string
}

export interface ErrorState {
  hasError: boolean
  error?: string | null
  retryAction?: () => void
}

export interface ModalState {
  isOpen: boolean
  data?: any
}

// Date range types for filtering
export interface DateRange {
  start: Date
  end: Date
}

export interface TimeSlot {
  start: Date
  end: Date
  isAvailable: boolean
}

// Search and filter types
export interface SearchState {
  query: string
  results: any[]
  isSearching: boolean
}

export interface FilterOption<T = string> {
  value: T
  label: string
  count?: number
}

export interface FilterGroup<T = string> {
  name: string
  options: FilterOption<T>[]
  multiple?: boolean
}

// Utility type for component refs
export type ComponentRef<T = HTMLElement> = React.RefObject<T>

// Event handler types
export type ClickHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void
export type SubmitHandler<T = HTMLFormElement> = (event: React.FormEvent<T>) => void

// Generic callback types
export type VoidCallback = () => void
export type AsyncVoidCallback = () => Promise<void>
export type ErrorCallback = (error: string) => void