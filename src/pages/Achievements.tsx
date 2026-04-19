import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { NavBar } from '../components/NavBar'
import { ALL_ACHIEVEMENTS, type AchievementDef } from '../lib/achievements'
import type { Achievement } from '../lib/types'

function AchievementBadge({
  def,
  achievement,
}: {
  def: AchievementDef
  achievement: Achievement | undefined
}) {
  const unlocked = !!achievement

  return (
    <div
      className={`card p-4 flex flex-col items-center text-center gap-2 transition-all duration-200 ${
        unlocked ? 'border-opacity-60' : 'opacity-50'
      }`}
      style={unlocked ? { borderColor: def.color + '60' } : {}}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl relative ${
          unlocked ? 'bg-opacity-20' : 'bg-gray-900'
        }`}
        style={
          unlocked
            ? { backgroundColor: def.color + '20', boxShadow: `0 0 12px ${def.color}40` }
            : {}
        }
      >
        {unlocked ? (
          <span>{def.emoji}</span>
        ) : (
          <span className="text-gray-600">🔒</span>
        )}
      </div>

      <div>
        <p
          className="font-pixel leading-tight mb-1"
          style={{ fontSize: '0.45rem', color: unlocked ? def.color : '#4b5563' }}
        >
          {def.title}
        </p>
        <p className="text-xs text-gray-500 leading-tight">{def.description}</p>
        {unlocked && achievement && (
          <p className="text-xs mt-1" style={{ color: def.color + 'aa' }}>
            {new Date(achievement.unlocked_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchAchievements = async () => {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })

      setAchievements(data ?? [])
      setLoading(false)
    }

    fetchAchievements()
  }, [user])

  const unlockedCount = achievements.length
  const totalCount = ALL_ACHIEVEMENTS.length

  return (
    <div className="page-container scrollable-content">
      <div className="px-4 pt-6">
        <h1 className="font-pixel text-green-400 text-xs mb-1">Achievements</h1>
        <p className="text-gray-400 text-sm mb-5">Your earned badges</p>

        {/* Progress summary */}
        <div className="card p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="font-pixel text-white" style={{ fontSize: '0.55rem' }}>
              {unlockedCount} / {totalCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">badges unlocked</p>
          </div>
          <div className="text-right">
            <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-lime-400 rounded-full transition-all duration-700"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((unlockedCount / totalCount) * 100)}% complete
            </p>
          </div>
        </div>

        {/* Latest unlock */}
        {achievements.length > 0 && (
          <div className="mb-4">
            <p className="font-pixel text-green-400 mb-2" style={{ fontSize: '0.45rem' }}>
              Latest Unlock
            </p>
            {(() => {
              const latest = achievements[0]
              const def = ALL_ACHIEVEMENTS.find(a => a.key === latest.achievement_key)
              if (!def) return null
              return (
                <div className="card p-3 flex items-center gap-3 border-green-700">
                  <span className="text-2xl">{def.emoji}</span>
                  <div>
                    <p className="font-pixel text-white" style={{ fontSize: '0.5rem' }}>{def.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{def.description}</p>
                  </div>
                  <span className="ml-auto text-green-400 text-lg">✨</span>
                </div>
              )
            })()}
          </div>
        )}

        {loading ? (
          <p className="font-pixel text-green-400 text-xs text-center mt-10">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ALL_ACHIEVEMENTS.map(def => {
              const achievement = achievements.find(a => a.achievement_key === def.key)
              return (
                <AchievementBadge key={def.key} def={def} achievement={achievement} />
              )
            })}
          </div>
        )}

        {unlockedCount === 0 && !loading && (
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">Log your first day to earn badges!</p>
          </div>
        )}
      </div>

      <NavBar />
    </div>
  )
}
