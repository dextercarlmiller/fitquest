import { getLevel, getXpProgress } from '../lib/xp'

interface XPBarProps {
  totalXp: number
  animated?: boolean
}

export function XPBar({ totalXp, animated = true }: XPBarProps) {
  const level = getLevel(totalXp)
  const { current, needed, percentage } = getXpProgress(totalXp)

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span className="font-pixel text-green-400 text-xs">LVL {level}</span>
        </div>
        <span className="text-xs text-gray-400">
          {current} / {needed} XP
        </span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div
          className={`h-full bg-gradient-to-r from-green-500 to-lime-400 rounded-full transition-all duration-1000 ease-out ${animated ? 'xp-bar-fill' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-600">Level {level}</span>
        <span className="text-xs text-gray-600">Level {level + 1}</span>
      </div>
    </div>
  )
}
