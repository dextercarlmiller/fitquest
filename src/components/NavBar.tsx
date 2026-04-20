import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Map', emoji: '🗺️' },
  { to: '/log', label: 'Log', emoji: '📝' },
  { to: '/quests', label: 'Quests', emoji: '⚔️' },
  { to: '/achievements', label: 'Wins', emoji: '🏆' },
  { to: '/profile', label: 'Hero', emoji: '🧙' },
]

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-[420px] mx-auto">
        <div className="bg-[#0a1a0a] border-t-2 border-green-900/60 px-2 py-2">
          <div className="flex justify-around items-center">
            {NAV_ITEMS.map(({ to, label, emoji }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-green-900/40 text-green-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`
                }
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span className="font-pixel leading-none" style={{ fontSize: '0.35rem' }}>
                  {label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
