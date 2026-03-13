import { useRef, useState, useCallback, useEffect } from 'react';
import { Direction } from '@/game/constants';

interface VirtualJoystickProps {
  onDirection: (dir: Direction) => void;
  enabled: boolean;
}

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 48;
const DEAD_ZONE = 12;

export function VirtualJoystick({ onDirection, enabled }: VirtualJoystickProps) {
  const [active, setActive] = useState(false);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const lastDirRef = useRef<Direction | null>(null);
  const touchIdRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || touchIdRef.current !== null) return;
    const touch = e.touches[0];
    touchIdRef.current = touch.identifier;
    setCenter({ x: touch.clientX, y: touch.clientY });
    setKnobOffset({ x: 0, y: 0 });
    setActive(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || touchIdRef.current === null) return;
    
    let touch: React.Touch | undefined;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === touchIdRef.current) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch) return;

    const dx = touch.clientX - center.x;
    const dy = touch.clientY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = JOYSTICK_SIZE / 2 - KNOB_SIZE / 2;
    
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);
    
    setKnobOffset({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    });

    if (dist > DEAD_ZONE) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      let dir: Direction;
      if (absDx > absDy) {
        dir = dx > 0 ? 'right' : 'left';
      } else {
        dir = dy > 0 ? 'down' : 'up';
      }
      if (dir !== lastDirRef.current) {
        lastDirRef.current = dir;
        onDirection(dir);
      }
    }
  }, [enabled, center, onDirection]);

  const handleTouchEnd = useCallback(() => {
    touchIdRef.current = null;
    lastDirRef.current = null;
    setActive(false);
    setKnobOffset({ x: 0, y: 0 });
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-24 left-0 right-0 h-40 z-30"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {active && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: center.x - JOYSTICK_SIZE / 2,
            top: center.y - (window.innerHeight - 160) - JOYSTICK_SIZE / 2 + 160,
            width: JOYSTICK_SIZE,
            height: JOYSTICK_SIZE,
          }}
        >
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 50% / 0.08), transparent)',
            }}
          />
          {/* Knob */}
          <div
            className="absolute rounded-full bg-primary/40 backdrop-blur-sm border border-primary/50"
            style={{
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              left: JOYSTICK_SIZE / 2 - KNOB_SIZE / 2 + knobOffset.x,
              top: JOYSTICK_SIZE / 2 - KNOB_SIZE / 2 + knobOffset.y,
              boxShadow: '0 0 15px hsl(45 100% 50% / 0.3)',
            }}
          />
        </div>
      )}
    </div>
  );
}
