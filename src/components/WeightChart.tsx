import { useState } from 'react'
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
  view: 'chart' | 'table'
  onDelete: (id: string) => Promise<string | null>
}

function formatDate(dateStr: string, range: DateRange): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (range === 'week' || range === 'month' || range === 'year') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatFull(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function isWithinPastWeek(dateStr: string): boolean {
  const entryDate = new Date(dateStr + 'T00:00:00')
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  cutoff.setHours(0, 0, 0, 0)
  return entryDate >= cutoff
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

interface ConfirmModalProps {
  entry: WeightEntry
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}

function ConfirmModal({ entry, onConfirm, onCancel, deleting }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove entry?</h3>
        <p className="text-sm text-gray-500 mb-6">
          This will permanently delete the entry for{' '}
          <span className="font-medium text-gray-700">{formatFull(entry.entry_date)}</span>{' '}
          ({entry.weight_lbs} lbs).
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {deleting ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// cx/cy are SVG coords; container has p-6 (24px) padding so we offset by that
const CHART_PADDING = 24

interface DotProps {
  cx?: number
  cy?: number
  payload?: { entry: WeightEntry }
  showAlways?: boolean
  onPin: (entry: WeightEntry, x: number, y: number) => void
}

function CustomDot({ cx, cy, payload, showAlways, onPin }: DotProps) {
  const entry = payload?.entry
  if (!entry || cx == null || cy == null) return null
  const deletable = isWithinPastWeek(entry.entry_date)
  if (!showAlways && !deletable) return null

  return (
    <g>
      <circle cx={cx} cy={cy} r={deletable ? 4 : 3} fill="#2563eb" />
      {deletable && (
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill="transparent"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation()
            onPin(entry, cx, cy)
          }}
        />
      )}
    </g>
  )
}

export function WeightChart({ entries, range, view, onDelete }: Props) {
  const [pinnedEntry, setPinnedEntry] = useState<WeightEntry | null>(null)
  const [pinnedPos, setPinnedPos] = useState<{ x: number; y: number } | null>(null)
  const [selected, setSelected] = useState<WeightEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = filterByRange(entries, range)

  function handlePin(entry: WeightEntry, cx: number, cy: number) {
    setPinnedEntry(entry)
    setPinnedPos({ x: cx + CHART_PADDING, y: cy + CHART_PADDING })
  }

  function clearPin() {
    setPinnedEntry(null)
    setPinnedPos(null)
  }

  async function handleConfirmDelete() {
    if (!selected) return
    setDeleting(true)
    await onDelete(selected.id)
    setDeleting(false)
    setSelected(null)
  }

  if (!filtered.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center h-64 text-gray-400 text-sm">
        No data for this time period.
      </div>
    )
  }

  if (view === 'table') {
    return (
      <>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Weight (lbs)</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const deletable = isWithinPastWeek(e.entry_date)
                return (
                  <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-2.5 text-gray-700">{formatFull(e.entry_date)}</td>
                    <td className="px-6 py-2.5 text-gray-700">{e.weight_lbs}</td>
                    <td className="px-6 py-2.5 text-right">
                      {deletable && (
                        <button
                          onClick={() => setSelected(e)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove entry"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {selected && (
          <ConfirmModal
            entry={selected}
            onConfirm={handleConfirmDelete}
            onCancel={() => setSelected(null)}
            deleting={deleting}
          />
        )}
      </>
    )
  }

  const showDots = range === 'week' || range === 'month'

  const data = filtered.map((e) => ({
    date: formatDate(e.entry_date, range),
    weight: e.weight_lbs,
    entry: e,
  }))

  return (
    <>
      <div className="relative bg-white rounded-xl border border-gray-200 p-6">
        {pinnedEntry && pinnedPos && (
          <div
            className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 flex items-center gap-3 text-sm pointer-events-auto"
            style={{
              left: pinnedPos.x,
              top: pinnedPos.y,
              transform: 'translate(-50%, calc(-100% - 10px))',
            }}
          >
            <div className="leading-tight">
              <p className="text-xs text-gray-500">{formatFull(pinnedEntry.entry_date)}</p>
              <p className="font-medium text-gray-900">{pinnedEntry.weight_lbs} lbs</p>
            </div>
            <button
              onClick={() => { setSelected(pinnedEntry); clearPin() }}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Remove entry"
            >
              <TrashIcon />
            </button>
            <button
              onClick={clearPin}
              className="text-gray-300 hover:text-gray-500 transition-colors text-base leading-none"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
            onClick={clearPin}
          >
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
            {!pinnedEntry && (
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                formatter={(value) => [`${value} lbs`, 'Weight']}
                labelFormatter={(label) => label}
              />
            )}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#2563eb"
              strokeWidth={2}
              dot={(props: any) => (
                <CustomDot {...props} showAlways={showDots} onPin={handlePin} />
              )}
              activeDot={(props: any) => (
                <CustomDot {...props} showAlways onPin={handlePin} />
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {selected && (
        <ConfirmModal
          entry={selected}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSelected(null)}
          deleting={deleting}
        />
      )}
    </>
  )
}
