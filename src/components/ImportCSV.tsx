import { useState, useRef } from 'react'
import { parseWeightCSV } from '../utils/csvImport'
import type { NewWeightEntry } from '../types/weight'

interface Props {
  onImport: (entries: NewWeightEntry[]) => Promise<{ imported: number; error: string | null }>
}

export function ImportCSV({ onImport }: Props) {
  const [parsed, setParsed] = useState<{ entries: NewWeightEntry[]; skipped: number } | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setParseError(null)
    setParsed(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { entries, skipped, error } = parseWeightCSV(text)
      if (error) {
        setParseError(error)
      } else {
        setParsed({ entries, skipped })
      }
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!parsed) return
    setImporting(true)
    setResult(null)
    const { imported, error } = await onImport(parsed.entries)
    setImporting(false)
    if (error) {
      setResult(`Import failed: ${error}`)
    } else {
      setResult(`Import complete: ${imported} entries imported.`)
      setParsed(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Import from Google Sheets</h2>
      <p className="text-sm text-gray-500 mb-4">
        Export your sheet as CSV (File → Download → CSV), then upload it here. Duplicate dates will be updated, not duplicated.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {parseError && <p className="mt-3 text-sm text-red-600">{parseError}</p>}

      {parsed && (
        <div className="mt-4 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-700 mb-2">Preview (first 5 rows)</p>
            <table className="w-full text-xs text-gray-600">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 pr-4">Date</th>
                  <th className="text-left py-1">Weight (lbs)</th>
                </tr>
              </thead>
              <tbody>
                {parsed.entries.slice(0, 5).map((e, i) => (
                  <tr key={i}>
                    <td className="py-0.5 pr-4">{e.entry_date}</td>
                    <td className="py-0.5">{e.weight_lbs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-gray-500">
              {parsed.entries.length} rows ready to import
              {parsed.skipped > 0 && ` · ${parsed.skipped} rows skipped (missing or invalid data)`}
            </p>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors"
          >
            {importing ? `Importing...` : `Import ${parsed.entries.length} entries`}
          </button>
        </div>
      )}

      {result && (
        <p className={`mt-3 text-sm ${result.startsWith('Import failed') ? 'text-red-600' : 'text-green-600'}`}>
          {result}
        </p>
      )}
    </div>
  )
}
