import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Weight Tracker</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {children}
      </main>
    </div>
  )
}
