export type Goal = 'lose_weight' | 'build_strength' | 'move_more'
export type ActivityLevel = 'not_at_all' | 'a_little' | 'somewhat_active'

export interface Profile {
  id: string
  goal: Goal | null
  current_weight: number | null
  goal_weight: number | null
  age: number | null
  activity_level: ActivityLevel | null
  total_xp: number
  onboarding_complete: boolean
  created_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  steps: number | null
  miles: number | null
  strength_sets: number | null
  water_cups: number | null
  sleep_hours: number | null
  calories_burned: number | null
  weight_today: number | null
  xp_earned: number
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_key: string
  unlocked_at: string
}

export interface QuestCompletion {
  id: string
  user_id: string
  quest_id: string
  week_start: string
  completed_at: string
  xp_earned: number
}
