import { useEffect, useRef, useCallback } from 'react';
import { Direction } from '@/game/constants';

const SWIPE_THRESHOLD = 20;

export function useSwipeControls(
  onDirection: (dir: Direction) => void,
  enabled: boolean
) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;
    // Prevent page scroll while playing
    e.preventDefault();

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return;

    if (absDx > absDy) {
      onDirection(dx > 0 ? 'right' : 'left');
    } else {
      onDirection(dy > 0 ? 'down' : 'up');
    }

    // Reset so continuous swiping works
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enabled, onDirection]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const opts: AddEventListenerOptions = { passive: false };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, opts);
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);
}
