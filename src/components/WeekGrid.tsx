import type { DailyLog } from '../lib/types'

interface WeekGridProps {
  logs: DailyLog[]
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getWeekDates(): string[] {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today)
  monday.setDate(diff)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

function isFuture(dateStr: string): boolean {
  return dateStr > new Date().toISOString().split('T')[0]
}

export function WeekGrid({ logs }: WeekGridProps) {
  const weekDates = getWeekDates()
  const loggedDates = new Set(logs.map(l => l.log_date))

  return (
    <div className="card p-4">
      <h2 className="font-pixel text-green-400 text-xs mb-4">This Week</h2>
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, i) => {
          const logged = loggedDates.has(date)
          const today = isToday(date)
          const future = isFuture(date)

          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-gray-500 font-pixel" style={{ fontSize: '0.45rem' }}>
                {DAYS[i]}
              </span>
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  border-2 transition-all duration-200
                  ${logged
                    ? 'bg-green-500 border-green-400 glow-green-sm'
                    : today
                    ? 'border-green-600 border-dashed bg-green-900/20'
                    : future
                    ? 'border-gray-800 bg-transparent'
                    : 'border-gray-700 bg-gray-900/30'
                  }
                `}
              >
                {logged ? '✓' : today ? '•' : ''}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        {loggedDates.size} / 7 days logged
      </p>
    </div>
  )
}
