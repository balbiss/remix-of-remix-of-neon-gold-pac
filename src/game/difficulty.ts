/**
 * Game Difficulty System
 * 
 * Controls ghost speed and pathfinding accuracy.
 * Designed to receive values from backend in the future.
 * 
 * Usage:
 *   const difficulty = getGameDifficulty();
 *   // Or override from backend:
 *   setGameDifficulty({ ghostSpeedMultiplier: 1.5, chaseAccuracy: 0.8 });
 */

export interface GameDifficulty {
  /** Multiplier for ghost movement speed (1.0 = base, higher = faster) */
  ghostSpeedMultiplier: number;
  /** Probability (0-1) that ghosts chase the player vs random movement */
  chaseAccuracy: number;
  /** Max consecutive wins before difficulty auto-increases */
  maxConsecutiveWins: number;
  /** Speed boost applied per consecutive win streak (e.g. 0.2 = +20%) */
  streakSpeedBoost: number;
}

const DEFAULT_DIFFICULTY: GameDifficulty = {
  ghostSpeedMultiplier: 1.0,
  chaseAccuracy: 0.4,
  maxConsecutiveWins: 3,
  streakSpeedBoost: 0.2,
};

/** Backend-provided override (null = use defaults) */
let _backendDifficulty: Partial<GameDifficulty> | null = null;

/** Current consecutive win count */
let _consecutiveWins = 0;

/**
 * Set difficulty from backend. Pass null to reset to defaults.
 * Ready to be called from a Supabase edge function / API response.
 */
export function setGameDifficulty(override: Partial<GameDifficulty> | null) {
  _backendDifficulty = override;
}

/** Reset the win streak counter (call on loss) */
export function resetWinStreak() {
  _consecutiveWins = 0;
}

/** Increment win streak and return updated difficulty */
export function registerWin(): GameDifficulty {
  _consecutiveWins++;
  return getGameDifficulty();
}

/**
 * Compute the effective difficulty considering:
 * 1. Backend overrides
 * 2. Consecutive win streak penalty
 */
export function getGameDifficulty(): GameDifficulty {
  const base: GameDifficulty = {
    ...DEFAULT_DIFFICULTY,
    ..._backendDifficulty,
  };

  // Apply streak penalty: after maxConsecutiveWins, boost ghost speed
  const excessWins = Math.max(0, _consecutiveWins - base.maxConsecutiveWins);
  const streakMultiplier = 1 + excessWins * base.streakSpeedBoost;

  // Also increase chase accuracy with streak
  const streakAccuracyBoost = excessWins * 0.1;

  return {
    ...base,
    ghostSpeedMultiplier: base.ghostSpeedMultiplier * streakMultiplier,
    chaseAccuracy: Math.min(0.95, base.chaseAccuracy + streakAccuracyBoost),
  };
}

/** Get current consecutive win count */
export function getConsecutiveWins(): number {
  return _consecutiveWins;
}
