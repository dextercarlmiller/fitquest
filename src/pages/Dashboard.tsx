import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { WorldMap } from '../components/WorldMap'
import { XPBar } from '../components/XPBar'
import { WeekGrid } from '../components/WeekGrid'
import { StatCard } from '../components/StatCard'
import { NavBar } from '../components/NavBar'
import { getLevel } from '../lib/xp'
import { getWeekStart, getWeekEnd } from '../lib/quests'
import type { DailyLog } from '../lib/types'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [weekLogs, setWeekLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchWeekLogs = async () => {
      const weekStart = getWeekStart()
      const weekEnd = getWeekEnd()

      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', weekStart.toISOString().split('T')[0])
        .lte('log_date', weekEnd.toISOString().split('T')[0])

      setWeekLogs(data ?? [])
      setLoading(false)
    }

    fetchWeekLogs()
  }, [user])

  if (!profile) return null

  const level = getLevel(profile.total_xp)
  const xpToNext = 500 - (profile.total_xp % 500)

  const goalLabels: Record<string, string> = {
    lose_weight: 'Lose Weight 🔥',
    build_strength: 'Build Strength 💪',
    move_more: 'Move More 🚶',
  }

  return (
    <div className="page-container scrollable-content">
      <div className="px-4 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-green-400 text-sm">FitQuest</h1>
            <p className="text-xs text-gray-500 mt-1">
              Goal: {profile.goal ? goalLabels[profile.goal] : '—'}
            </p>
          </div>
          <button
            onClick={() => navigate('/log')}
            className="btn-primary text-xs py-2 px-3"
            style={{ fontSize: '0.45rem' }}
          >
            + Log Today
          </button>
        </div>

        {/* World Map */}
        <WorldMap totalXp={profile.total_xp} />

        {/* XP Bar */}
        <XPBar totalXp={profile.total_xp} />

        {/* Week Grid */}
        {!loading && <WeekGrid logs={weekLogs} />}

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            emoji="📅"
            label="Days Active"
            value={weekLogs.length}
            sub="this week"
          />
          <StatCard
            emoji="⭐"
            label="Level"
            value={level}
          />
          <StatCard
            emoji="✨"
            label="XP Needed"
            value={xpToNext}
            sub="to level up"
          />
        </div>

        {/* Quick tip */}
        <div className="card p-4 border-l-4 border-l-green-500">
          <p className="font-pixel text-green-400 mb-1" style={{ fontSize: '0.5rem' }}>Daily Tip</p>
          <p className="text-xs text-gray-400">
            {level === 1
              ? 'Start small — even 15 minutes of movement earns XP!'
              : level < 5
              ? 'You\'re building great habits. Keep your streak going!'
              : 'Elite warrior! Push toward unlocking the next zone.'}
          </p>
        </div>
      </div>

      <NavBar />
    </div>
  )
}
