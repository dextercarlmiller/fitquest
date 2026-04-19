import type { DailyLog, Profile } from './types'
import { getLevel, getZone } from './xp'
import { getWeekStart } from './quests'

export interface AchievementDef {
  key: string
  title: string
  description: string
  emoji: string
  color: string
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_steps', title: 'First Steps', description: 'Log your first day', emoji: '👟', color: '#4ade80' },
  { key: 'week_warrior', title: 'Week Warrior', description: 'Log 7 days in a row', emoji: '🗡️', color: '#facc15' },
  { key: 'iron_will', title: 'Iron Will', description: 'Complete a full week of quests', emoji: '🛡️', color: '#60a5fa' },
  { key: 'speedster', title: 'Speedster', description: 'Run 10 miles in a week', emoji: '⚡', color: '#fb923c' },
  { key: 'hydration_hero', title: 'Hydration Hero', description: 'Hit water goal 5 days in a row', emoji: '💧', color: '#38bdf8' },
  { key: 'level_up', title: 'Level Up!', description: 'Reach Level 2', emoji: '⭐', color: '#facc15' },
  { key: 'halfway_there', title: 'Halfway There', description: 'Reach Level 3', emoji: '🏆', color: '#a78bfa' },
  { key: 'zone_conqueror', title: 'Zone Conqueror', description: 'Unlock Zone 3', emoji: '💎', color: '#4ade80' },
]

function getConsecutiveDays(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let consecutive = 0
  let checkDate = new Date(today)

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const d = new Date(sortedDates[i])
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === checkDate.getTime()) {
      consecutive++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return consecutive
}

function hasConsecutiveWaterDays(logs: DailyLog[], count: number): boolean {
  const waterDates = logs
    .filter(l => (l.water_cups ?? 0) >= 8)
    .map(l => l.log_date)
    .sort()
  return getConsecutiveDays(waterDates) >= count
}

export function checkNewAchievements(
  profile: Profile,
  allLogs: DailyLog[],
  unlockedKeys: string[],
  allQuestsCompletedThisWeek = false
): string[] {
  const newKeys: string[] = []
  const level = getLevel(profile.total_xp)
  const zone = getZone(level)

  const check = (key: string, condition: boolean) => {
    if (condition && !unlockedKeys.includes(key)) newKeys.push(key)
  }

  const sortedDates = [...allLogs].map(l => l.log_date).sort()

  check('first_steps', allLogs.length >= 1)
  check('week_warrior', getConsecutiveDays(sortedDates) >= 7)
  check('iron_will', allQuestsCompletedThisWeek)
  check('level_up', level >= 2)
  check('halfway_there', level >= 3)
  check('zone_conqueror', zone >= 3)
  check('hydration_hero', hasConsecutiveWaterDays(allLogs, 5))

  const weekStart = getWeekStart()
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekLogs = allLogs.filter(l => l.log_date >= weekStartStr)
  const weeklyMiles = weekLogs.reduce((s, l) => s + (l.miles ?? 0), 0)
  check('speedster', weeklyMiles >= 10)

  return newKeys
}
