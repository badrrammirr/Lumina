import React, { useState, useRef, useEffect } from 'react'
import { askQuestion } from '../api/api'
import { useApp } from '../context/AppContext'
import ChatBubble from '../components/ChatBubble'
import { HiOutlinePaperAirplane, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'
import { motion } from 'framer-motion'

export default function AskPage() {
  const { pdfs, isAuthorized } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')
  const endRef = useRef(null)

  // Reset messages when user logs out
  useEffect(() => {
    if (!isAuthorized) {
      setMessages([])
      setInput('')
      setSource('')
    }
  }, [isAuthorized])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const q = input.trim()
    setInput('')
    setMessages(prev => [...prev, { text: q, isUser: true }])
    setLoading(true)
    try {
      const res = await askQuestion(q, 3, source || null)
      setMessages(prev => [...prev, { text: res.answer, isUser: false, sources: res.sources }])
    } catch (err) {
      setMessages(prev => [...prev, { text: '⚠️ Error: Could not establish neural link.', isUser: false }])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7rem)]">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight">Neural Chat</h1>
          <p className="text-sm text-gray-500 mt-1">Interrogate your documents with contextual AI.</p>
        </div>
        <select
          value={source}
          onChange={e => setSource(e.target.value)}
          className="input-field w-auto text-sm bg-white/[0.03] border-white/[0.08]"
        >
          <option value="">All Documents</option>
          {pdfs.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0">

        {/* Empty State */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center max-w-sm">
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                {/* Background Glow Rings */}
                <div className="absolute inset-0 rounded-3xl bg-cyan-500/10 animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center backdrop-blur-sm">
                  <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Ready to Query</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Select a document and ask a question to illuminate the answers hidden in your text.
              </p>
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m.text} isUser={m.isUser} sources={m.sources} />
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="glass px-5 py-4 rounded-2xl rounded-bl-md border border-white/[0.06]" style={{ boxShadow: '0 0 20px rgba(34,211,238,0.05)' }}>
              <div className="flex gap-1.5 items-center h-5">
                <span className="typing-dot w-2 h-2 bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 6px rgba(34,211,238,0.4)' }} />
                <span className="typing-dot w-2 h-2 bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 6px rgba(34,211,238,0.4)' }} />
                <span className="typing-dot w-2 h-2 bg-cyan-400 rounded-full" style={{ boxShadow: '0 0 6px rgba(34,211,238,0.4)' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Premium Input Terminal */}
      <div className="mt-4 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm"></div>

        <div className="relative flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2 backdrop-blur-xl transition-all duration-300 group-focus-within:border-cyan-500/30 group-focus-within:bg-white/[0.05]">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none disabled:opacity-50"
            disabled={loading}
          />

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95"
          >
            <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
          </button>
        </div>
      </div>
    </div>
  )
}