import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { NavBar } from '../components/NavBar'
import { calculateXP, DAILY_GOALS } from '../lib/xp'
import { checkNewAchievements } from '../lib/achievements'
import type { DailyLog as DailyLogType } from '../lib/types'

interface FieldConfig {
  key: keyof Pick<DailyLogType, 'steps' | 'miles' | 'strength_sets' | 'water_cups' | 'sleep_hours' | 'calories_burned' | 'weight_today'>
  label: string
  emoji: string
  unit: string
  goal: number
  placeholder: string
  step?: string
}

const FIELDS: FieldConfig[] = [
  { key: 'steps', label: 'Steps', emoji: '👟', unit: 'steps', goal: DAILY_GOALS.steps, placeholder: '8000', step: '100' },
  { key: 'miles', label: 'Miles Run/Walked', emoji: '🏃', unit: 'mi', goal: DAILY_GOALS.miles, placeholder: '2.5', step: '0.1' },
  { key: 'strength_sets', label: 'Strength Sets', emoji: '💪', unit: 'sets', goal: DAILY_GOALS.strength_sets, placeholder: '10', step: '1' },
  { key: 'water_cups', label: 'Water Intake', emoji: '💧', unit: 'cups', goal: DAILY_GOALS.water_cups, placeholder: '6', step: '1' },
  { key: 'sleep_hours', label: 'Hours of Sleep', emoji: '😴', unit: 'hrs', goal: DAILY_GOALS.sleep_hours, placeholder: '7.5', step: '0.5' },
  { key: 'calories_burned', label: 'Calories Burned', emoji: '🔥', unit: 'cal', goal: DAILY_GOALS.calories_burned, placeholder: '350', step: '10' },
]

function MiniProgressBar({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(100, (value / goal) * 100)
  const done = pct >= 100
  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1.5">
      <div
        className={`h-full rounded-full transition-all duration-300 ${done ? 'bg-yellow-400' : 'bg-green-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function DailyLog() {
  const { user, profile, refreshProfile } = useAuth()
  const [values, setValues] = useState<Partial<Record<string, string>>>({})
  const [existingLog, setExistingLog] = useState<DailyLogType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [floatingXP, setFloatingXP] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)
  const floatTimeout = useRef<ReturnType<typeof setTimeout>>()

  const today = getTodayStr()

  useEffect(() => {
    if (!user) return

    const checkToday = async () => {
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today)
        .single()

      if (data) {
        setExistingLog(data)
        // Prefill with existing values
        const prefill: Record<string, string> = {}
        if (data.steps) prefill.steps = String(data.steps)
        if (data.miles) prefill.miles = String(data.miles)
        if (data.strength_sets) prefill.strength_sets = String(data.strength_sets)
        if (data.water_cups) prefill.water_cups = String(data.water_cups)
        if (data.sleep_hours) prefill.sleep_hours = String(data.sleep_hours)
        if (data.calories_burned) prefill.calories_burned = String(data.calories_burned)
        if (data.weight_today) prefill.weight_today = String(data.weight_today)
        setValues(prefill)
      }

      setLoading(false)
    }

    checkToday()
  }, [user, today])

  const getNumeric = (key: string): number | null => {
    const v = values[key]
    if (!v || v === '') return null
    const n = parseFloat(v)
    return isNaN(n) ? null : n
  }

  const buildLog = () => ({
    steps: getNumeric('steps') as number | null,
    miles: getNumeric('miles') as number | null,
    strength_sets: getNumeric('strength_sets') as number | null,
    water_cups: getNumeric('water_cups') as number | null,
    sleep_hours: getNumeric('sleep_hours') as number | null,
    calories_burned: getNumeric('calories_burned') as number | null,
    weight_today: getNumeric('weight_today') as number | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    setSubmitting(true)

    const logData = buildLog()
    const xp = calculateXP(logData)

    const logRecord = {
      user_id: user.id,
      log_date: today,
      ...logData,
      xp_earned: xp,
    }

    if (existingLog) {
      await supabase.from('daily_logs').update(logRecord).eq('id', existingLog.id)
    } else {
      await supabase.from('daily_logs').insert(logRecord)
    }

    // Update total XP
    const xpDelta = existingLog ? xp - existingLog.xp_earned : xp
    const newTotalXp = Math.max(0, profile.total_xp + xpDelta)
    await supabase.from('profiles').update({ total_xp: newTotalXp }).eq('id', user.id)

    // Check achievements
    const { data: allLogs } = await supabase.from('daily_logs').select('*').eq('user_id', user.id)
    const { data: existingAchievements } = await supabase.from('achievements').select('achievement_key').eq('user_id', user.id)
    const unlockedKeys = (existingAchievements ?? []).map(a => a.achievement_key)
    const updatedProfile = { ...profile, total_xp: newTotalXp }
    const newAchievements = checkNewAchievements(updatedProfile, allLogs ?? [], unlockedKeys)

    if (newAchievements.length > 0) {
      await supabase.from('achievements').insert(
        newAchievements.map(key => ({ user_id: user.id, achievement_key: key }))
      )
    }

    await refreshProfile()

    // Show float animation
    if (xpDelta > 0) {
      setFloatingXP(xpDelta)
      clearTimeout(floatTimeout.current)
      floatTimeout.current = setTimeout(() => setFloatingXP(null), 1600)
    }

    setSuccess(true)
    setExistingLog(prev => prev ? { ...prev, ...logRecord, xp_earned: xp } : { id: '', created_at: '', ...logRecord, xp_earned: xp })
    setSubmitting(false)
  }

  const showWeightField = profile?.goal === 'lose_weight'

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <p className="font-pixel text-green-400 text-xs">Loading...</p>
      </div>
    )
  }

  return (
    <div className="page-container scrollable-content">
      <div className="px-4 pt-6">
        <h1 className="font-pixel text-green-400 text-xs mb-1">Daily Log</h1>
        <p className="text-gray-400 text-sm mb-1">{formatDate()}</p>
        {existingLog && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-400 text-xs">✓</span>
            <span className="text-xs text-green-400">Already logged today — you can update it</span>
          </div>
        )}

        {success && (
          <div className="card border-green-500 bg-green-900/20 p-3 mb-4 flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-pixel text-green-400" style={{ fontSize: '0.5rem' }}>Log Saved!</p>
              <p className="text-xs text-gray-400 mt-0.5">+{calculateXP(buildLog())} XP earned</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map(field => {
            const val = parseFloat(values[field.key] ?? '0') || 0
            const pct = Math.min(100, (val / field.goal) * 100)
            const goalHit = pct >= 100

            return (
              <div key={field.key} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-lg">{field.emoji}</span>
                    {field.label}
                  </label>
                  <span className={`text-xs font-pixel ${goalHit ? 'text-yellow-400' : 'text-gray-500'}`}
                    style={{ fontSize: '0.45rem' }}>
                    {goalHit ? '✓ GOAL!' : `Goal: ${field.goal} ${field.unit}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    step={field.step ?? '1'}
                    value={values[field.key] ?? ''}
                    onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <span className="text-xs text-gray-500 w-8 text-right">{field.unit}</span>
                </div>
                <MiniProgressBar value={val} goal={field.goal} />
                <p className="text-xs text-gray-600 mt-1">{pct.toFixed(0)}% of daily goal</p>
              </div>
            )
          })}

          {showWeightField && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-lg">⚖️</span>
                  Weight Today
                </label>
                <span className="text-xs text-gray-500">+25 XP</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={values.weight_today ?? ''}
                  onChange={e => setValues(prev => ({ ...prev, weight_today: e.target.value }))}
                  placeholder="175"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                />
                <span className="text-xs text-gray-500 w-8 text-right">lbs</span>
              </div>
            </div>
          )}

          {/* XP Preview */}
          <div className="card p-4 border-green-900/60 bg-green-900/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">XP this log earns</span>
              <span className="font-pixel text-green-400 text-sm">+{calculateXP(buildLog())} XP</span>
            </div>
          </div>

          {/* Submit */}
          <div className="relative flex justify-center pb-4">
            {floatingXP !== null && (
              <div className="absolute -top-6 font-pixel text-yellow-400 text-sm animate-float-up pointer-events-none z-10"
                style={{ fontSize: '0.8rem' }}>
                +{floatingXP} XP!
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : existingLog ? '⚔️ Update Log' : '⚔️ Log This Day'}
            </button>
          </div>
        </form>
      </div>

      <NavBar />
    </div>
  )
}
