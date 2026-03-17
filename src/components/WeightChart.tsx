import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { WeightEntry } from '../types/weight'
import type { DateRange } from '../utils/dateHelpers'
import { filterByRange } from '../utils/dateHelpers'

interface Props {
  entries: WeightEntry[]
  range: DateRange
}

function formatDate(dateStr: string, range: DateRange): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (range === 'week') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (range === 'month') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (range === 'year') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function WeightChart({ entries, range }: Props) {
  const filtered = filterByRange(entries, range)

  const data = filtered.map((e) => ({
    date: formatDate(e.entry_date, range),
    fullDate: e.entry_date,
    weight: e.weight_lbs,
  }))

  const showDots = range === 'week' || range === 'month'

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center h-64 text-gray-400 text-sm">
        No data for this time period.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['dataMin - 2', 'dataMax + 2']}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
            width={40}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
            formatter={(value) => [`${value} lbs`, 'Weight']}
            labelFormatter={(label) => label}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#2563eb"
            strokeWidth={2}
            dot={showDots ? { r: 3, fill: '#2563eb' } : false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
