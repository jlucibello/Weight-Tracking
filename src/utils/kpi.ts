import type { WeightEntry } from '../types/weight'

function subDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

function closestEntry(entries: WeightEntry[], targetDate: Date, toleranceDays: number): WeightEntry | null {
  const targetMs = targetDate.getTime()
  const toleranceMs = toleranceDays * 86_400_000
  const candidates = entries.filter(
    (e) => Math.abs(new Date(e.entry_date + 'T00:00:00').getTime() - targetMs) <= toleranceMs
  )
  if (!candidates.length) return null
  return candidates.reduce((best, e) => {
    const eDiff = Math.abs(new Date(e.entry_date + 'T00:00:00').getTime() - targetMs)
    const bestDiff = Math.abs(new Date(best.entry_date + 'T00:00:00').getTime() - targetMs)
    return eDiff < bestDiff ? e : best
  })
}

export interface KPIs {
  current: number | null
  mom: { lbs: number; pct: number } | null
  qoq: { lbs: number; pct: number } | null
  yoy: { lbs: number; pct: number } | null
  max: number | null
  min: number | null
}

export function computeKPIs(entries: WeightEntry[]): KPIs {
  if (!entries.length) {
    return { current: null, mom: null, qoq: null, yoy: null, max: null, min: null }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const current = entries[entries.length - 1].weight_lbs

  function change(baseline: WeightEntry | null) {
    if (!baseline) return null
    const lbs = parseFloat((current - baseline.weight_lbs).toFixed(1))
    const pct = parseFloat(((lbs / baseline.weight_lbs) * 100).toFixed(1))
    return { lbs, pct }
  }

  const momBase = closestEntry(entries, subDays(today, 30), 7)
  const qoqBase = closestEntry(entries, subDays(today, 91), 14)
  const yoyBase = closestEntry(entries, subDays(today, 365), 30)

  const weights = entries.map((e) => e.weight_lbs)

  return {
    current,
    mom: change(momBase),
    qoq: change(qoqBase),
    yoy: change(yoyBase),
    max: Math.max(...weights),
    min: Math.min(...weights),
  }
}
