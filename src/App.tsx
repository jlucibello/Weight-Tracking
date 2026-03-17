import { useState } from 'react'
import { Layout } from './components/Layout'
import { LogEntryForm } from './components/LogEntryForm'
import { KPICards } from './components/KPICards'
import { ChartFilters } from './components/ChartFilters'
import { WeightChart } from './components/WeightChart'
import { ImportCSV } from './components/ImportCSV'
import { useWeightEntries } from './hooks/useWeightEntries'
import { useKPIs } from './hooks/useKPIs'
import type { DateRange } from './utils/dateHelpers'

export default function App() {
  const { entries, loading, error, addEntry, importEntries } = useWeightEntries()
  const kpis = useKPIs(entries)
  const [range, setRange] = useState<DateRange>('month')

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
        <ChartFilters range={range} onRangeChange={setRange} />
        <WeightChart entries={entries} range={range} />
      </div>
      <ImportCSV onImport={importEntries} />
    </Layout>
  )
}
