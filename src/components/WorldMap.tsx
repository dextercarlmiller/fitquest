import { getZone } from '../lib/xp'

interface Zone {
  id: number
  name: string
  emoji: string
  shortName: string
  unlockLevel: number
}

const ZONES: Zone[] = [
  { id: 1, name: 'Mushroom Plains', emoji: '🍄', shortName: 'Plains', unlockLevel: 1 },
  { id: 2, name: 'Boulder Ridge', emoji: '🪨', shortName: 'Ridge', unlockLevel: 3 },
  { id: 3, name: 'Crystal Caves', emoji: '💎', shortName: 'Caves', unlockLevel: 6 },
  { id: 4, name: 'Volcano Peak', emoji: '🌋', shortName: 'Volcano', unlockLevel: 10 },
  { id: 5, name: 'Sky Fortress', emoji: '⚡', shortName: 'Sky', unlockLevel: 15 },
]

interface WorldMapProps {
  totalXp: number
}

export function WorldMap({ totalXp }: WorldMapProps) {
  const currentZone = getZone(Math.floor(totalXp / 500) + 1)

  return (
    <div className="card p-4 overflow-hidden">
      <h2 className="font-pixel text-green-400 text-xs mb-1">World Map</h2>
      <p className="text-xs text-gray-500 mb-4">
        {ZONES[currentZone - 1].name}
      </p>

      <div className="relative">
        {/* Path line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-900 to-transparent" />
        <div
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000"
          style={{ width: `${((currentZone - 1) / 4) * 100}%` }}
        />

        {/* Zone nodes */}
        <div className="relative flex justify-between items-start px-1">
          {ZONES.map((zone) => {
            const isUnlocked = zone.id <= currentZone
            const isCurrent = zone.id === currentZone

            return (
              <div key={zone.id} className="flex flex-col items-center gap-1.5" style={{ width: '18%' }}>
                <div
                  className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center text-xl
                    border-2 transition-all duration-300
                    ${isCurrent
                      ? 'border-green-400 bg-green-900/40 animate-pulse-glow'
                      : isUnlocked
                      ? 'border-green-700 bg-green-900/20'
                      : 'border-gray-700 bg-gray-900/50'
                    }
                  `}
                >
                  <span className={isUnlocked ? '' : 'grayscale opacity-40'}>
                    {zone.emoji}
                  </span>
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm">🧙</span>
                  )}
                  {!isUnlocked && (
                    <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 rounded-full w-4 h-4 flex items-center justify-center border border-gray-600">
                      🔒
                    </span>
                  )}
                </div>
                <span
                  className={`font-pixel text-center leading-tight ${
                    isCurrent ? 'text-green-400' : isUnlocked ? 'text-gray-400' : 'text-gray-600'
                  }`}
                  style={{ fontSize: '0.38rem' }}
                >
                  {zone.shortName}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current zone info */}
      <div className="mt-4 pt-3 border-t border-green-900/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-pixel text-green-400" style={{ fontSize: '0.5rem' }}>
              Zone {currentZone}: {ZONES[currentZone - 1].name}
            </p>
            {currentZone < 5 && (
              <p className="text-xs text-gray-500 mt-1">
                Reach Level {ZONES[currentZone].unlockLevel} to unlock {ZONES[currentZone].name}
              </p>
            )}
          </div>
          {currentZone === 5 && (
            <span className="text-xs text-yellow-400 font-pixel" style={{ fontSize: '0.4rem' }}>MAX ZONE!</span>
          )}
        </div>
      </div>
    </div>
  )
}
