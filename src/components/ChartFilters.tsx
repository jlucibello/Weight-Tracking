import type { DateRange } from '../utils/dateHelpers'

interface Props {
  range: DateRange
  onRangeChange: (range: DateRange) => void
}

const RANGES: { label: string; value: DateRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'All', value: 'all' },
]

export function ChartFilters({ range, onRangeChange }: Props) {
  return (
    <div className="flex gap-2">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onRangeChange(r.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            range === r.value
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
