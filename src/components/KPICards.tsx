import type { KPIs } from '../utils/kpi'

interface Props {
  kpis: KPIs
}

interface ChangeCardProps {
  label: string
  change: { lbs: number; pct: number } | null
}

function ChangeCard({ label, change }: ChangeCardProps) {
  const isGain = change && change.lbs > 0
  const isLoss = change && change.lbs < 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      {change === null ? (
        <p className="text-xl font-bold text-gray-400">N/A</p>
      ) : (
        <>
          <p className={`text-xl font-bold ${isLoss ? 'text-green-600' : isGain ? 'text-red-500' : 'text-gray-700'}`}>
            {change.lbs > 0 ? '+' : ''}{change.lbs} lbs
          </p>
          <p className={`text-sm ${isLoss ? 'text-green-500' : isGain ? 'text-red-400' : 'text-gray-400'}`}>
            {change.pct > 0 ? '+' : ''}{change.pct}%
          </p>
        </>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | null
  unit?: string
}

function StatCard({ label, value, unit = 'lbs' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      {value === null ? (
        <p className="text-xl font-bold text-gray-400">N/A</p>
      ) : (
        <p className="text-xl font-bold text-gray-900">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
      )}
    </div>
  )
}

export function KPICards({ kpis }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <ChangeCard label="Month" change={kpis.mom} />
      <ChangeCard label="Quarter" change={kpis.qoq} />
      <ChangeCard label="Year" change={kpis.yoy} />
      <StatCard label="All-time Max" value={kpis.max} />
      <StatCard label="All-time Min" value={kpis.min} />
    </div>
  )
}
