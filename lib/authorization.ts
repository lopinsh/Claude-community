import { UserRole } from '@prisma/client';
import { Session } from 'next-auth';

/**
 * Check if user has one of the specified roles
 */
export function hasRole(session: Session | null, allowedRoles: UserRole[]): boolean {
  if (!session?.user?.role) return false;
  return allowedRoles.includes(session.user.role);
}

/**
 * Check if user is an admin
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ['ADMIN']);
}

/**
 * Check if user is a moderator or admin
 */
export function isModerator(session: Session | null): boolean {
  return hasRole(session, ['ADMIN', 'MODERATOR']);
}

/**
 * Check if user can moderate content (approve/reject news, pages, groups)
 */
export function canModerateContent(session: Session | null): boolean {
  return isModerator(session);
}

/**
 * Check if user can manage tags (create/edit tags without approval)
 */
export function canManageTags(session: Session | null): boolean {
  return isModerator(session);
}

/**
 * Check if user can approve tag suggestions
 */
export function canApproveTagSuggestions(session: Session | null): boolean {
  return isModerator(session);
}

/**
 * Check if user can publish news articles
 */
export function canPublishNews(session: Session | null): boolean {
  return isModerator(session);
}

/**
 * Check if user can create/edit pages
 */
export function canManagePages(session: Session | null): boolean {
  return isModerator(session);
}

/**
 * Check if user is a company account
 */
export function isCompany(session: Session | null): boolean {
  return hasRole(session, ['COMPANY']);
}

/**
 * Check if user can access admin dashboard
 */
export function canAccessAdminDashboard(session: Session | null): boolean {
  return isModerator(session);
}

/**
 * Get user's role-based display badge
 */
export function getRoleBadge(role: UserRole): { label: string; color: string } {
  switch (role) {
    case 'ADMIN':
      return { label: 'Admin', color: 'categoryRed' };
    case 'MODERATOR':
      return { label: 'Moderator', color: 'categoryBlue' };
    case 'COMPANY':
      return { label: 'Company', color: 'categoryOrange' };
    case 'USER':
    default:
      return { label: 'User', color: 'gray' };
  }
}

/**
 * API Route helper: Require authentication
 */
export function requireAuth(session: Session | null): { authorized: boolean; error?: string } {
  if (!session?.user) {
    return { authorized: false, error: 'Unauthorized - please log in' };
  }
  return { authorized: true };
}

/**
 * API Route helper: Require specific role(s)
 */
export function requireRole(
  session: Session | null,
  allowedRoles: UserRole[]
): { authorized: boolean; error?: string } {
  const authCheck = requireAuth(session);
  if (!authCheck.authorized) return authCheck;

  if (!hasRole(session, allowedRoles)) {
    return {
      authorized: false,
      error: `Forbidden - requires one of: ${allowedRoles.join(', ')}`,
    };
  }

  return { authorized: true };
}

/**
 * API Route helper: Require admin role
 */
export function requireAdmin(session: Session | null): { authorized: boolean; error?: string } {
  return requireRole(session, ['ADMIN']);
}

/**
 * API Route helper: Require moderator or admin role
 */
export function requireModerator(session: Session | null): { authorized: boolean; error?: string } {
  return requireRole(session, ['ADMIN', 'MODERATOR']);
}
