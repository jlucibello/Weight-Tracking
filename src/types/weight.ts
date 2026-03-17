export interface WeightEntry {
  id: string
  entry_date: string // "YYYY-MM-DD"
  weight_lbs: number
  notes?: string
  created_at: string
}

export type NewWeightEntry = Pick<WeightEntry, 'entry_date' | 'weight_lbs'> & {
  notes?: string
}
