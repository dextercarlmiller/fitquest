interface StatCardProps {
  label: string
  value: string | number
  emoji: string
  sub?: string
}

export function StatCard({ label, value, emoji, sub }: StatCardProps) {
  return (
    <div className="card p-3 flex flex-col items-center text-center gap-1">
      <span className="text-2xl">{emoji}</span>
      <span className="font-pixel text-green-400 text-sm">{value}</span>
      <span className="text-xs text-gray-400 leading-tight">{label}</span>
      {sub && <span className="text-xs text-gray-600">{sub}</span>}
    </div>
  )
}
