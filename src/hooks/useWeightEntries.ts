import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { WeightEntry, NewWeightEntry } from '../types/weight'

export function useWeightEntries() {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .order('entry_date', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setEntries(data as WeightEntry[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const addEntry = useCallback(async (entry: NewWeightEntry): Promise<string | null> => {
    const { error } = await supabase.from('weight_entries').insert(entry)
    if (error) {
      if (error.code === '23505') return 'An entry for this date already exists.'
      return error.message
    }
    await fetchEntries()
    return null
  }, [fetchEntries])

  const deleteEntry = useCallback(async (id: string): Promise<string | null> => {
    const { error } = await supabase.from('weight_entries').delete().eq('id', id)
    if (error) return error.message
    await fetchEntries()
    return null
  }, [fetchEntries])

  return { entries, loading, error, addEntry, deleteEntry }
}
