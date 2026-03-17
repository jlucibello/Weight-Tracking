import type { WeightEntry } from '../types/weight'

export type DateRange = 'week' | 'month' | 'year' | 'all'

export function filterByRange(entries: WeightEntry[], range: DateRange): WeightEntry[] {
  if (range === 'all') return entries
  const now = new Date()
  const cutoff = new Date(now)
  if (range === 'week') cutoff.setDate(now.getDate() - 7)
  if (range === 'month') cutoff.setMonth(now.getMonth() - 1)
  if (range === 'year') cutoff.setFullYear(now.getFullYear() - 1)
  return entries.filter((e) => new Date(e.entry_date + 'T00:00:00') >= cutoff)
}
