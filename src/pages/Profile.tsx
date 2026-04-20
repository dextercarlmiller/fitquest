import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { NavBar } from '../components/NavBar'
import { getLevel, getZone, getXpProgress } from '../lib/xp'
import type { DailyLog } from '../lib/types'

const ZONE_NAMES = ['', 'Mushroom Plains', 'Boulder Ridge', 'Crystal Caves', 'Volcano Peak', 'Sky Fortress']
const ZONE_EMOJIS = ['', '🍄', '🪨', '💎', '🌋', '⚡']

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight 🔥',
  build_strength: 'Build Strength 💪',
  move_more: 'Move More 🚶',
}

const ACTIVITY_LABELS: Record<string, string> = {
  not_at_all: 'Not active at all 🛋️',
  a_little: 'A little active 🚶',
  somewhat_active: 'Somewhat active 🏃',
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-800">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [allLogs, setAllLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setAllLogs(data ?? [])
        setLoading(false)
      })
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (!profile || !user) return null

  const level = getLevel(profile.total_xp)
  const zone = getZone(level)
  const { current, needed } = getXpProgress(profile.total_xp)

  const totalMiles = allLogs.reduce((s, l) => s + (l.miles ?? 0), 0)
  const totalSets = allLogs.reduce((s, l) => s + (l.strength_sets ?? 0), 0)
  const totalSteps = allLogs.reduce((s, l) => s + (l.steps ?? 0), 0)

  const latestWeight = allLogs
    .filter(l => l.weight_today != null)
    .sort((a, b) => b.log_date.localeCompare(a.log_date))[0]?.weight_today

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="page-container scrollable-content">
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-900/40 border-2 border-green-700 flex items-center justify-center text-3xl">
            🧙
          </div>
          <div>
            <h1 className="font-pixel text-green-400 text-xs leading-loose">Hero</h1>
            <p className="text-sm text-gray-300">{user.email}</p>
            <p className="text-xs text-gray-500">Member since {memberSince}</p>
          </div>
        </div>

        {/* Current Zone */}
        <div className="card p-4 mb-4 flex items-center gap-4">
          <span className="text-3xl">{ZONE_EMOJIS[zone]}</span>
          <div>
            <p className="font-pixel text-white" style={{ fontSize: '0.5rem' }}>
              Zone {zone}: {ZONE_NAMES[zone]}
            </p>
            <p className="text-xs text-gray-400 mt-1">Level {level} Hero</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-pixel text-green-400 text-sm">{profile.total_xp}</p>
            <p className="text-xs text-gray-500">total XP</p>
          </div>
        </div>

        {/* XP progress */}
        <div className="card p-4 mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Level {level}</span>
            <span>{current} / {needed} XP to Level {level + 1}</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-lime-400 rounded-full"
              style={{ width: `${(current / needed) * 100}%` }}
            />
          </div>
        </div>

        {/* Goal & Settings */}
        <div className="card p-4 mb-4">
          <h2 className="font-pixel text-green-400 mb-3" style={{ fontSize: '0.5rem' }}>Quest Settings</h2>
          <StatRow label="Goal" value={profile.goal ? GOAL_LABELS[profile.goal] : '—'} />
          {profile.activity_level && (
            <StatRow label="Activity Level" value={ACTIVITY_LABELS[profile.activity_level] ?? profile.activity_level} />
          )}
          {profile.age && <StatRow label="Age" value={`${profile.age} years`} />}
        </div>

        {/* Stats */}
        <div className="card p-4 mb-4">
          <h2 className="font-pixel text-green-400 mb-3" style={{ fontSize: '0.5rem' }}>Lifetime Stats</h2>
          {loading ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : (
            <>
              <StatRow label="Days Logged" value={allLogs.length} />
              <StatRow label="Total Miles" value={`${totalMiles.toFixed(1)} mi`} />
              <StatRow label="Total Steps" value={totalSteps.toLocaleString()} />
              <StatRow label="Strength Sets" value={totalSets} />
              <StatRow label="Total XP Earned" value={`${profile.total_xp} XP`} />
            </>
          )}
        </div>

        {/* Weight tracking (if lose weight goal) */}
        {profile.goal === 'lose_weight' && (
          <div className="card p-4 mb-4">
            <h2 className="font-pixel text-green-400 mb-3" style={{ fontSize: '0.5rem' }}>Weight Journey</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Starting</p>
                <p className="font-pixel text-white text-xs">
                  {profile.current_weight ? `${profile.current_weight} lbs` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Current</p>
                <p className="font-pixel text-green-400 text-xs">
                  {latestWeight ? `${latestWeight} lbs` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Goal</p>
                <p className="font-pixel text-yellow-400 text-xs">
                  {profile.goal_weight ? `${profile.goal_weight} lbs` : '—'}
                </p>
              </div>
            </div>
            {profile.current_weight && latestWeight && (
              <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                <p className="text-sm text-gray-400">
                  {latestWeight < profile.current_weight ? (
                    <span className="text-green-400">
                      ↓ {(profile.current_weight - latestWeight).toFixed(1)} lbs lost!
                    </span>
                  ) : latestWeight > profile.current_weight ? (
                    <span className="text-red-400">
                      ↑ {(latestWeight - profile.current_weight).toFixed(1)} lbs gained
                    </span>
                  ) : (
                    <span className="text-gray-400">No change yet</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full btn-secondary mb-6"
        >
          Sign Out
        </button>
      </div>

      <NavBar />
    </div>
  )
}
