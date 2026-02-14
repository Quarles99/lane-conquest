/*
  KEYBOARD CONTROLS
  - Q/W/E/R/T for North Lane units
  - A/S/D/F/G for South Lane units
*/

import { Lane, UnitType } from '@/lib/gameTypes';
import { useEffect } from 'react';

interface KeyboardControlsConfig {
  onSpawnUnit: (unitType: UnitType, lane: Lane) => void;
  enabled: boolean;
}

const NORTH_LANE_KEYS: Record<string, UnitType> = {
  q: 'footman',
  w: 'archer',
  e: 'knight',
  r: 'priest',
  t: 'ballista',
};

const SOUTH_LANE_KEYS: Record<string, UnitType> = {
  a: 'footman',
  s: 'archer',
  d: 'knight',
  f: 'priest',
  g: 'ballista',
};

export function useKeyboardControls({ onSpawnUnit, enabled }: KeyboardControlsConfig) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Check north lane keys
      if (key in NORTH_LANE_KEYS) {
        event.preventDefault();
        onSpawnUnit(NORTH_LANE_KEYS[key], 'top');
        return;
      }
      
      // Check south lane keys
      if (key in SOUTH_LANE_KEYS) {
        event.preventDefault();
        onSpawnUnit(SOUTH_LANE_KEYS[key], 'bottom');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSpawnUnit, enabled]);
}
