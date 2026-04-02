'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function AIResearchDashboard() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [mounted, setMounted] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 🔥 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSearch = () => {
    if (!query) return

    const userMessage: Message = { role: 'user', content: query }

    setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '' }])
    setQuery('')
    setIsStreaming(true)

    const eventSource = new EventSource(`http://127.0.0.1:8000/research-stream?query=${encodeURIComponent(query)}`)

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close()
        setIsStreaming(false)
        return
      }

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1].content += event.data
        return updated
      })
    }

    eventSource.onerror = () => {
      eventSource.close()
      setIsStreaming(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 hidden md:block">
        <h1 className="text-xl font-semibold">ResearchOS</h1>

        <div className="mt-10 space-y-3 text-sm text-slate-400">
          <div className="bg-white/5 px-4 py-3 rounded-xl">Dashboard</div>
          <div className="px-4 py-3">Research Studio</div>
          <div className="px-4 py-3">Reports</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-semibold">AI Research Agent</h2>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-5 py-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-white text-black' : 'bg-white/5 border border-white/10'}`}>
                {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          ))}

          {/* Typing cursor */}
          {isStreaming && <div className="text-slate-500 text-sm">⚡ Thinking...</div>}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-[#111827] border border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-white/20" />

            <button onClick={handleSearch} className="bg-white text-black px-6 rounded-2xl font-semibold hover:scale-105 transition">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
