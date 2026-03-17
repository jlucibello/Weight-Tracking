import type { NewWeightEntry } from '../types/weight'

function parseFlexibleDate(raw: string): string | null {
  const trimmed = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  // M/D/YYYY or MM/DD/YYYY
  const parts = trimmed.split('/')
  if (parts.length === 3) {
    const [m, d, y] = parts.map(Number)
    if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }

  // Try native Date parsing as fallback
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear()
    const m = parsed.getMonth() + 1
    const d = parsed.getDate()
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  return null
}

export interface ParseResult {
  entries: NewWeightEntry[]
  skipped: number
  error: string | null
}

export function parseWeightCSV(csvText: string): ParseResult {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) return { entries: [], skipped: 0, error: 'CSV file is empty or has no data rows.' }

  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''))
  const dateIdx = headers.findIndex((h) => h.includes('date'))
  const weightIdx = headers.findIndex((h) => h.includes('weight'))

  if (dateIdx === -1 || weightIdx === -1) {
    return { entries: [], skipped: 0, error: 'CSV must have columns named "date" and "weight".' }
  }

  const entries: NewWeightEntry[] = []
  let skipped = 0

  for (const line of lines.slice(1)) {
    if (!line.trim()) { skipped++; continue }
    const cols = line.split(',').map((c) => c.trim().replace(/"/g, ''))
    const rawDate = cols[dateIdx]
    const rawWeight = cols[weightIdx]

    if (!rawDate || !rawWeight) { skipped++; continue }

    const entry_date = parseFlexibleDate(rawDate)
    const weight_lbs = parseFloat(rawWeight)

    if (!entry_date || isNaN(weight_lbs) || weight_lbs <= 0) { skipped++; continue }

    entries.push({ entry_date, weight_lbs })
  }

  return { entries, skipped, error: null }
}
