'use client'

import { useState, useEffect } from 'react'

export default function AIResearchDashboard() {
  const [query, setQuery] = useState('')
  const [streamText, setStreamText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = () => {
    if (!query) return

    setStreamText('')
    setIsStreaming(true)

    const eventSource = new EventSource(`http://127.0.0.1:8000/research-stream?query=${encodeURIComponent(query)}`)

    eventSource.onmessage = (event) => {
      setStreamText((prev) => prev + event.data)
    }

    eventSource.onerror = () => {
      eventSource.close()
      setIsStreaming(false)
    }
  }

  if (!mounted) return null // 🔥 prevents hydration error

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid grid-cols-12">
        {/* Sidebar */}
        <aside className="col-span-2 border-r border-white/10 min-h-screen p-6">
          <h1 className="text-xl font-semibold">ResearchOS</h1>
          <div className="mt-10 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl bg-white/5 px-4 py-3">Dashboard</div>
            <div className="px-4 py-3">Research Studio</div>
            <div className="px-4 py-3">Reports</div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-10 p-8">
          <h2 className="text-3xl font-bold">AI Research Agent</h2>

          {/* Input */}
          <div className="mt-8 flex gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Research anything..." className="flex-1 rounded-2xl bg-slate-900 border border-white/10 p-4 outline-none focus:ring-2 focus:ring-white/20" />

            <button onClick={handleSearch} className="rounded-2xl bg-white text-black px-6 font-semibold transition hover:scale-105 active:scale-95">
              {isStreaming ? 'Thinking...' : 'Search'}
            </button>
          </div>

          {/* Status */}
          {isStreaming && <div className="mt-4 text-sm text-slate-400 animate-pulse">⚡ Agent is working...</div>}

          {/* Output */}
          {(streamText || isStreaming) && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Live Research</h3>

              <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                {streamText}
                {isStreaming && <span className="animate-pulse">|</span>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
