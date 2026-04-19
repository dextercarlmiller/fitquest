import type { DailyLog } from './types'

interface XPGoal {
  goal: number
  maxXp: number
}

const XP_GOALS: Record<string, XPGoal> = {
  steps: { goal: 10000, maxXp: 100 },
  miles: { goal: 3, maxXp: 100 },
  strength_sets: { goal: 15, maxXp: 100 },
  water_cups: { goal: 8, maxXp: 50 },
  sleep_hours: { goal: 8, maxXp: 75 },
  calories_burned: { goal: 500, maxXp: 100 },
}

export function calculateXP(log: Partial<DailyLog>): number {
  let xp = 0

  if (log.steps) xp += Math.min(1, log.steps / XP_GOALS.steps.goal) * XP_GOALS.steps.maxXp
  if (log.miles) xp += Math.min(1, log.miles / XP_GOALS.miles.goal) * XP_GOALS.miles.maxXp
  if (log.strength_sets) xp += Math.min(1, log.strength_sets / XP_GOALS.strength_sets.goal) * XP_GOALS.strength_sets.maxXp
  if (log.water_cups) xp += Math.min(1, log.water_cups / XP_GOALS.water_cups.goal) * XP_GOALS.water_cups.maxXp
  if (log.sleep_hours) xp += Math.min(1, log.sleep_hours / XP_GOALS.sleep_hours.goal) * XP_GOALS.sleep_hours.maxXp
  if (log.calories_burned) xp += Math.min(1, log.calories_burned / XP_GOALS.calories_burned.goal) * XP_GOALS.calories_burned.maxXp
  if (log.weight_today) xp += 25

  return Math.round(xp)
}

export const XP_PER_LEVEL = 500

export function getLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1
}

export function getXpProgress(totalXp: number): { current: number; needed: number; percentage: number } {
  const xpIntoLevel = totalXp % XP_PER_LEVEL
  return {
    current: xpIntoLevel,
    needed: XP_PER_LEVEL,
    percentage: (xpIntoLevel / XP_PER_LEVEL) * 100,
  }
}

export function getZone(level: number): number {
  if (level >= 15) return 5
  if (level >= 10) return 4
  if (level >= 6) return 3
  if (level >= 3) return 2
  return 1
}

export const DAILY_GOALS = {
  steps: 10000,
  miles: 3,
  strength_sets: 15,
  water_cups: 8,
  sleep_hours: 8,
  calories_burned: 500,
}
