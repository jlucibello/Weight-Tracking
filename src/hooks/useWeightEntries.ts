import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { WeightEntry, NewWeightEntry } from '../types/weight'

const CHUNK_SIZE = 500

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

  const importEntries = useCallback(async (entries: NewWeightEntry[]): Promise<{ imported: number; error: string | null }> => {
    let imported = 0
    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      const chunk = entries.slice(i, i + CHUNK_SIZE)
      const { error } = await supabase
        .from('weight_entries')
        .upsert(chunk, { onConflict: 'entry_date' })
      if (error) return { imported, error: error.message }
      imported += chunk.length
    }
    await fetchEntries()
    return { imported, error: null }
  }, [fetchEntries])

  return { entries, loading, error, addEntry, importEntries }
}
