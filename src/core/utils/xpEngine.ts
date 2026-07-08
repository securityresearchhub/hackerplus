/**
 * Reusable XP and Level Calculation Engine for HackerPlus
 */

export interface LevelConfig {
  baseXp: number;
  growthExponent: number;
  maxLevel: number;
}

export interface ProgressResult {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
}

/**
 * Calculates the total cumulative XP required to reach a specific level.
 * Formula: Cumulative XP(level) = baseXp * ((level - 1) ^ growthExponent)
 */
export function getRequiredXpForLevel(level: number, config: LevelConfig): number {
  if (level <= 1) return 0;
  const growthFactor = Math.pow(level - 1, config.growthExponent);
  return Math.round(config.baseXp * growthFactor);
}

/**
 * Safe addition of XP ensuring bounds.
 */
export function addXp(currentXp: number, amount: number): number {
  const safeAmount = Math.max(0, amount);
  return currentXp + safeAmount;
}

/**
 * Safe removal of XP ensuring bounds.
 */
export function removeXp(currentXp: number, amount: number): number {
  const safeAmount = Math.max(0, amount);
  return Math.max(0, currentXp - safeAmount);
}

/**
 * Calculates current level based on total XP.
 */
export function calculateLevel(totalXp: number, config: LevelConfig): number {
  let level = 1;
  while (level < config.maxLevel) {
    const nextLevelThreshold = getRequiredXpForLevel(level + 1, config);
    if (totalXp >= nextLevelThreshold) {
      level++;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Calculates level progress statistics (XP in level, XP needed, and %).
 */
export function calculateProgress(totalXp: number, config: LevelConfig): ProgressResult {
  const currentLevel = calculateLevel(totalXp, config);
  
  const currentLevelMinXp = getRequiredXpForLevel(currentLevel, config);
  const nextLevelThreshold = getRequiredXpForLevel(currentLevel + 1, config);
  
  const xpInCurrentLevel = totalXp - currentLevelMinXp;
  const xpNeededForNextLevel = nextLevelThreshold - currentLevelMinXp;
  
  const progressPercentage = xpNeededForNextLevel > 0 
    ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
    : 100;

  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel: nextLevelThreshold - totalXp,
    progressPercentage,
  };
}
