import type { DailyLog, Goal } from './types'

export interface Quest {
  id: string
  title: string
  description: string
  xpReward: number
  type: string
  target: number
}

const QUESTS_BY_GOAL: Record<Goal, Quest[]> = {
  lose_weight: [
    { id: 'lw_log_5', title: 'Consistent Logger', description: 'Log 5 days this week', xpReward: 200, type: 'log_days', target: 5 },
    { id: 'lw_calories', title: 'Calorie Crusher', description: 'Hit calorie burn goal 3x', xpReward: 300, type: 'calories', target: 3 },
    { id: 'lw_miles', title: 'Long Haul', description: 'Walk 15 miles this week', xpReward: 350, type: 'miles', target: 15 },
    { id: 'lw_weight', title: 'Scale Watcher', description: 'Log your weight 5 days', xpReward: 150, type: 'weight_logs', target: 5 },
  ],
  build_strength: [
    { id: 'bs_log_5', title: 'Consistent Logger', description: 'Log 5 days this week', xpReward: 200, type: 'log_days', target: 5 },
    { id: 'bs_sets', title: 'Iron Pumper', description: 'Complete 50 strength sets', xpReward: 350, type: 'strength', target: 50 },
    { id: 'bs_sleep', title: 'Recovery Mode', description: 'Sleep 7+ hrs for 4 nights', xpReward: 250, type: 'sleep', target: 4 },
    { id: 'bs_full', title: 'Beast Mode', description: 'Log 3 full workout days (10+ sets)', xpReward: 300, type: 'full_workout', target: 3 },
  ],
  move_more: [
    { id: 'mm_log_5', title: 'Consistent Logger', description: 'Log 5 days this week', xpReward: 200, type: 'log_days', target: 5 },
    { id: 'mm_steps', title: 'Step Master', description: 'Hit 10k steps 3x this week', xpReward: 300, type: 'steps', target: 3 },
    { id: 'mm_miles', title: 'Road Tripper', description: 'Walk or run 10 miles total', xpReward: 300, type: 'miles', target: 10 },
    { id: 'mm_water', title: 'Hydration Hero', description: 'Drink 8 cups water 4 days', xpReward: 200, type: 'water', target: 4 },
  ],
}

export function getQuestsForGoal(goal: Goal): Quest[] {
  return QUESTS_BY_GOAL[goal]
}

export function calculateQuestProgress(quest: Quest, weekLogs: DailyLog[]): number {
  switch (quest.type) {
    case 'log_days': return weekLogs.length
    case 'calories': return weekLogs.filter(l => (l.calories_burned ?? 0) >= 500).length
    case 'miles': return Math.round(weekLogs.reduce((s, l) => s + (l.miles ?? 0), 0) * 10) / 10
    case 'weight_logs': return weekLogs.filter(l => l.weight_today != null).length
    case 'strength': return weekLogs.reduce((s, l) => s + (l.strength_sets ?? 0), 0)
    case 'sleep': return weekLogs.filter(l => (l.sleep_hours ?? 0) >= 7).length
    case 'steps': return weekLogs.filter(l => (l.steps ?? 0) >= 10000).length
    case 'water': return weekLogs.filter(l => (l.water_cups ?? 0) >= 8).length
    case 'full_workout': return weekLogs.filter(l => (l.strength_sets ?? 0) >= 10).length
    default: return 0
  }
}

export function getWeekStart(date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekEnd(date = new Date()): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}
