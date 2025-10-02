/**
 * Responsive utilities for mobile-first design
 */

export const MOBILE_MAX = 768;
export const TABLET_MAX = 992;
export const DESKTOP_MIN = 1200;

/**
 * Check if the device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get the current viewport type based on width
 */
export type ViewportType = 'mobile' | 'tablet' | 'desktop';

export const getViewport = (width: number): ViewportType => {
  if (width < MOBILE_MAX) return 'mobile';
  if (width < TABLET_MAX) return 'tablet';
  return 'desktop';
};

/**
 * Safe area insets for iOS devices (notch/home indicator)
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0 };

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
  };
};

/**
 * Check if user prefers reduced motion (accessibility)
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
