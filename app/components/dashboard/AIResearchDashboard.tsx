'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AIResearchDashboard() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSearch = () => {
    if (!query) return

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: getTime()
    }

    setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '', timestamp: getTime() }])

    setIsStreaming(true)

    let fullText = ''

    const eventSource = new EventSource(`http://127.0.0.1:8000/research-stream?query=${encodeURIComponent(query)}`)

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close()
        setIsStreaming(false)
        return
      }

      fullText += event.data

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1].content = fullText
        return updated
      })
    }

    setQuery('')
  }

  return (
    <div className="h-screen flex bg-[#030712] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-transparent blur-3xl opacity-40" />

      {/* Sidebar */}
      <aside className="w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 p-6 z-10">
        <h1 className="text-xl font-semibold">ResearchOS</h1>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col z-10">
        {/* Header */}
        <div className="p-6 border-b border-white/10 backdrop-blur-xl bg-white/5">
          <h2 className="text-2xl font-semibold">AI Research Agent</h2>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* AI Avatar */}
              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">AI</div>}

              {/* Message */}
              <div className="max-w-2xl">
                <div
                  className={`
                    px-5 py-4 rounded-2xl text-sm leading-relaxed backdrop-blur-xl border
                    ${msg.role === 'user' ? 'bg-white text-black border-white/20' : 'bg-white/5 border-white/10'}
                  `}
                >
                  {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                </div>

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-1 px-1">{msg.timestamp}</p>
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">You</div>}
            </div>
          ))}

          {/* Thinking */}
          {isStreaming && <div className="text-sm text-gray-400 animate-pulse">⚡ Thinking...</div>}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-6 backdrop-blur-xl bg-white/5 border-t border-white/10">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask anything..." className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-purple-500/40" />

            <button onClick={handleSearch} className="px-6 rounded-2xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 transition">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
