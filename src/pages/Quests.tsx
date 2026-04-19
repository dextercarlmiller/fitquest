import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { NavBar } from '../components/NavBar'
import {
  getQuestsForGoal,
  calculateQuestProgress,
  getWeekStart,
  getWeekEnd,
  formatDateKey,
  type Quest,
} from '../lib/quests'
import type { DailyLog } from '../lib/types'

function QuestCard({
  quest,
  progress,
  completed,
  onClaim,
}: {
  quest: Quest
  progress: number
  completed: boolean
  onClaim: () => void
}) {
  const pct = Math.min(100, (progress / quest.target) * 100)
  const ready = pct >= 100 && !completed

  return (
    <div
      className={`card p-4 transition-all duration-200 ${
        completed ? 'border-green-700 bg-green-900/10' : ready ? 'border-yellow-600 bg-yellow-900/10 glow-green-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {completed && <span className="text-green-400 text-sm">✓</span>}
            <h3 className="font-pixel text-white" style={{ fontSize: '0.55rem' }}>
              {quest.title}
            </h3>
          </div>
          <p className="text-xs text-gray-400">{quest.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-pixel text-yellow-400" style={{ fontSize: '0.5rem' }}>
            +{quest.xpReward}
          </p>
          <p className="text-xs text-gray-500">XP</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>
            {typeof progress === 'number' && progress % 1 !== 0
              ? progress.toFixed(1)
              : progress}{' '}
            / {quest.target}
          </span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completed ? 'bg-green-600' : pct >= 100 ? 'bg-yellow-400' : 'bg-green-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {ready && (
        <button
          onClick={onClaim}
          className="mt-2 w-full btn-primary py-2"
          style={{ fontSize: '0.5rem' }}
        >
          🎉 Claim {quest.xpReward} XP!
        </button>
      )}

      {completed && (
        <p className="text-xs text-green-600 mt-1 font-pixel" style={{ fontSize: '0.4rem' }}>
          ✓ COMPLETED
        </p>
      )}
    </div>
  )
}

export default function Quests() {
  const { user, profile, refreshProfile } = useAuth()
  const [weekLogs, setWeekLogs] = useState<DailyLog[]>([])
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  const weekStart = getWeekStart()
  const weekStartStr = formatDateKey(weekStart)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const weekEnd = getWeekEnd()

      const [logsRes, completionsRes] = await Promise.all([
        supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', weekStartStr)
          .lte('log_date', formatDateKey(weekEnd)),
        supabase
          .from('quest_completions')
          .select('quest_id')
          .eq('user_id', user.id)
          .eq('week_start', weekStartStr),
      ])

      setWeekLogs(logsRes.data ?? [])
      setCompletedQuestIds((completionsRes.data ?? []).map(c => c.quest_id))
      setLoading(false)
    }

    fetchData()
  }, [user, weekStartStr])

  const handleClaim = async (quest: Quest) => {
    if (!user || !profile || claiming) return
    setClaiming(quest.id)

    await supabase.from('quest_completions').insert({
      user_id: user.id,
      quest_id: quest.id,
      week_start: weekStartStr,
      xp_earned: quest.xpReward,
    })

    await supabase
      .from('profiles')
      .update({ total_xp: profile.total_xp + quest.xpReward })
      .eq('id', user.id)

    await refreshProfile()
    setCompletedQuestIds(prev => [...prev, quest.id])
    setClaiming(null)
  }

  if (loading || !profile?.goal) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <p className="font-pixel text-green-400 text-xs">Loading quests...</p>
      </div>
    )
  }

  const quests = getQuestsForGoal(profile.goal)
  const totalQuestXP = quests.reduce((s, q) => s + q.xpReward, 0)
  const earnedQuestXP = quests
    .filter(q => completedQuestIds.includes(q.id))
    .reduce((s, q) => s + q.xpReward, 0)

  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="page-container scrollable-content">
      <div className="px-4 pt-6">
        <h1 className="font-pixel text-green-400 text-xs mb-1">Weekly Quests</h1>
        <p className="text-gray-400 text-sm mb-1">Week of {weekLabel}</p>
        <p className="text-xs text-gray-500 mb-5">Resets every Monday • Earn bonus XP</p>

        {/* Quest XP summary */}
        <div className="card p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Quest XP earned</span>
          <span className="font-pixel text-yellow-400 text-xs">
            {earnedQuestXP} / {totalQuestXP} XP
          </span>
        </div>

        <div className="space-y-3">
          {quests.map(quest => {
            const progress = calculateQuestProgress(quest, weekLogs)
            const completed = completedQuestIds.includes(quest.id)

            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                progress={progress}
                completed={completed}
                onClaim={() => handleClaim(quest)}
              />
            )
          })}
        </div>

        <div className="card p-4 mt-4 border-l-4 border-l-green-700">
          <p className="font-pixel text-green-400 mb-1" style={{ fontSize: '0.45rem' }}>How quests work</p>
          <p className="text-xs text-gray-400">
            Complete quests to earn bonus XP on top of your daily logs. Quests reset every Monday morning. Log your activity daily to make progress!
          </p>
        </div>
      </div>

      <NavBar />
    </div>
  )
}
