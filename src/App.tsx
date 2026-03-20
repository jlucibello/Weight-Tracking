import { useState } from 'react'
import { Layout } from './components/Layout'
import { LogEntryForm } from './components/LogEntryForm'
import { KPICards } from './components/KPICards'
import { ChartFilters } from './components/ChartFilters'
import { WeightChart } from './components/WeightChart'
import { useWeightEntries } from './hooks/useWeightEntries'
import { useKPIs } from './hooks/useKPIs'
import type { DateRange } from './utils/dateHelpers'

export default function App() {
  const { entries, loading, error, addEntry, deleteEntry } = useWeightEntries()
  const kpis = useKPIs(entries)
  const [range, setRange] = useState<DateRange>('month')
  const [view, setView] = useState<'chart' | 'table'>('chart')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 text-sm">
        Failed to connect to database: {error}
      </div>
    )
  }

  return (
    <Layout>
      <LogEntryForm onAdd={addEntry} />
      <KPICards kpis={kpis} />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <ChartFilters range={range} onRangeChange={setRange} />
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('chart')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'chart' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:text-blue-600'}`}
            >
              Chart
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:text-blue-600'}`}
            >
              Table
            </button>
          </div>
        </div>
        <WeightChart entries={entries} range={range} view={view} onDelete={deleteEntry} />
      </div>
    </Layout>
  )
}
