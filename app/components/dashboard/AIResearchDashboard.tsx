'use client'

import { api } from '@/app/lib/api'
import { useState } from 'react'

export default function AIResearchDashboard() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSearch = async () => {
    if (!query) return

    setLoading(true)
    try {
      const res = await api.post('/research', { query })
      setResult(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const recentReports = [
    { title: 'Smart Traffic AI Market in India', status: 'Completed', date: '2h ago' },
    { title: 'Writesonic Competitor Intelligence', status: 'Processing', date: '6h ago' },
    { title: 'China Road UI Mapping Research', status: 'Completed', date: 'Yesterday' }
  ]

  const liveSteps = ['Planning research scope', 'Searching trusted web sources', 'Comparing competitors', 'Generating executive summary']

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid grid-cols-12">
        {/* Sidebar */}
        <aside className="col-span-2 border-r border-white/10 min-h-screen p-6">
          <h1 className="text-xl font-semibold tracking-tight">ResearchOS</h1>
          <div className="mt-10 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl bg-white/5 px-4 py-3">Dashboard</div>
            <div className="px-4 py-3">Research Studio</div>
            <div className="px-4 py-3">Reports</div>
            <div className="px-4 py-3">Team Workspace</div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">AI Research Agent</h2>
              <p className="mt-2 text-slate-400">Turn raw web data into boardroom-ready reports.</p>
            </div>
            <button className="rounded-2xl bg-white text-slate-900 px-5 py-3 text-sm font-semibold shadow-2xl">New Research</button>
          </div>

          {/* Prompt Box (UPDATED) */}
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400 mb-3">What would you like to research?</p>

            <div className="flex gap-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Research smart traffic vendors in India..." className="flex-1 rounded-2xl bg-slate-900 border border-white/10 p-4 outline-none text-white" />

              <button onClick={handleSearch} className="rounded-2xl bg-white text-slate-900 px-6 font-semibold">
                {loading ? 'Thinking...' : 'Search'}
              </button>
            </div>
          </div>

          {/* RESULT SECTION (NEW 🔥) */}
          {result && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold">Summary</h3>
                <p className="mt-3 text-slate-300 whitespace-pre-line">{result.summary}</p>
              </div>

              {/* Sources */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Sources</h3>

                <div className="mt-4 space-y-3">
                  {result.sources?.map((s: any, i: number) => (
                    <a key={i} href={s.url} target="_blank" className="block rounded-2xl border border-white/10 bg-slate-900/60 p-4 hover:bg-slate-800">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-slate-400 truncate">{s.url}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            {[
              ['24', 'Reports Generated'],
              ['91%', 'Source Accuracy'],
              ['12', 'Saved Workspaces']
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="text-3xl font-bold">{value}</div>
                <div className="mt-2 text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Bottom Grid */}
          <div className="mt-8 grid grid-cols-12 gap-6">
            {/* Recent Reports */}
            <section className="col-span-7 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Recent Reports</h3>
              <div className="mt-4 space-y-4">
                {recentReports.map((report) => (
                  <div key={report.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-slate-400">{report.date}</p>
                    </div>
                    <span className="text-xs rounded-full bg-white/10 px-3 py-1 text-slate-300">{report.status}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Workflow */}
            <section className="col-span-5 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Live Agent Workflow</h3>
              <div className="mt-4 space-y-3">
                {liveSteps.map((step, idx) => (
                  <div key={step} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-sm text-slate-300">Step {idx + 1}</p>
                    <p className="mt-1 font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
