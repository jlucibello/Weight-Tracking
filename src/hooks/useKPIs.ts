import { useMemo } from 'react'
import type { WeightEntry } from '../types/weight'
import { computeKPIs } from '../utils/kpi'

export function useKPIs(entries: WeightEntry[]) {
  return useMemo(() => computeKPIs(entries), [entries])
}
