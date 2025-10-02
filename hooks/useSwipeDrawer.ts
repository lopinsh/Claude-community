import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSwipeDrawerOptions {
  /**
   * Width from left edge where swipe gesture is detected (in pixels)
   * @default 50
   */
  edgeWidth?: number;

  /**
   * Minimum swipe distance to trigger drawer open (in pixels)
   * @default 150
   */
  threshold?: number;

  /**
   * Whether the drawer is initially open
   * @default false
   */
  initialOpen?: boolean;

  /**
   * Called when drawer state changes
   */
  onChange?: (isOpen: boolean) => void;
}

export function useSwipeDrawer(options: UseSwipeDrawerOptions = {}) {
  const {
    edgeWidth = 50,
    threshold = 150,
    initialOpen = false,
    onChange,
  } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isEdgeSwipe = useRef(false);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchStartTime.current = Date.now();

      // Check if touch started from left edge
      if (touch.clientX <= edgeWidth) {
        isEdgeSwipe.current = true;
        setIsDragging(true);
      }
    },
    [edgeWidth]
  );

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isEdgeSwipe.current && !isOpen) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Ignore if more vertical than horizontal (let page scroll)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isEdgeSwipe.current = false;
      setIsDragging(false);
      return;
    }

    // Prevent page scroll during horizontal swipe
    if (isEdgeSwipe.current || isOpen) {
      e.preventDefault();
    }

    if (isOpen) {
      // Closing gesture (swipe left from open state)
      if (deltaX < 0) {
        setDragOffset(Math.max(deltaX, -320)); // 320px = drawer width
      }
    } else {
      // Opening gesture (swipe right from edge)
      if (isEdgeSwipe.current && deltaX > 0) {
        setDragOffset(Math.min(deltaX, 320));
      }
    }
  }, [isOpen]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    const swipeDistance = Math.abs(dragOffset);
    const swipeTime = Date.now() - touchStartTime.current;
    const swipeVelocity = swipeDistance / swipeTime;

    // Fast swipe (velocity > 0.5px/ms) or threshold reached
    const shouldToggle = swipeVelocity > 0.5 || swipeDistance > threshold;

    if (shouldToggle) {
      if (isOpen) {
        // Close if swiping left
        if (dragOffset < 0) {
          setIsOpen(false);
          onChange?.(false);
        }
      } else {
        // Open if swiping right from edge
        if (isEdgeSwipe.current && dragOffset > 0) {
          setIsOpen(true);
          onChange?.(true);
        }
      }
    }

    // Reset state
    setIsDragging(false);
    setDragOffset(0);
    isEdgeSwipe.current = false;
  }, [dragOffset, isOpen, threshold, onChange]);

  // Attach event listeners
  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Public methods
  const open = useCallback(() => {
    setIsOpen(true);
    onChange?.(true);
  }, [onChange]);

  const close = useCallback(() => {
    setIsOpen(false);
    onChange?.(false);
  }, [onChange]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      onChange?.(newState);
      return newState;
    });
  }, [onChange]);

  return {
    isOpen,
    isDragging,
    dragOffset,
    open,
    close,
    toggle,
  };
}
