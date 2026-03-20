import { useState } from 'react'
import type { NewWeightEntry } from '../types/weight'

interface Props {
  onAdd: (entry: NewWeightEntry) => Promise<string | null>
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function LogEntryForm({ onAdd }: Props) {
  const [date, setDate] = useState(todayISO())
  const [weight, setWeight] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const w = parseFloat(weight)
    if (!date) return setError('Please select a date.')
    if (isNaN(w) || w <= 0) return setError('Please enter a valid weight.')

    setSubmitting(true)
    const err = await onAdd({ entry_date: date, weight_lbs: w })
    setSubmitting(false)

    if (err) {
      setError(err)
    } else {
      setSuccess(true)
      setWeight('')
      setDate(todayISO())
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Weight</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-gray-600 font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-gray-600 font-medium">Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            min="50"
            max="600"
            placeholder="e.g. 185.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1 justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-6 py-2 text-sm transition-colors"
          >
            {submitting ? 'Saving...' : 'Log'}
          </button>
        </div>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-4 bg-white rounded-2xl px-16 py-12 shadow-2xl">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-semibold text-gray-900">Weight submitted</p>
          </div>
        </div>
      )}
    </div>
  )
}
