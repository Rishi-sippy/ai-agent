'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

type Source = {
  title: string
  url: string
}

export default function AIResearchDashboard() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSearch = () => {
    if (!query) return

    setMessages((prev) => [...prev, { role: 'user', content: query }])
    setIsStreaming(true)

    let fullText = ''

    const eventSource = new EventSource(`http://127.0.0.1:8000/research-stream?query=${encodeURIComponent(query)}`)

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        setIsStreaming(false)
        eventSource.close()
        return
      }

      fullText += event.data

      setMessages((prev) => {
        const updated = [...prev]
        if (updated[updated.length - 1]?.role === 'assistant') {
          updated[updated.length - 1].content = fullText
        } else {
          updated.push({ role: 'assistant', content: fullText })
        }
        return updated
      })
    }

    setQuery('')
  }

  // 🔥 EXTRACT SOURCES FROM TEXT
  const extractSources = (text: string): Source[] => {
    const regex = /• (.*?) \((https?:\/\/.*?)\)/g
    const sources: Source[] = []
    let match

    while ((match = regex.exec(text)) !== null) {
      sources.push({
        title: match[1],
        url: match[2]
      })
    }

    return sources
  }

  return (
    <div className="flex h-screen bg-[#0B1120] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6">
        <h1 className="text-xl font-bold">ResearchOS</h1>
        <div className="mt-10 space-y-3 text-sm text-gray-400">
          <div className="bg-white/10 p-3 rounded-xl">Dashboard</div>
          <div>Research Studio</div>
          <div>Reports</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <div className="p-6 border-b border-white/10 text-2xl font-bold">AI Research Agent</div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => {
            const sources = msg.role === 'assistant' ? extractSources(msg.content) : []

            return (
              <div key={i} className="space-y-4">
                {/* Message bubble */}
                <div className={`max-w-3xl p-4 rounded-2xl ${msg.role === 'user' ? 'ml-auto bg-white text-black' : 'bg-white/5 border border-white/10'}`}>{msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}</div>

                {/* 🔥 SOURCES UI */}
                {sources.length > 0 && (
                  <div className="max-w-3xl space-y-3">
                    <p className="text-sm text-gray-400">Sources</p>

                    <div className="grid gap-3">
                      {sources.map((src, idx) => (
                        <a key={idx} href={src.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
                          <p className="font-medium">{src.title}</p>
                          <p className="text-xs text-gray-400 truncate">{src.url}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask anything..." className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 outline-none" />
          <button onClick={handleSearch} className="px-6 rounded-xl bg-white text-black font-medium">
            Send
          </button>
        </div>
      </main>
    </div>
  )
}
